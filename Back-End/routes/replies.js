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

async function getReplyCourseId(replyId) {
  const query = `-- Oh, boy... this is crazy... 
    SELECT 
      q.courseId AS courseIdFromQuestion,
      (SELECT courseId FROM lectures WHERE id = q.lectureId) AS courseIdFromLecture
    FROM replies r
      JOIN questions q ON r.questionId = q.id
    WHERE r.id = ?;`

  const [{ courseIdFromQuestion, courseIdFromLecture }] = await db.query(query, [replyId]);
  return courseIdFromQuestion ? courseIdFromQuestion : courseIdFromLecture;
}

/**
 * Returns the parent of a question, either the courseId or lectureId,
 * depending on the question type.
 * @param {string} questionId - The id of the question
 * @returns {{courseId: string, lectureId: string} | null}
 */
async function getQuestionParentId(questionId) {
  const [result] = await db.query(
    `SELECT 
      courseId, lectureId 
    FROM questions
    WHERE id = ?;`,
    [questionId]
  );

  return result; 
}

// Get question replies
router.get('/questions/:id/replies', verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;

  const [question] = await db.query(
    // Assuming it's a lecture question this won't the lecturId won't be null.
    `SELECT id, title, body, updatedAt, upvotes, repliesCount, userId, lectureId,
      ${lastFetched? '(updatedAt >= :lastFetched)' : '1'} AS isNew
    FROM questions
    WHERE id = :questionId`,
    {lastFetched, questionId}
  );

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  question.upvoted = await getUpvoteStatus(userId, question.id, 'question');
  // Save some bandwidth
  let questionResponse = question;
  if (!question.isNew) {
    questionResponse = {
      id: question.id,
      repliesCount: question.repliesCount,
      upvoted: question.upvoted,
      upvotes: question.upvotes,
      updatedAt: question.updatedAt,
    }
  } else {
    questionResponse.user = await getUserData(question.userId);
    delete questionResponse.userId;
    delete questionResponse.isNew;
  }

  const params = [questionId].concat(lastFetched ? [lastFetched] : []);
  const replies = await db.query(
    `SELECT id, body, userId, updatedAt, upvotes
    FROM replies
    WHERE questionId = ?
      ${lastFetched ? 'AND createdAt > ?' : ''}
    ORDER BY updatedAt DESC`,
    params
  );

  const newLastFetched = getCurrentTimeInDBFormat();
  let repliesList = [];
  for (const reply of replies) {
    const user = await getUserData(reply.userId);
    const upvoted = await getUpvoteStatus(userId, reply.id, 'reply');

    repliesList.push({
      ...reply,
      user,
      upvoted
    })
  }


  res.json({
    question: questionResponse,
    repliesList,
    lastFetched: newLastFetched,
  });
});

// Change user vote for a replies
router.post('/replies/:id/vote', verifyToken, async (req, res) => {
  const replyId = req.params.id;
  const io = req.app.get('io');
  const { action } = req.body;
  const userId = req.userId;

  if (!action) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  // Is this a better way? I don't know.
  const [reply] = await db.query(
    `SELECT id, questionId FROM replies WHERE id = ?`, [replyId]
  );

  if (!reply) {
    return res.status(404).send({ message: 'Reply not found' });
  }

  try {
    await db.transaction(async (connection) => {
      if (action === 'upvote') {
        await connection.query(
          `INSERT INTO votes (userId, replyId)
          VALUES (?, ?)`,
          [userId, replyId]
        );
      } else if (action === 'downvote') {
        await connection.query(
          `DELETE FROM votes WHERE userId = ? AND replyId = ?`,
          [userId, replyId]
        );
      }

      await connection.query(
        `UPDATE replies
        SET upvotes = upvotes + ${action == 'upvote' ? 1 : -1}
        WHERE id = ?`,
        [replyId]
      );

      let message;
      if (action == 'upvote') {
        message = 'Upvoted successfully';
      } else {
        message = 'Vote deleted successfully';
      }
      res.status(200).json({ message });

      const { questionId } = reply;
      io.to(`question-${questionId}`).except(`user-${userId}`).emit('replyUpvoteToggled', {
        payload: {
          replyId,
          questionId,
          isUpvoted: action === 'upvote',
        },
        userId,
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error voting' });
  }
});

// Create a reply for a question
router.post('/questions/:id/replies', verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const io = req.app.get('io');
  const { body } = req.body;
  const userId = req.userId;

  if (!userId || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO replies (id, questionId, userId, body)
      VALUES (?, ?, ?, ?)`,
      [id, questionId, userId, body]
    );

    // I feel I'm doing something wronge here.
    // I iether get all the data
    // Or use teh data I already have from the variables above
    // and if for the updatedAt property.. I can just get Date().now()
    // I just don't know
    const [newReply] = await db.query(`SELECT * FROM replies WHERE id = ?`, [id]);
    const user = await getUserData(newReply.userId);

    delete newReply.userId;
    const response = {
      ...newReply,
      user,
      upvoted: false,
    }

    const lastFetched = getCurrentTimeInDBFormat();

    res.status(201).json({newReply: response, lastFetched});

    io.to(`question-${questionId}`).except(`user-${userId}`).emit('replyCreated', {
      payload: { newReply: response, lastFetched },
      userId,
    });

    const { lectureId, courseId } = await getQuestionParentId(newReply.questionId);
    const room = lectureId ? `lectureDiscussion-${lectureId}` : `generalDiscussion-${courseId}`;
    io.to(room).emit('replyCreated', {
      payload: {questionId: newReply.questionId, lectureId, courseId },
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Edit a reply
router.put('/replies/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const io = req.app.get('io');
  const { body } = req.body;
  const userId = req.userId;

  try {
    const [reply] = await db.query('SELECT id, userId FROM replies WHERE id = ?', [id]);
    if (!reply) {
      return res.status(404).send({ message: 'Reply not found' });
    }

    if (reply.userId !== userId) {
      return res
        .status(403)
        .send({ message: 'User is not authorized to edit this reply' });
    }

    await db.query('UPDATE replies SET body = ? WHERE id = ?', [body, id]);

    const [updatedReply] = await db.query(
      'SELECT id, questionId, body, updatedAt FROM replies WHERE id = ?',
      [id]
    );

    res.status(200).json(updatedReply);

    io.to(`question-${updatedReply.questionId}`).except(`user-${userId}`).emit('replyUpdated', {
      payload: {updatedReply},
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating reply' });
  }
});

// Delete a reply
router.delete('/replies/:id', verifyToken, async (req, res) => {
  const replyId = req.params.id;
  const io = req.app.get('io');
  const userId = req.userId;

  try {
    const [reply] = await db.query('SELECT id, userId, questionId FROM replies WHERE id = ?', [replyId]);

    if (!reply) {
      return res.status(404).send({ message: 'Reply not found' });
    }

    const replyCourseId = await getReplyCourseId(replyId);
    if (reply.userId !== userId && ! await isCourseAdmin(userId, replyCourseId)) {
      return res
        .status(403)
        .send({ message: 'User is not authorized to delete this reply' });
    }

    await db.query('DELETE FROM replies WHERE id = ?', [replyId]);

    res.status(200).json({ message: 'Reply deleted successfully' });

    io.to(`question-${reply.questionId}`).except(`user-${userId}`).emit('replyDeleted', {
      payload: {replyId, questionId: reply.questionId},
      userId
    });

    const { lectureId, courseId} = await getQuestionParentId(reply.questionId);
    const room = lectureId ? `lectureDiscussion-${lectureId}` : `generalDiscussion-${courseId}`;
    io.to(room).emit('replyDeleted', {
      payload: {questionId: reply.questionId, lectureId, courseId },
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error deleting reply' });
  }
});

// Sync existing replies
router.post('/questions/:questionId/replies/diff', verifyToken, async (req, res) => {
  const {questionId} = req.params;
  const userId = req.userId;
  const { entries, lastFetched } = req.body;

  const entriesMap = new Map(entries.map(
    reply => [reply.id, reply.updatedAt]
  ));

  const dbEntries = await db.query(
    `SELECT id, updatedAt, body, upvotes FROM replies 
      WHERE questionId = ? AND createdAt <= ?;`,
    [questionId, lastFetched]
  );
  const userVotes = await db.query(
    `SELECT replyId, userId FROM votes WHERE userId = ? ;`,
    [userId],
  );

  const results = {
    existing: {},
    deleted: [],
  };

  for (const entry of dbEntries) {
    const { id, updatedAt, body, upvotes } = entry;
    const replyEntry = {
      id,
      upvotes,
    };
    if (updatedAt !== entriesMap.get(id)) {
      Object.assign(replyEntry, {
        body,
        updatedAt
      });
    }

    if (userVotes.includes(id)) {
      replyEntry.upvoted = true;
    }

    results.existing[id] = replyEntry;
    entriesMap.delete(id);
  }

  results.deleted = Array.from(entriesMap.keys());

  res.status(200).json({
    results,
    lastSynced: getCurrentTimeInDBFormat(),
    questionId,
  });
})
module.exports = router;
