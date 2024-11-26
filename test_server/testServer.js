const express = require('express');
const https = require('https');
const fs = require('fs');
const ImageKit = require('imagekit');
const app = express();
const cors = require('cors');

const authRouter = require('./routes/auth');
const lecturesRouter = require('./routes/lectures');
const questionsRouter = require('./routes/questions');
const repliesRouter = require('./routes/replies');
const announcementsRouter = require('./routes/announcements');


app.use(express.json());
app.use(cors({origin: '*'}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});


app.use('/auth', authRouter);
app.use(lecturesRouter);
app.use(questionsRouter);
app.use(repliesRouter);
app.use(announcementsRouter);


const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('./mockData');







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





app.delete('/comments/:commentId', (req, res) => {
  const { announcementId, commentId } = req.params;
  const index = mockComments.findIndex((comment) => comment.id === commentId);

  if (index === -1) {
    return res.status(404).send({ message: 'Comment not found' });
  }
  
  mockComments.splice(index, 1);
  res.status(200).json({ message: 'Comment deleted successfully' });
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





app.use((req, res, next) => {
  res.status(404).send({ message: 'Not found' });
});


const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const port = 3000;
const httpsServer = https.createServer({ key, cert }, app);
httpsServer.listen(port, () => {
  console.log(`Server started on https://localhost:${port}`);
});
