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
const {
  getUserData,
  getUpvoteStatus,
  isCourseAdmin,
  getCurrentTimeInDBFormat,
} = require('../helperFunctions');
const { verifyToken } = require('../middlewares/authMiddlewares');

const router = express.Router();

function getReplyCourseId(replyId) {
  const query = db.prepare(
    `
    -- Oh, boy... this is crazy... 
    SELECT 
      q.courseId AS courseIdFromQuestion,
      (SELECT courseId FROM lectures WHERE id = q.lectureId) AS courseIdFromLecture
    FROM replies r
      JOIN questions q ON r.questionId = q.id
    WHERE r.id = ?;
    `
  );

  const { courseIdFromQuestion, courseIdFromLecture } = query.get(replyId);
  return courseIdFromQuestion ? courseIdFromQuestion : courseIdFromLecture;
}

// Get question replies
router.get('/questions/:id/replies', verifyToken, (req, res) => {
  const questionId = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;

  const question = db
    .prepare(
      // Assuming it's a lecture question this won't the lecturId won't be null.
      `SELECT id, title, body, updatedAt, upvotes, repliesCount, userId, lectureId
    FROM questions
    WHERE id = ?`
    )
    .get(questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  const user = getUserData(question.userId);
  const upvoted = getUpvoteStatus(userId, question.id, 'question');

  const params = [questionId].concat(lastFetched ? [lastFetched] : []);
  const replies = db
    .prepare(
      `SELECT id, body, userId, updatedAt, upvotes
    FROM replies
    WHERE questionId = ?
      ${lastFetched ? 'AND createdAt > ?' : ''}
    ORDER BY updatedAt DESC`
    ).all(...params);

  const newLastFetched = getCurrentTimeInDBFormat();
  const results = replies.map((reply) => {
    const user = getUserData(reply.userId);
    const upvoted = getUpvoteStatus(userId, reply.id, 'reply');

    return {
      ...reply,
      user,
      upvoted,
    };
  });

  res.json({
    question: { ...question, user, upvoted },
    repliesList: results,
    lastFetched: newLastFetched,
  });
});

// Change user vote for a replies
router.post('/replies/:id/vote', verifyToken, (req, res) => {
  const replyId = req.params.id;
  const { action } = req.body;
  const userId = req.userId;

  if (!action) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Is this a better way? I don't know.
  const replyExists =
    db.prepare(`SELECT 1 FROM replies WHERE id = ?`).get(replyId) !== undefined;

  if (!replyExists) {
    return res.status(404).send({ message: 'Reply not found' });
  }

  try {
    db.transaction(() => {
      if (action === 'upvote') {
        db.prepare(
          `INSERT INTO votes (userId, replyId)
          VALUES (?, ?)`
        ).run(userId, replyId);
      } else if (action === 'downvote') {
        db.prepare(`DELETE FROM votes WHERE userId = ? AND replyId = ?`).run(
          userId,
          replyId
        );
      }
      db.prepare(
        `
    UPDATE replies
    SET upvotes = upvotes + ${action == 'upvote' ? 1 : -1}
    WHERE id = ?
    `
      ).run(replyId);

      let message;
      if (action == 'upvote') {
        message = 'Upvoted successfully';
      } else {
        message = 'Vote deleted successfully';
      }
      res.status(200).json({ message });
    })();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error voting' });
  }
});

// Create a reply for a question
router.post('/questions/:id/replies', verifyToken, (req, res) => {
  const questionId = req.params.id;
  const { body } = req.body;
  const userId = req.userId;

  if (!userId || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    const id = uuidv4();
    db.prepare(
      `
      INSERT INTO replies (id, questionId, userId, body)
      VALUES (?, ?, ?, ?)
    `
    ).run(id, questionId, userId, body);

    // I feel I'm doing something wronge here.
    // I iether get all the data
    // Or use teh data I already have from the variables above
    // and if for the updatedAt property.. I can just get Date().now()
    // I just don't know
    const newReply = db.prepare(`SELECT * FROM replies WHERE id = ?`).get(id);
    const user = getUserData(newReply.userId);

    delete newReply.userId;
    res.status(201).json({
      ...newReply,
      user,
      upvoted: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit a reply
router.put('/replies/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  const userId = req.userId;

  try {
    const reply = db.prepare('SELECT * FROM replies WHERE id = ?').get(id);

    if (!reply) {
      return res.status(404).send({ message: 'Reply not found' });
    }

    if (reply.userId !== userId) {
      return res
        .status(403)
        .send({ message: 'User is not authorized to edit this reply' });
    }

    db.prepare('UPDATE replies SET body = ? WHERE id = ?').run(body, id);

    const updatedReply = db
      .prepare('SELECT * FROM replies WHERE id = ?')
      .get(id);
    const user = getUserData(updatedReply.userId);

    delete updatedReply.userId;
    res.status(200).json({
      ...updatedReply,
      user,
      upvoted: false, // Assuming upvote status is false by default
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating reply' });
  }
});

// Delete a reply
router.delete('/replies/:id', verifyToken, (req, res) => {
  const replyId = req.params.id;
  const userId = req.userId;

  try {
    const reply = db
      .prepare('SELECT id, userId FROM replies WHERE id = ?')
      .get(replyId);

    if (!reply) {
      return res.status(404).send({ message: 'Reply not found' });
    }

    const courseId = getReplyCourseId(replyId);
    if (reply.userId !== userId && !isCourseAdmin(userId, courseId)) {
      return res
        .status(403)
        .send({ message: 'User is not authorized to delete this reply' });
    }

    db.prepare('DELETE FROM replies WHERE id = ?').run(replyId);

    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error deleting reply' });
  }
});

module.exports = router;
