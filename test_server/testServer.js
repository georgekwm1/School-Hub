const express = require('express');
const https = require('https');
const fs = require('fs');
const ImageKit = require('imagekit');
const cors = require('cors');
const { Server: IO } = require('socket.io');
const socketIOLogic = require('./socketIO/server');
const db = require('./connect');
const authRouter = require('./routes/auth');
const lecturesRouter = require('./routes/lectures');
const questionsRouter = require('./routes/questions');
const repliesRouter = require('./routes/replies');
const announcementsRouter = require('./routes/announcements');
const commentsRouter = require('./routes/comments');


const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use('/auth', authRouter);
app.use(lecturesRouter);
app.use(questionsRouter);
app.use(repliesRouter);
app.use(announcementsRouter);
app.use(commentsRouter);

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

const io = new IO(httpsServer, {
  cors: {
    // Don't forget to set this properly
    origin: '*',
  }
})
socketIOLogic(io);
app.set('io', io);
