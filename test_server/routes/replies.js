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
const db = require('../connect');

const router = express.Router();


// Untill adding the JWT stuff to get the actually user quering this..
// lets say.. 
const currentUserId = 'admin';
// const currentUserId = '30fd6f7e-a85b-4f2c-bee7-55b0bf542e95';


function getUserData(userId) {
  const user = db.prepare(
    `SELECT id, firstName, lastName, pictureThumbnail
    FROM users
    WHERE id = ?`
  ).get(userId);

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    pictureThumbnail: user.pictureThumbnail
  }
}

function getUpvoteStatus(userId, resourceId, resourceType) {
  const idColumn = resourceType === 'question'
    ? 'questionId' : 'replyId';

  return db.prepare(
    `SELECT userId FROM votes WHERE userId = ? AND ${idColumn} = ?`
  ).get(userId, resourceId) !== undefined;
}


// Get question replies
router.get('/questions/:id/replies', (req, res) => {
  const questionId = req.params.id;

  const question = db.prepare(
    // Assuming it's a lecture question this won't the lecturId won't be null.
    `SELECT id, title, body, updatedAt, upvotes, repliesCount, userId, lectureId
    FROM questions
    WHERE id = ?`
  ).get(questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  
  const user = getUserData(question.userId);
  const upvoted = getUpvoteStatus(currentUserId, question.id, 'question');

  const replies = db.prepare(
    `SELECT id, body, userId, updatedAt, upvotes
    FROM replies
    WHERE questionId = ?
    ORDER BY updatedAt DESC`
  ).all(questionId);

  const results = replies.map( (reply) => {
    const user = getUserData(reply.userId);
    const upvoted = getUpvoteStatus(currentUserId, reply.id, 'reply');

    return {
      ...reply,
      user,
      upvoted,
    }
  })

  res.json({ question: {...question, user, upvoted}, repliesList: results });
});

// Change user vote for a replies
router.post('/replies/:id/vote', (req, res) => {
  const replyId = req.params.id;
  const { action } = req.body;

  if (!action) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const index = mockReplies.findIndex((reply) => reply.id === replyId);

  if (index === -1) {
    return res.status(404).send({ message: 'Reply not found' });
  }

  if (action === 'upvote') {
    mockReplies[index].upvotes += 1;
  } else if (action === 'downvote') {
    mockReplies[index].upvotes -= 1;
  }
  res.status(200).json(mockReplies[index]);
});

// Create a reply for a question
router.post('/questions/:id/replies', (req, res) => {
  const questionId = req.params.id;
  const { userId, body } = req.body;

  if (!userId || !body) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newReply = {
    questionId,
    id: `reply-${Date.now()}`,
    user: {
      id: 'testId',
      name: 'Anonymous',
      pictureThumbnail: `https://picsum.photos/100`,
    },
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    upvoted: false,
    body,
  };

  // Here you would typically add the newReply to your database or data store.
  // For this example, we'll just return it in the response.
  mockReplies.unshift(newReply);

  res.status(201).json(newReply);
});

// Edit a reply
router.put('/replies/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  const index = mockReplies.findIndex((reply) => reply.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Reply not found' });
  }

  mockReplies[index].body = body;

  res.status(200).json(mockReplies[index]);
});

// Delete a reply
router.delete('/replies/:id', (req, res) => {
  const replyId = req.params.id;
  const index = mockReplies.findIndex((reply) => reply.id === replyId);

  if (index === -1) {
    return res.status(404).send({ message: 'Reply not found' });
  }
  
  mockReplies.splice(index, 1);
  res.status(200).json({ message: 'Reply deleted successfully' });
});

module.exports = router;
