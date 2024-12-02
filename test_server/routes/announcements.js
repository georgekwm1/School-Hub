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
const { getUserData, isCourseAdmin, isUserEnroledInCourse } = require('../helperFunctions');
const db = require('../connect');
const { verifyToken } = require('../middlewares/authMiddlewares');


const router = express.Router();

// Get course announcements
router.get('/courses/:id/announcements', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.userId;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
  }

  if (!isUserEnroledInCourse(userId, courseId)) {
    return res.status(403).send({ message: 'User is not enrolled in this course' });
  }

  const announcements = db
    .prepare(
      `
      SELECT * FROM announcements
        WHERE courseId = ?
        ORDER BY createdAt DESC;
      `
    )
    .all(courseId);

  const results = announcements.map((announcement) => {
    const user = getUserData(announcement.userId);
    delete announcement.userId
    // I'm going to leave createdAt there.. may be will be shown
    // besides the updatedAt
    return {
      ...announcement,
      user,
    };
  });

  res.json(results);
});

// Create a course announcement
router.post('/courses/:id/announcements', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const { title, details } = req.body;
  const userId = req.userId;

  if (!title || !details) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  
  if (!isCourseAdmin(userId, courseId)) return res.status(403).send({ message: 'User is not a course admin' });

  try {
    const id = uuidv4();
    db.prepare(
      `
      INSERT INTO announcements (id, courseId, userId, title, body)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      courseId,
      userId,
      title,
      details,
    );

    const user = getUserData(userId);
    const newAnnouncement = db.prepare(
      'SELECT * FROM announcements WHERE id = ?'
    ).get(id);
    delete newAnnouncement.userId

    res.status(201).json({
      ...newAnnouncement,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit an announcement
router.put('/announcements/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, details } = req.body;
  const userId = req.userId;

  try {
    const { courseId } = db.prepare('SELECT courseId FROM announcements WHERE id = ?').get(id);
    if (!courseId) {
      return res.status(404).send({ message: 'Announcement not found' });
    }

    if (!isCourseAdmin(userId, courseId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }

    db.prepare('UPDATE announcements SET title = ?, body = ? WHERE id = ?').run(title, details, id);

    const updatedAnnouncement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
    const user = getUserData(updatedAnnouncement.userId);
    delete updatedAnnouncement.userId
    updatedAnnouncement.user = user;
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete an announcement
router.delete('/announcements/:id', verifyToken, (req, res) => {
  const announcementId = req.params.id;
  try {
    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(announcementId);
    if (!announcement) {
      return res.status(404).send({ message: 'Announcement not found' });
    }

    if (!isCourseAdmin(req.userId, announcement.courseId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }
    db.prepare('DELETE FROM announcements WHERE id = ?').run(announcementId);

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router
