const express = require('express');
const http = require('http');
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

require('dotenv').config();
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');
const port = 3000;
let useHttps = process.env.USE_HTTPS === 'true';


const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

const httpServer = http.createServer(app);

let httpsServer;
if (useHttps) {
  try {
    const key = fs.readFileSync('./key.pem');
    const cert = fs.readFileSync('./cert.pem');
    httpsServer = https.createServer({ key, cert }, app);
    console.log('✅ HTTPS enabled');
  } catch (error) {
    console.error('❌ HTTPS certificates missing or invalid, falling back to HTTP.');
    useHttps = false;
  }
}

const io = new IO(useHttps ? httpsServer : httpServer, {
  cors: {
    // Don't forget to set this properly
    origin: '*',
  }
})
app.set('io', io);
socketIOLogic(io);


app.use('/auth', authRouter);
app.use(lecturesRouter);
app.use(questionsRouter);
app.use(repliesRouter);
app.use(announcementsRouter);
app.use(commentsRouter);

app.use((req, res, next) => {
  res.status(404).send({ message: 'Not found' });
});

if (useHttps) {
  httpsServer.listen(port, () => {
    console.log(`🚀 HTTPS Server running on https://localhost:${port}`);
  });
} else {
  httpServer.listen(port, () => {
    console.log(`🚀 HTTP Server running on http://localhost:${port}`);
  });
}
