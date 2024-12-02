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
const { getUserData, isCourseAdmin } = require('../helperFunctions');
const { verifyToken } = require('../middlewares/authMiddlewares');


const router = express.Router();

// Get all comments for an announcement
router.get('/announcements/:id/comments', verifyToken, (req, res) => {
  const announcementId = req.params.id;
  const announcement = db.prepare('SELECT 1 FROM announcements WHERE id = ?').get(announcementId);

  if (!announcement) {
    return res.status(404).send({ message: 'Announcement not found' });
  }

  // I'm really not sure if i have to check for user enrollment here or not


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
router.post('/announcements/:id/comments', verifyToken, (req, res) => {
  const announcementId = req.params.id;
  const {comment: body } = req.body;
  const userId = req.userId;

  if (!body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }
  
  try {

    const id = uuidv4();
    db.prepare(
      `INSERT INTO comments (id, announcementId, userId, body) VALUES (?, ?, ?, ?)`
    ).run(
      id,
      announcementId,
      userId,
      body,
    );

    const newComment = db.prepare(
      'SELECT * FROM comments WHERE id = ?'
    ).get(id);
    newComment.user = getUserData(userId);
    delete newComment.userId;

    res.status(201).json(newComment)
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit an announcement
router.put('/comments/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  const userId = req.userId;

  try {
    const comment = db.prepare('SELECT userId FROM comments WHERE id = ?').get(id);

    if (!comment) {
      return res.status(404).send({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).send({ message: 'User is not authorized to edit this comment' });
    }

    db.prepare('UPDATE comments SET body = ? WHERE id = ?').run(body, id);

    const updatedComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    updatedComment.user = getUserData(updatedComment.userId);
    delete updatedComment.userId;

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete an announcement;
router.delete('/comments/:commentId', verifyToken, (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const comment = db.prepare('SELECT userId, announcementId FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).send({ message: 'Comment not found' });
    }

    if (comment.userId !== userId && !isCourseAdmin(userId, comment.announcementId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
