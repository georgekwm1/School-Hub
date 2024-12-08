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
  isUserEnroledInCourse,
  isCourseAdmin,
  getCurrentTimeInDBFormat,
} = require('../helperFunctions');
const { verifyToken } = require('../middlewares/authMiddlewares');

const router = express.Router();
function getQuestionCourseId(questionId) {
  const query = db.prepare(
    `
    SELECT 
      courseId AS courseIdFromQuestion,
      -- Oh, I love this slick trick...
      (SELECT courseId FROM lectures WHERE id = lectureId) AS courseIdFromLecture
    FROM questions
    WHERE id = ?;
    `
  );

  const { courseIdFromQuestion, courseIdFromLecture } = query.get(questionId);
  return courseIdFromQuestion || courseIdFromLecture;
}

// Get a course general forum questions
router.get('/courses/:id/general_discussion', verifyToken, (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
  if (!course) {
    res.status(404).send({ message: 'Course not found' });
  }

  if (!isUserEnroledInCourse(userId, id) && !isCourseAdmin(userId, id)) {
    return res
      .status(403)
      .send({ message: 'User is not enrolled in this course' });
  }


  const params = [course.id, ...(lastFetched ? [lastFetched] : [])];
  const questionEntries = db
    .prepare(
      `
    SELECT id, title, body, updatedAt, upvotes, repliesCount, userId
      FROM questions 
      WHERE courseId = ?
      ${lastFetched ? 'AND createdAt > ?' : ''}
      ORDER BY updatedAt DESC;
    `
    )
    .all(...params)
  const newLastFetched = getCurrentTimeInDBFormat();

  // Now, here I'll get the userData + is it upvoted or not
  const questions = questionEntries.map((entry) => {
    const user = getUserData(entry.userId);
    const upvoted = getUpvoteStatus(user.id, entry.id, 'question');

    return {
      ...entry,
      user,
      upvoted,
    };
  });

  res.json({
    questions,
    lastFetched: newLastFetched,
  });
});

// Get a lecture discussions/qustions
router.get('/lectures/:id/discussion', verifyToken, (req, res) => {
  const id = req.params.id;
  const userId = req.userId;

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
      const upvoted = getUpvoteStatus(userId, entry.id, 'question');

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
  const io = req.app.get('io');

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
      INSERT INTO questions (id, title, body, userId, courseId)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(newEntryId, title, body, userId, courseId);

    const lastFetched = getCurrentTimeInDBFormat();
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

    io.to(`generalDiscussion-${courseId}`).except(`user-${userId}`).emit(
      'generalDiscussionQuestionCreated',
      {
        payload: {
          newEntry,
          lastFetched,
        },
        userId,
        courseId,
      }
    )

    res.status(201).json({
      newEntry, lastFetched
    });
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
      INSERT INTO questions (id, title, body, userId, lectureId)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(newEntryId, title, body, userId, lectureId);

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
  const io = req.app.get('io');
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

      const { courseId, lectureId } = question;
      const sockerRoom = courseId ? `generalDiscussion-${courseId}` : `lectureDiscussion-${lectureId}`;

      io.to(sockerRoom).except(`user-${userId}`).emit(
        'generalDiscussionQuestionUpvoteToggled', {
          payload: {
            questionId,
            isUpvoted: action === 'upvote',
          },
          userId,
        }
      )

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
router.put('/questions/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const io = req.app.get('io');
  const userId = req.userId;

  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  if (question.userId !== userId) {
    return res
      .status(403)
      .send({ message: 'User is not authorized to edit this question' });
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

      const editedQuestion = {
          ...updatedQuestion,
          user: getUserData(userId),
          upvoted: getUpvoteStatus(userId, id, 'question'),
        }
      
      const courseId = question.courseId;
      io.to(`generalDiscussion-${courseId}`).except(`user-${userId}`).emit(
        `generalDiscussionQuestionEdited`,
        {
          payload: {editedQuestion}
        }
      )
      res.status(200).json(editedQuestion);
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error updating question' });
  }
});

// delete a question
router.delete('/questions/:id', verifyToken, (req, res) => {
  const questionId = req.params.id;
  const userId = req.userId;
  const io = req.app.get('io');

  const question = db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  const courseId = getQuestionCourseId(question.id);
  const isAdmin = isCourseAdmin(userId, courseId);
  if (question.userId !== userId && !isAdmin) {
    // As if this is a descriptive message now?!..
    return res.status(403).send({ message: 'User is not authorized' });
  }

  try {
    db.transaction(() => {
      db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
      // useless if the cascade works.. whey did it forget this?!
      // db.prepare('DELETE FROM replies WHERE questionId = ?').run(questionId);

      io.to(`generalDiscussion-${courseId}`).except(`user-${userId}`).emit(
        'generalDiscussionQuestionDeleted',
        {
          payload: {
            questionId,
          },
          userId,
        }
      )

      res.status(200).json({ message: 'Question deleted successfully' });
    })();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error deleting question' });
  }
});

// Sync existing questions
router.post('/questions/diff', verifyToken, (req, res) => {
  // After writing this endpoint.... 
  // I sometimes think that this is an overkill
  // and it's even better to fetch teh whole data without all these comparisons here..
  // And if it's about deletion .. there is no censitive data.. 
  // so.. deletion is no big deal if it delays for some users if entries were 
  // Still cached!;
  // Or am i saving bandwidth for speed for what
  // Because also in the front-ned.. there will be around up to  O(N*N) to merge changes
  // Sinse they are in a form of list not a map.. so with each Id.. It has to find it
  // and either delete it or update it..
  
  // So... Now, i'm really thining.. should I just fetch teh whole thing without these checks..
  // But.. I don't know.. I may .. 
  // I may just keep syncing this way.... or I dont't know if there is any better
  // I think i'm almost confident in everything else I did till now..
  // But syncing those existing persisted data in the state..
  // No.. I'm not...



  // After thinking again.. I'm either way fetching all questions.. But I might limit it
  // With parametrs in this case.. and i'm also saving the getUser data fetches for each
  // Entry.. and the comparison is nothing but updatedAt
  // 
  // And after all this.. I simply might be making less that smart claims here
  // Because I havn't slept well.. and the problem was written around 1 am and now it's 5
  // So.. I'm not sure what I'm doing anywa..
  // Bye.. thanks for your looking at the code whoever you are
  const userId = req.userId;
  const { entries, lastFetched, courseId } = req.body;
  // for ease or access and speed of retrieval and removal
  const entriesUpdatedAt = new map(
    entries.map(entry => [entry.id, entry.updatedAt])
  );

  const existingQuestions = db.prepare(
    `SELECT id, updatedAt, title, body, repliesCount, upvotes
    FROM questions where courseId = ? AND updatedAt >= ?;`
  ).all(courseId, lastFetched);

  const userVotes = db.prepare(`
    SELECT questionId FROM votes
    -- If you are wondering... take a look at the vots table and you will see
    -- Ther is replyId and questionId..
    WHERE userId = ? AND questionId IS NULL
    ORDER BY updatedAt DESC;
    `).pluck('questionId').all(userId);

  const results = {
    existing: [],
    deleted: [], 
  }

  for (const entry of existingQuestions) {
    const { id, updatedAt, repliesCount, upvotes } = entry;
    const questionEntry = {
      id, repliesCount, upvotes
    };
    if (updatedAt !== entriesUpdatedAt.get(id)) {
      questionEntry.updatedAt = updatedAt;
      questionEntry.title = entry.title;
      questionEntry.body = entry.body;
    };

    entriesUpdatedAt.delete(id);
    results.existing.push(questionEntry);
  };

  existingQuestions.forEach(entry => {
    entry.upvoted = userVotes.includes(entry.id);
  });

  results.deleted = Array.from(entriesUpdatedAt.keys());

  res.status(200).json(results);
})

module.exports = router;
