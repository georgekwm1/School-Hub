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
const db = require('../connect');
const { getUserData } = require('../helperFunctions');

const router = express.Router();

// Get all comments for an announcement
router.get('/announcements/:id/comments', (req, res) => {
  const announcementId = req.params.id;
  const announcement = db.prepare('SELECT 1 FROM announcements WHERE id = ?').get(announcementId);

  if (!announcement) {
    return res.status(404).send({ message: 'Announcement not found' });
  }

  const comments = db
    .prepare(
      `
      SELECT * FROM comments
        WHERE announcementId = ?
        ORDER BY createdAt DESC;
      `
    )
    .all(announcementId);

  const results = comments.map((comment) => {
    const user = getUserData(comment.userId);
    delete comment.userId;
    return {
      ...comment,
      user,
    };
  });

  res.status(200).json(results);
});

// Create a comment for an announcement
router.post('/announcements/:id/comments', (req, res) => {
  const announcementId = req.params.id;
  const { userId, comment } = req.body;

  if (!userId || !comment) {
    return res.status(400).send({ message: 'Missing required fields' });
  }
  console.log(comment)
  const newComment = {
    announcementId,
    id: `comment-${Date.now()}`,
    user: {
      id: Math.random() < 0.5 ? 'testId' : 'somethingElse',
      name: 'Anonymous',
      pictureThumbnail: `https://picsum.photos/100`,
    },
    updatedAt: new Date().toISOString(),
    body: comment,
  };

  // Here you would typically add the newComment to your database or data store.
  // For this example, we'll just return it in the response.
  mockComments.unshift(newComment);

  res.status(201).json(newComment);
});

// Edit an announcement
router.put('/comments/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  const index = mockComments.findIndex((comment) => comment.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Comment not found' });
  }

  mockComments[index].body = body;

  res.status(200).json(mockComments[index]);
});

// Delete an announcement;
router.delete('/comments/:commentId', (req, res) => {
  const { announcementId, commentId } = req.params;
  const index = mockComments.findIndex((comment) => comment.id === commentId);

  if (index === -1) {
    return res.status(404).send({ message: 'Comment not found' });
  }
  
  mockComments.splice(index, 1);
  res.status(200).json({ message: 'Comment deleted successfully' });
});

module.exports = router;
