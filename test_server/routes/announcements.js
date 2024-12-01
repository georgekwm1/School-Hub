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
const { getUserData } = require('../helperFunctions');
const db = require('../connect');


const router = express.Router();

// Get course announcements
router.get('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
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
router.post('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;
  const { userId, title, details } = req.body;

  if (!userId || !title || !details) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

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
router.put('/announcements/:id', (req, res) => {
  const { id } = req.params;
  const { title, details } = req.body;

  const index = mockAnnouncements.findIndex((announcement) => announcement.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Announcement not found' });
  }

  mockAnnouncements[index].title = title;
  mockAnnouncements[index].body = details;

  res.status(200).json(mockAnnouncements[index]);
});

// Delete an announcement
router.delete('/announcements/:id', (req, res) => {
  const announcementId = req.params.id;
  const index = mockAnnouncements.findIndex((announcement) => announcement.id === announcementId);

  if (index === -1) {
    return res.status(404).send({ message: 'Announcement not found' });
  }
  mockAnnouncements.splice(index, 1);
  res.status(200).json({ message: 'Announcement deleted successfully' });
});

module.exports = router
