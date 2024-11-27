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


// Get a course general forum questions
router.get('/courses/:id/general_discussion', (req, res) => {
  const id = req.params.id;
  if (id === "testId") {
    res.json(mockDiscussion);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get a lecture discussions/qustions
router.get('/lectures/:id/discussion', (req, res) => {
  console.log(33)
  const id = req.params.id;
  const allowedLectures = mockSections.flatMap(section => section.lectures.map(lecture => lecture.id));

  if (allowedLectures.includes(id)) {
      const discussionWithLectureId = mockDiscussion.map(discussion => ({
        ...discussion,
        lectureId: id,
      }));
      res.json(discussionWithLectureId);

    } else {
    res.status(404).send({ message: 'Lecture not found' });
  }
});

// Create a question in a course general forum
router.post('/courses/:id/general_discussion', (req, res) => {
  const courseId = req.params.id;
  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newEntry = {
    id: `entry-${Date.now()}`,
    title,
    user: {
      id: 'testId',
      name: 'John Doe',
      pictureThumbnail: `https://picsum.photos/200/${Math.floor(Math.random() * 100) + 300}`,
    },
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    upvoted: false,
    repliesCount: 0,
    body
  };

  // Here you would typically add the newEntry to your database or data store.
  // For this example, we'll just return it in the response.
  mockDiscussion.push(newEntry);

  res.status(201).json(newEntry);
});

// Create a new question for a lecture
router.post('/lectures/:id/discussion', (req, res) => {
  const lectureId = req.params.id;
  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newEntry = {
    id: `entry-${Date.now()}`,
    title,
    user: {
      id: 'testId',
      name: 'John Doe',
      pictureThumbnail: `https://picsum.photos/200/${Math.floor(Math.random() * 100) + 300}`,
    },
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    upvoted: false,
    repliesCount: 0,
    body,
    lectureId
  };

  // Here you would typically add the newEntry to your database or data store.
  // For this example, we'll just return it in the response.
  mockDiscussion.unshift(newEntry);


  res.status(201).json(newEntry);
});

// Change user vote in a question?
router.post('/questions/:id/vote', (req, res) => {
  const questionId = req.params.id;
  const { action } = req.body;

  if (!action) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const index = mockDiscussion.findIndex((question) => question.id === questionId);

  if (index === -1) {
    return res.status(404).send({ message: 'Question not found' });
  }

  if (action === 'upvote') {
    mockDiscussion[index].upvotes += 1;
  } else if (action === 'downvote') {
    mockDiscussion[index].upvotes -= 1;
  }

  res.status(200).json(mockDiscussion[index]);
});

// Edit a question
router.put('/questions/:id', (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;

  const index = mockDiscussion.findIndex((question) => question.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Question not found' });
  }

  mockDiscussion[index].title = title;
  mockDiscussion[index].body = body;

  res.status(200).json(mockDiscussion[index]);
});

// delete a question
router.delete('/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const index = mockDiscussion.findIndex((question) => question.id === questionId);

  if (index === -1) {
    return res.status(404).send({ message: 'Question not found' });
  }
  mockDiscussion.splice(index, 1);
  res.status(200).json({ message: 'Question deleted successfully' });
});

module.exports = router;
