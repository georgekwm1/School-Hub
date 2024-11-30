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

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO replies (id, questionId, userId, body)
      VALUES (?, ?, ?, ?)
    `).run(
      id,
      questionId,
      userId,
      body
    );

    // I feel I'm doing something wronge here.
    // I iether get all the data
    // Or use teh data I already have from the variables above
    // and if for the updatedAt property.. I can just get Date().now()
    // I just don't know
    const newReply = db.prepare(
      `SELECT * FROM replies WHERE id = ?`
    ).get(id);
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
router.put('/replies/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  try {
    const reply = db.prepare('SELECT * FROM replies WHERE id = ?').get(id);

    if (!reply) {
      return res.status(404).send({ message: 'Reply not found' });
    }

    db.prepare('UPDATE replies SET body = ? WHERE id = ?').run(body, id);

    const updatedReply = db.prepare('SELECT * FROM replies WHERE id = ?').get(id);
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
