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
const { getUserData, getUpvoteStatus } = require('../helperFunctions');
const { verifyToken } = require('../middlewares/authMiddlewares');


const router = express.Router();

// Untill adding the JWT stuff to get the actually user quering this..
// lets say..
const currentUserId = 'admin';
// const currentUserId = '30fd6f7e-a85b-4f2c-bee7-55b0bf542e95';


// Get a course general forum questions
router.get('/courses/:id/general_discussion', verifyToken,  (req, res) => {
  const id = req.params.id;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (course) {
    const questionEntries = db
      .prepare(
        `
      SELECT id, title, body, updatedAt, upvotes, repliesCount, userId
        FROM questions 
        WHERE courseId = ?
        ORDER BY updatedAt DESC;
      `
      )
      .all(course.id);

    // Now, here I'll get the userData + is it upvoted or not
    const results = questionEntries.map((entry) => {
      const user = getUserData(entry.userId);
      const upvoted = getUpvoteStatus(user.id, entry.id, 'question');

      return {
        ...entry,
        user,
        upvoted,
      };
    });

    res.json(results);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get a lecture discussions/qustions
router.get('/lectures/:id/discussion', verifyToken, (req, res) => {
  const id = req.params.id;
  const currentUserId = req.userId;

  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(id);
  if (lecture) {
    const discussionWithLectureId = db
      .prepare(
        `
      SELECT id, title, body, userId, upvotes, repliesCount, lectureId, updatedAt
        FROM questions 
        WHERE lectureId = ?
        ORDER BY updatedAt DESC;
      `
      )
      .all(id);

    const results = discussionWithLectureId.map((entry) => {
      const user = getUserData(entry.userId);
      const upvoted = getUpvoteStatus(currentUserId, entry.id, 'question');

      return {
        ...entry,
        user,
        upvoted,
      };
    });

    res.json(results);
  } else {
    res.status(404).send({ message: 'Lecture not found' });
  }
});

// Create a question in a course general forum
router.post('/courses/:id/general_discussion', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const { title, body } = req.body;
  const userId = req.userId;

  if (!title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const user = getUserData(userId);
  const newEntryId = uuidv4();

  try {
    const createTime = new Date().toISOString();
    // I have a concern about what i'm doing here regarding teh time..
    // connected to the next comment below
    db.prepare(
      `
      INSERT INTO questions (id, title, body, userId, courseId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(newEntryId, title, body, userId, courseId, createTime, createTime);

    // Here, i'm not 100% sure if I sould do this here..
    // or bring the data with a select query from the DB?
    // May be this is being done for sort of certainty or something..
    // I don't know..
    const newEntry = {
      id: newEntryId,
      title,
      body,
      user,
      updatedAt: createTime,
      upvotes: 0,
      upvoted: false,
      repliesCount: 0,
    };

    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Create a new question for a lecture
router.post('/lectures/:id/discussion', verifyToken, (req, res) => {
  const lectureId = req.params.id;
  const { title, body } = req.body;
  const userId = req.userId;

  if (!userId || !title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newEntryId = uuidv4();

  try {
    const createTime = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO questions (id, title, body, userId, lectureId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(newEntryId, title, body, userId, lectureId, createTime, createTime);

    const newEntry = {
      id: newEntryId,
      title,
      body,
      user: getUserData(userId),
      updatedAt: createTime,
      upvotes: 0,
      upvoted: false,
      repliesCount: 0,
      lectureId,
    };

    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Change user vote in a question?
router.post('/questions/:id/vote', verifyToken, (req, res) => {
  // I think sinse this is only toggling upvotes
  // not upvote, donwvote or nutralize.. then no action is needed
  // and it could just be done.. checking if there is a vote..
  // if no votes for this user.. then you make one
  // and this opens the door for whenever there somehow a vote already
  // there might by an error and you return voted already or something
  // But I prefere leaving it now.. may be i need the triple case later.
  const questionId = req.params.id;
  const { action } = req.body;
  const userId = req.userId;

  if (!action || !['upvote', 'downvote'].includes(action)) {
    return res.status(400).send({ message: 'Missing or invalid action field' });
  }

  const question = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  try {
    db.transaction(() => {
      db.prepare(
        `
        UPDATE questions
        SET upvotes = upvotes + ${action == 'upvote' ? 1 : -1}
        WHERE id = ?
      `
      ).run(questionId);

      if (action === 'upvote') {
        // TODO.. what if user already upvoted;
        db.prepare(
          `
          INSERT INTO votes (userId, questionId)
          VALUES (?, ?)
        `
        ).run(userId, questionId);
      } else if (action === 'downvote') {
        db.prepare(
          `
          DELETE FROM votes WHERE userId = ? AND questionId = ?
        `
        ).run(userId, questionId);
      }

      // I'm not sure.. should I just return success code and it's the
      // role of the syncing mechanism to update or bring new numbers..
      // because it would be strange if a user upvotes and find the number
      // increases with 2 or five numbers..

      const message =
        action === 'upvote'
          ? 'Upvoted successfully'
          : 'Vote deleted successfully';
      // Now another thing.. I'm juggling between 201.. 200, and 204?
      // Sinse i'm already creating a resource.. which is the votes.. and updating somehting
      res.status(201).json({ message });
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error updating vote' });
  }
});

// Edit a question
router.put('/questions/:id', (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  try {
    db.transaction(() => {
      db.prepare(
        `
        UPDATE questions
        SET title = ?, body = ?
        WHERE id = ?
      `
      ).run(title, body, id);

      const updatedQuestion = db
        .prepare(
          `SELECT id, title, body, updatedAt, lectureId ,repliesCount, upvotes
         FROM questions WHERE id = ?`
        )
        .get(id);

      res.status(200).json({
        ...updatedQuestion,
        user: getUserData(currentUserId),
        upvoted: getUpvoteStatus(currentUserId, id, 'question'),
      });
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error updating question' });
  }
});

// delete a question
router.delete('/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const question = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  try {
    db.transaction(() => {
      db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
      // useless if the cascade works.. whey did it forget this?!
      // db.prepare('DELETE FROM replies WHERE questionId = ?').run(questionId);

      res.status(200).json({ message: 'Question deleted successfully' });
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error deleting question' });
  }
});

module.exports = router;
