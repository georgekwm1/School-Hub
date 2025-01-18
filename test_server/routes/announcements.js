const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('../mockData');
const {
  getUserData,
  isCourseAdmin,
  isUserEnroledInCourse,
  getCurrentTimeInDBFormat,
} = require('../helperFunctions');
const db = require('../connect');
const { verifyToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

// Get course announcements
router.get('/courses/:id/announcements', verifyToken, async(req, res) => {
  const courseId = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;

  try {
    const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    if (
      ! await isUserEnroledInCourse(userId, courseId) &&
      ! await isCourseAdmin(userId, courseId)
    ) {
      return res
        .status(403)
        .send({ message: 'User is not enrolled in this course' });
    }

    const query = `
        SELECT * FROM announcements
          WHERE courseId = ? 
          ${lastFetched ? 'AND createdAt > ?' : ''}
          ORDER BY createdAt DESC;
        `;
    const params = [courseId, ...(lastFetched ? [lastFetched] : [])];
    const announcements = await db.query(query, params);

    let results = [];
    for (const announcement of announcements) {
      const user = getUserData(announcement.userId);
      delete announcement.userId;
      // I'm going to leave createdAt there.. may be will be shown
      // besides the updatedAt
      results.push({
        ...announcement,
        user,
      });
    }

    res.json({
      announcements: results,
      lastFetched: getCurrentTimeInDBFormat(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Create a course announcement
router.post('/courses/:id/announcements', verifyToken, async (req, res) => {
  const courseId = req.params.id;
  const io = req.app.get('io');
  const { title, details } = req.body;
  const userId = req.userId;

  if (!title || !details) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    if (!await isCourseAdmin(userId, courseId))
      return res.status(403).send({ message: 'User is not a course admin' });

    const id = uuidv4();
    await db.query(
      `INSERT INTO announcements (id, courseId, userId, title, body)
      VALUES (?, ?, ?, ?, ?)`,
      [id, courseId, userId, title, details]
    );

    const user = await getUserData(userId);
    const [newAnnouncement] = await db.query(
      'SELECT * FROM announcements WHERE id = ?', [id]
    );
    delete newAnnouncement.userId;

    const lastFetched = getCurrentTimeInDBFormat();
    io.to(`announcements-${courseId}`)
      .except(`user-${userId}`)
      .emit('announcementCreated', {
        payload: newAnnouncement,
        userId,
        lastFetched,
      });

    res.status(201).json({
      ...newAnnouncement,
      lastFetched,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit an announcement
router.put('/announcements/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, details } = req.body;
  const io = req.app.get('io');
  const userId = req.userId;

  try {
    const [{ courseId }] = await db.query(
      'SELECT courseId FROM announcements WHERE id = ?', [id]
    );

    if (!courseId) {
      return res.status(404).send({ message: 'Announcement not found' });
    }

    if (!await isCourseAdmin(userId, courseId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }

    await db.query(
      'UPDATE announcements SET title = ?, body = ? WHERE id = ?',
      [title, details, id]
    );

    const [updatedAnnouncement] = await db.query(
      'SELECT * FROM announcements WHERE id = ?', [id]
    );
    const user = await getUserData(updatedAnnouncement.userId);
    delete updatedAnnouncement.userId;
    updatedAnnouncement.user = user;

    io.to(`announcements-${courseId}`)
      .except(`user-${userId}`)
      .emit('announcementUpdated', {
        payload: {
          updatedAnnouncement,
        },
      });

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete an announcement
router.delete('/announcements/:id', verifyToken, async (req, res) => {
  const announcementId = req.params.id;
  const userId = req.userId;
  const io = req.app.get('io');

  try {
    const [announcement] = await db.query(
      'SELECT * FROM announcements WHERE id = ?', [announcementId]
    );
    if (!announcement) {
      return res.status(404).send({ message: 'Announcement not found' });
    }

    const courseId = announcement.courseId;
    if (! await isCourseAdmin(userId, courseId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }
    await db.query('DELETE FROM announcements WHERE id = ?', [announcementId]);

    io.to(`announcements-${courseId}`)
      .except(`user-${userId}`)
      .emit('announcementDeleted', {
        payload: {
          announcementId,
        },
        userId,
      });
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

/**
 * I have doubts about 2 things..
 * 1. Whether I should put that couresId there..
 * 2. That RESTful nameing in the route?
 * also.. is this 'changes' word descriptive..
 * Sinse i'm talking about deletion and updates..
 * Is 'diff' better?
 */
router.post('/courses/:id/announcements/diff', verifyToken, async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.id;

  const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
  }

  // After thinking (haven't consulted someone).. I thikn this step is useless..
  // If the user already have the IDs and data. then he is ligid anyway.
  // Or not?,, but it means he is already logged in and have htings in his state cached
  if (
    ! await isUserEnroledInCourse(userId, courseId) &&
    ! await isCourseAdmin(userId, courseId)
  ) {
    return res
      .status(403)
      .send({ message: 'User is not enrolled in this course' });
  }

  // Just for ease of retrieverl.. Is this the right spelling?
  const announcements = new Map(
    req.body.map(
      // I think it's enough for now to put as value only the udpatedAt
      // Becuse this all what i'm expecting now anyway... so i don't have to
      // put all the object
      (entry) => [entry.id, entry.updatedAt]
    )
  );

  // This is stupid.. why looping.. '.length will do it for me.. and then double the stings
  // Yeah.. I miss things sometimes!
  const placeholders = Array.from(announcements.keys())
    .map(() => '?')
    .join(', ');
  const DBAnnouncements = await db.query(
    `SELECT * FROM announcements WHERE id IN (${placeholders})`,
    Array.from(announcements.keys())
  );

  const results = {
    updated: [],
    deleted: [],
  };

  for (const entry of DBAnnouncements) {
    /**
     * if it's updateAt nto the same..
     * add to the update
     *
     * and remove teh id from the map
     */
    // Remember.. the value is teh updatedAt
    if (announcements.get(entry.id) !== entry.updatedAt) {
      results.updated.push(entry);
    }

    announcements.delete(entry.id);
  }
  // Sinse we deleted all existing ids from the map
  // Now what are left.. are those who were not retrieved from the DB.
  // That means they were deleted
  results.deleted = Array.from(announcements.keys());

  res.status(200).json(results);
});

module.exports = router;
