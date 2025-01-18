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
async function getQuestionCourseId(questionId) {
  const query = `
    SELECT 
      courseId AS courseIdFromQuestion,
      -- Oh, I love this slick trick...
      (SELECT courseId FROM lectures WHERE id = lectureId) AS courseIdFromLecture
    FROM questions
    WHERE id = ?;`;
  const [{ courseIdFromQuestion, courseIdFromLecture }] = await db.execute(query, [questionId]);
  return courseIdFromQuestion || courseIdFromLecture;
}

// Get a course general forum questions
router.get('/courses/:id/general_discussion', verifyToken, async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;
  const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
  if (!course) {
    res.status(404).send({ message: 'Course not found' });
  }

  if (! await isUserEnroledInCourse(userId, id) && ! await isCourseAdmin(userId, id)) {
    return res
      .status(403)
      .send({ message: 'User is not enrolled in this course' });
  }

  const params = [course.id, ...(lastFetched ? [lastFetched] : [])];
  const questionEntries = await db.query(`
    SELECT id, title, body, updatedAt, upvotes, repliesCount, userId
      FROM questions 
      WHERE courseId = ?
      ${lastFetched ? 'AND createdAt > ?' : ''}
      ORDER BY updatedAt DESC;
    `, [...params]);
  const newLastFetched = getCurrentTimeInDBFormat();

  // Now, here I'll get the userData + is it upvoted or not
  let questions = [];
  for (let entry of questionEntries) {
    const user = await getUserData(entry.userId);
    const upvoted = await getUpvoteStatus(userId, entry.id, 'question');

    questions.push({
      ...entry,
      user,
      upvoted,
    });
  }

  res.json({
    questions,
    lastFetched: newLastFetched,
  });
});

// Get a lecture discussions/qustions
router.get('/lectures/:id/discussion', verifyToken, async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const { lastFetched } = req.query;

  const [lecture] = await db.query('SELECT * FROM lectures WHERE id = ?', [id]);
  if (lecture) {
    const discussionWithLectureId = await db.query(`
      SELECT id, title, body, userId, upvotes, repliesCount, lectureId, updatedAt
        FROM questions 
        WHERE lectureId = ?
        ${lastFetched ? 'AND createdAt > ?' : ''}
        ORDER BY updatedAt DESC;`,
      [id].concat(lastFetched ? [lastFetched] : [])
    );
    const newLastFetchedTime = getCurrentTimeInDBFormat();

    let results = [];
    for (const entry of discussionWithLectureId) {
      const user = await getUserData(entry.userId);
      const upvoted = await getUpvoteStatus(userId, entry.id, 'question');

      results.push({
        ...entry,
        user,
        upvoted,
      })
    }

    res.json({ results, lastFetched: newLastFetchedTime });
  } else {
    res.status(404).send({ message: 'Lecture not found' });
  }
});

// Create a question in a course general forum
router.post('/courses/:id/general_discussion', verifyToken, async (req, res) => {
  const courseId = req.params.id;
  const { title, body } = req.body;
  const userId = req.userId;
  const io = req.app.get('io');

  if (!title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const user = await getUserData(userId);
  const newEntryId = uuidv4();

  try {
    const createTime = getCurrentTimeInDBFormat();
    // I have a concern about what i'm doing here regarding teh time..
    // connected to the next comment below
    await db.query(`
      INSERT INTO questions (id, title, body, userId, courseId)
      VALUES (?, ?, ?, ?, ?)`,
      [newEntryId, title, body, userId, courseId]
    );

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

    io.to(`generalDiscussion-${courseId}`)
      .except(`user-${userId}`)
      .emit('generalDiscussionQuestionCreated', {
        payload: {
          newEntry,
          lastFetched,
        },
        userId,
        courseId,
      });

    res.status(201).json({
      newEntry,
      lastFetched,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Create a new question for a lecture
router.post('/lectures/:id/discussion', verifyToken, async (req, res) => {
  const lectureId = req.params.id;
  const { title, body } = req.body;
  const userId = req.userId;
  const io = req.app.get('io');

  if (!userId || !title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newEntryId = uuidv4();

  try {
    const createTime = getCurrentTimeInDBFormat();
    await db.query(`
      INSERT INTO questions (id, title, body, userId, lectureId)
      VALUES (?, ?, ?, ?, ?)`,
      [newEntryId, title, body, userId, lectureId]
    );

    const lastFetched = getCurrentTimeInDBFormat();

    const newEntry = {
      id: newEntryId,
      title,
      body,
      user: await getUserData(userId),
      updatedAt: createTime,
      upvotes: 0,
      upvoted: false,
      repliesCount: 0,
      lectureId,
    };

    res.status(201).json({
      newEntry,
      lastFetched,
    });

    // This is after the request is sent to make the response for user faster
    io.to(`lectureDiscussion-${lectureId}`)
      .except(`user-${userId}`)
      .emit('lectureQuestionCreated', {
        payload: { question: newEntry, lectureId, lastFetched },
        userId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Change user vote in a question?
router.post('/questions/:id/vote', verifyToken, async (req, res) => {
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

  const [question] = await db.query(
    'SELECT * FROM questions WHERE id = ?', [questionId]
  );

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  try {
    await db.transaction(async (connection) => {
      await connection.queryWithPluck(
        `UPDATE questions
        SET upvotes = upvotes + ${action == 'upvote' ? 1 : -1}
        WHERE id = ?`,
        [questionId]
      );

      if (action === 'upvote') {
        // TODO.. what if user already upvoted;
        await connection.queryWithPluck(
          `INSERT INTO votes (userId, questionId)
          VALUES (?, ?)`,
          [userId, questionId]
        );
      } else if (action === 'downvote') {
        await connection.queryWithPluck(
          `DELETE FROM votes WHERE userId = ? AND questionId = ?`,
          [userId, questionId]
        );
      }

      const { courseId, lectureId } = question;
      const socket1stRoom = courseId
        ? `generalDiscussion-${courseId}`
        : `lectureDiscussion-${lectureId}`;
      const rooms = [socket1stRoom, `question-${questionId}`];

      io.to(rooms)
        .except(`user-${userId}`)
        .emit('questionUpvoteToggled', {
          payload: {
            questionId,
            isUpvoted: action === 'upvote',
            // Now.. I'm questioning.. this won't be needed when emiting
            // question-id room.. becuase.. only the questionId is suffeciant
            // to make the effect.. so.. should I emit separately in next lines
            // or it's ok to have something extra in the payload?
            // I don't know... I'm not sure..
            // What is the trait off here...
            lectureId,
          },
          userId,
        });

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
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error updating vote' });
  }
});

// Edit a question
router.put('/questions/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const io = req.app.get('io');
  const userId = req.userId;

  const [question] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  if (question.userId !== userId) {
    return res
      .status(403)
      .send({ message: 'User is not authorized to edit this question' });
  }
  try {
    await db.transaction(async (connection) => {
      await connection.queryWithPluck(
        `UPDATE questions
        SET title = ?, body = ?
        WHERE id = ?`,
        [title, body, id]
      );

      const [updatedQuestion] = await connection.queryWithPluck(
          `SELECT id, title, body, updatedAt, lectureId ,repliesCount, upvotes
          FROM questions WHERE id = ?`,
          [id]
        );

      // What a consitency here!
      // God.. what was I thinking.!
      const editedQuestion = {
        ...updatedQuestion,
        user: await getUserData(userId),
        upvoted: await getUpvoteStatus(userId, id, 'question'),
      };

      res.status(200).json(editedQuestion);

      const courseId = question.courseId;
      const lectureId = question.lectureId;
      const room = lectureId
        ? `lectureDiscussion-${lectureId}`
        : `generalDiscussion-${courseId}`;
      const event = lectureId
        ? 'lectureQuestionEdited'
        : 'generalDiscussionQuestionEdited';
      io.to(room).except(`user-${userId}`).emit(event, {
        payload: { editedQuestion },
      });
      io.to(`question-${id}`).except(`user-${userId}`).emit('questionEdited', {
        payload: { editedQuestion },
        userId,
      });

    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error updating question' });
  }
});

// delete a question
router.delete('/questions/:id', verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const userId = req.userId;
  const io = req.app.get('io');

  const [question] = await db.query(
    'SELECT * FROM questions WHERE id = ?', [questionId]
  );

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  const courseId = await getQuestionCourseId(question.id);
  const isAdmin = await isCourseAdmin(userId, courseId);
  if (question.userId !== userId && !isAdmin) {
    // As if this is a descriptive message now?!..
    return res.status(403).send({ message: 'User is not authorized' });
  }

  try {
    await db.transaction(async (connection) => {
      await connection.queryWithPluck(
        'DELETE FROM questions WHERE id = ?', [questionId]
      );
      // useless if the cascade works.. whey did i forget this?!
      // db.prepare('DELETE FROM replies WHERE questionId = ?').run(questionId);

      res.status(200).json({ message: 'Question deleted successfully' });
      // I think i have to let the user see the response first then let teh delay happen for others
      // Won't make difference for them.
      const lectureId = question.lectureId;
      const room = lectureId
        ? `lectureDiscussion-${lectureId}`
        : `generalDiscussion-${courseId}`;
      const event = lectureId
        ? 'lectureQuestionDeleted'
        : 'generalDiscussionQuestionDeleted';
      io.to(room).except(`user-${userId}`).emit(event, {
        payload: {
          questionId,
          lectureId,
        },
        userId,
      });
      io.to(`question-${questionId}`).except(`user-${userId}`).emit('questionDeleted', {
        payload: {
          questionId,
          lectureId,
        },
        userId,
      });
      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error deleting question' });
  }
});

// Sync existing questions
router.post('/questions/diff', verifyToken, async (req, res) => {
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
  const { entries, lastFetched, courseId, lectureId } = req.body;

  try {
    if (courseId && lectureId) {
      return res.status(401).json({
      message:
        'courseId and lectureId are both defined?!.. which category are the questions?',
    });
    } else if (courseId) {
      const [course] = await db.query(
        'SELECT * FROM courses WHERE id = ?', [courseId]
      );
      if (!course) {
        return res.status(404).send({ message: 'Course not found' });
      }
    } else if (lectureId) {
      const [lecture] = await db.query(
        'SELECT * FROM lectures WHERE id = ?', [lectureId]);
      if (!lecture) {
        return res.status(404).send({ message: 'Lecture not found' });
      }
    } else {
      // I don't konw why here i'm using .json and above .send?!  .. .... anyways..
      return res.status(401).json({ message: 'Missing course or lecture id' });
    }

    // for ease or access and speed of retrieval and removal
    const entriesUpdatedAt = new Map(
      entries.map((entry) => [entry.id, entry.updatedAt])
    );
    const existingQuestions = await db.query(
        `SELECT id, updatedAt, title, body, repliesCount, upvotes
        FROM questions
      WHERE ${courseId ? 'courseId' : 'lectureId'} = ?
        AND createdAt <= ?
      ORDER BY updatedAt DESC;`,
      [courseId ? courseId : lectureId, lastFetched]
      );
    const userVotes = await db.query(
        `SELECT questionId FROM votes
      -- If you are wondering... take a look at the vots table and you will see
      -- Ther is replyId and questionId..
      WHERE userId = ? AND questionId IS NOT NULL;`,
      [userId],
      pluck=true
      );
    const results = {
      existing: {},
      deleted: [],
    };

    for (const entry of existingQuestions) {
      const { id, updatedAt, repliesCount, upvotes } = entry;
      const questionEntry = {
        id,
        updatedAt,
        repliesCount,
        upvotes,
      };
      if (updatedAt !== entriesUpdatedAt.get(id)) {
        questionEntry.updatedAt = updatedAt;
        questionEntry.title = entry.title;
        questionEntry.body = entry.body;
      }
      
      entriesUpdatedAt.delete(id);
      results.existing[id] = questionEntry;
    }
  
    existingQuestions.forEach((entry) => {
      entry.upvoted = userVotes.includes(entry.id);
    });

    results.deleted = Array.from(entriesUpdatedAt.keys());
    res.status(201).json({
      results,
      lastSynced: getCurrentTimeInDBFormat(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error syncing questions' });
  }
});

module.exports = router;
