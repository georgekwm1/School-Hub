const express = require('express');
const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('../mockData');


const router = express.Router();

// Get course announcements
router.get('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;

  // Mock announcements data


  if (courseId === "testId") {
    res.json(mockAnnouncements);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Create a course announcement
router.post('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;
  const { userId, title, details } = req.body;

  if (!userId || !title || !details) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newAnnouncement = {
    id: `announcement-${Date.now()}`,
    courseId,
    user: {
      id: 'testId',
      name: 'John Doe',
      pictureThumbnail: `https://picsum.photos/200/${Math.floor(Math.random() * 100) + 300}`,
    },
    title,
    body: details,
    commentsCount: 0,
    updatedAt: new Date().toISOString(),
  };

  // Here you would typically add the newAnnouncement to your database or data store.
  // For this example, we'll just return it in the response.
  mockAnnouncements.unshift(newAnnouncement);

  res.status(201).json(newAnnouncement);
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
