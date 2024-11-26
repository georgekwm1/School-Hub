const express = require('express');
const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('./mockData');


const router = express.Router();


// Get question replies
router.get('/questions/:id/replies', (req, res) => {
  const questionId = req.params.id;

  const question = mockDiscussion.find(q => q.id === questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  res.json({ question: {...question, lectureId: 'cs50-lecture-0'}, repliesList });
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
