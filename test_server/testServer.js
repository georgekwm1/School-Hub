const express = require('express');
const https = require('https');
const fs = require('fs');
const ImageKit = require('imagekit');
const app = express();
const cors = require('cors');
const port = 3000;

const authRouter = require('./routes/auth');
const lecturesRouter = require('./routes/lectures');


const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

app.use(express.json());
app.use(cors({origin: '*'}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


app.use('/auth', authRouter);
app.use(lecturesRouter);


const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('./mockData');

app.get('/lectures/:id/discussion', (req, res) => {
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

app.post('/lectures/:id/discussion', (req, res) => {
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

app.get('/courses/:id/general_discussion', (req, res) => {
  const id = req.params.id;
  if (id === "testId") {
    res.json(mockDiscussion);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

app.post('/courses/:id/general_discussion', (req, res) => {
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

app.get('/questions/:id/replies', (req, res) => {
  const questionId = req.params.id;

  const question = mockDiscussion.find(q => q.id === questionId);

  if (!question) {
    return res.status(404).send({ message: 'Question not found' });
  }

  res.json({ question: {...question, lectureId: 'cs50-lecture-0'}, repliesList });
});

app.post('/questions/:id/replies', (req, res) => {
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

app.post('/questions/:id/vote', (req, res) => {
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

app.get('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;

  // Mock announcements data


  if (courseId === "testId") {
    res.json(mockAnnouncements);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

app.post('/courses/:id/announcements', (req, res) => {
  const courseId = req.params.id;
  const { userId, title, details } = req.body;

  if (!userId || !title || !details) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const newAnnouncement = {
    id: `announcement-${Date.now()}`,
    courseId,
    user: {
      id: 'testId',
      name: 'John Doe',
      pictureThumbnail: `https://picsum.photos/200/${Math.floor(Math.random() * 100) + 300}`,
    },
    title,
    body: details,
    commentsCount: 0,
    updatedAt: new Date().toISOString(),
  };

  // Here you would typically add the newAnnouncement to your database or data store.
  // For this example, we'll just return it in the response.
  mockAnnouncements.unshift(newAnnouncement);

  res.status(201).json(newAnnouncement);
});

app.post('/replies/:id/vote', (req, res) => {
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

app.get('/announcements/:id/comments', (req, res) => {
  const announcementId = req.params.id;
  const ids = mockAnnouncements.map((announcement) => announcement.id);
  // This is stupid.. I dont' know what I was thingking when i was creating this
  // at first.. may be i wanted to test erro rmesages or
  ids.push(announcementId);
  if (ids.includes(announcementId)) {
    const comments = mockComments.filter(com => com.announcementId === announcementId);
    res.json(comments.map(com => ({...com, announcementId})));
  } else {
    res.status(404).send({ message: 'Announcement not found' });
  }
});

app.post('/announcements/:id/comments', (req, res) => {
  const announcementId = req.params.id;
  const { userId, comment } = req.body;

  if (!userId || !comment) {
    return res.status(400).send({ message: 'Missing required fields' });
  }
  console.log(comment)
  const newComment = {
    announcementId,
    id: `comment-${Date.now()}`,
    user: {
      id: Math.random() < 0.5 ? 'testId' : 'somethingElse',
      name: 'Anonymous',
      pictureThumbnail: `https://picsum.photos/100`,
    },
    updatedAt: new Date().toISOString(),
    body: comment,
  };

  // Here you would typically add the newComment to your database or data store.
  // For this example, we'll just return it in the response.
  mockComments.unshift(newComment);

  res.status(201).json(newComment);
});

app.delete('/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const index = mockDiscussion.findIndex((question) => question.id === questionId);

  if (index === -1) {
    return res.status(404).send({ message: 'Question not found' });
  }
  mockDiscussion.splice(index, 1);
  res.status(200).json({ message: 'Question deleted successfully' });
});

app.delete('/replies/:id', (req, res) => {
  const replyId = req.params.id;
  const index = mockReplies.findIndex((reply) => reply.id === replyId);

  if (index === -1) {
    return res.status(404).send({ message: 'Reply not found' });
  }
  
  mockReplies.splice(index, 1);
  res.status(200).json({ message: 'Reply deleted successfully' });
});

app.delete('/comments/:commentId', (req, res) => {
  const { announcementId, commentId } = req.params;
  const index = mockComments.findIndex((comment) => comment.id === commentId);

  if (index === -1) {
    return res.status(404).send({ message: 'Comment not found' });
  }
  
  mockComments.splice(index, 1);
  res.status(200).json({ message: 'Comment deleted successfully' });
});

app.delete('/announcements/:id', (req, res) => {
  const announcementId = req.params.id;
  const index = mockAnnouncements.findIndex((announcement) => announcement.id === announcementId);

  if (index === -1) {
    return res.status(404).send({ message: 'Announcement not found' });
  }
  mockAnnouncements.splice(index, 1);
  res.status(200).json({ message: 'Announcement deleted successfully' });
});


app.put('/announcements/:id', (req, res) => {
  const { id } = req.params;
  const { title, details } = req.body;

  const index = mockAnnouncements.findIndex((announcement) => announcement.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Announcement not found' });
  }

  mockAnnouncements[index].title = title;
  mockAnnouncements[index].body = details;

  res.status(200).json(mockAnnouncements[index]);
});

app.put('/comments/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  const index = mockComments.findIndex((comment) => comment.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Comment not found' });
  }

  mockComments[index].body = body;

  res.status(200).json(mockComments[index]);
});

app.put('/questions/:id', (req, res) => {
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

app.put('/replies/:id', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  const index = mockReplies.findIndex((reply) => reply.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Reply not found' });
  }

  mockReplies[index].body = body;

  res.status(200).json(mockReplies[index]);
});


app.use((req, res, next) => {
  res.status(404).send({ message: 'Not found' });
});

const httpsServer = https.createServer({ key, cert }, app);
httpsServer.listen(port, () => {
  console.log(`Server started on https://localhost:${port}`);
});
