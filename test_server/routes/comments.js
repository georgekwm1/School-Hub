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
router.get('/announcements/:id/comments', verifyToken, async (req, res) => {
  const announcementId = req.params.id;
  const [announcement] = await db.query(
    'SELECT 1 FROM announcements WHERE id = ?', [announcementId]
  );

  if (!announcement) {
    return res.status(404).send({ message: 'Announcement not found' });
  }

  // I'm really not sure if i have to check for user enrollment here or not

  const comments = await db.query(
    `SELECT * FROM comments
      WHERE announcementId = ?
      ORDER BY createdAt DESC;`,
    [announcementId]
  )
  const results = [];
  for (const comment of comments) {
    const user = await getUserData(comment.userId);
    delete comment.userId;
    results.push({
      ...comment,
      user,
    });
  }

  res.status(200).json(results);
});

// Create a comment for an announcement
router.post('/announcements/:id/comments', verifyToken, async (req, res) => {
  const announcementId = req.params.id;
  const io = req.app.get('io');
  const { comment: body } = req.body;
  const userId = req.userId;

  if (!body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    const [{ courseId }] = await db.query(
      `SELECT courseId FROM announcements
        WHERE id = ?`,
      [announcementId]
    );
    if (!courseId) {
      return res.status(404).send({ message: 'Announcement not found' });
    }

    const id = uuidv4();
    await db.query(
      `INSERT INTO comments (id, announcementId, userId, body) VALUES (?, ?, ?, ?)`,
      [id, announcementId, userId, body]
    );

    const [newComment] = await db.query(
      'SELECT * FROM comments WHERE id = ?', [id]
    );
    newComment.user = await getUserData(userId);
    delete newComment.userId;

    res.status(201).json(newComment);
    
    const rooms = [`announcements-${courseId}`, `comments-${announcementId}`];
    io.to(rooms).except(`user-${userId}`).emit('commentCreated', {
      payload: {
        announcementId,
        newComment,
      },
      userId,
    })

  } catch (err) {
  console.error(err);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit an announcement
router.put('/comments/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const io = req.app.get('io');
  const { body } = req.body;
  const userId = req.userId;

  try {
    const [comment] = await db.query(
      'SELECT userId FROM comments WHERE id = ?', [id]
    );

    if (!comment) {
      return res.status(404).send({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res
        .status(403)
        .send({ message: 'User is not authorized to edit this comment' });
    }

    await db.query('UPDATE comments SET body = ? WHERE id = ?', [body, id]);

    const [updatedComment] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    updatedComment.user = await getUserData(updatedComment.userId);
    delete updatedComment.userId;

    res.status(200).json(updatedComment);
    io.to(`comments-${updatedComment.announcementId}`).except(`user-${userId}`).emit('commentEdited', {
      payload: {editedComment: updatedComment},
      userId,
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Delete an announcement;
router.delete('/comments/:commentId', verifyToken, async(req, res) => {
  const io = req.app.get('io');
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const [comment] = await db.query(
      'SELECT userId, announcementId FROM comments WHERE id = ?',
      [commentId]
    )
    if (!comment) {
      return res.status(404).send({ message: 'Comment not found' });
    }
    const announcementId = comment.announcementId;
    const [{ courseId }] = await db.query(
      'SELECT courseId FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (comment.userId !== userId && ! await isCourseAdmin(userId, courseId)) {
      return res.status(403).send({ message: 'User is not a course admin' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.status(200).json({ message: 'Comment deleted successfully' });

    io.to(`comments-${announcementId}`).except(`user-${userId}`).emit('commentDeleted', {
      payload: {
        announcementId,
        commentId,
      },
      userId,
      courseId
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
