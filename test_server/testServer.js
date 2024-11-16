const express = require('express');
const ImageKit = require('imagekit');
const app = express();
const cors = require('cors');
const port = 3000;

const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('./mockData');

app.use(express.json());
app.use(cors({origin: '*'}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
const ytdl = require('ytdl-core');
const { getTranscript } = require('youtube-transcript');

app.get('/audio-stream', async (req, res) => {
  const videoUrl = req.query.url;

  if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).send({ error: 'Invalid YouTube URL' });
  }

  try {
      const info = await ytdl.getInfo(videoUrl);
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

      res.setHeader('Content-Disposition', 'inline; filename="audio.mp3"');
      res.setHeader('Content-Type', 'audio/mpeg');


      ytdl(videoUrl, { format: audioFormat }).pipe(res);
  } catch (error) {
      console.error('Failed to stream audio:', error);
      res.status(500).send({ error: 'Failed to stream audio' });
  }
});

app.post('/subtitles', async (req, res) => {
    const videoUrl = req.body.url;
    const videoId = ytdl.getURLVideoID(videoUrl);

    try {
        const transcript = await getTranscript(videoId);
        console.log(transcript);
        res.send({ subtitles: transcript });
    } catch (error) {
      console.error(error);
        res.status(500).send({ error: 'Failed to retrieve subtitles' });
    }
});

app.post('/auth/login', (req, res) => {
	console.log(req.body);
  const { email, password } = req.body;
  if (email === 'admin' && password === 'admin') {
    res.send({ message: 'Logged in successfully',
			user: {
				email, password, id: 'testId',
        role: 'student'

			}
		 });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});


app.post('/auth/oauth/google', (req, res) => {
  const idToken  = req.body.token;
  console.log(idToken)
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  fetch(googleVerifyUrl)
    .then(response => response.json())
    .then(data => {
      if (data.email_verified) {
        res.send({ message: 'Logged in successfully',
          user: {
            email: data.email,
            id: data.sub,
            role: 'student'

          }
        });
      } else {
        res.status(401).send({ message: 'Email not verified' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    });
});

app.post('/auth/oauth/googleRegister', (req, res) => {
  const idToken  = req.body.token;
  console.log(idToken)
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  fetch(googleVerifyUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      if (data.email_verified) {
        res.send({ message: 'Logged in successfully',
          user: {
            email: data.email,
            id: data.sub,

          }
        });
      } else {
        res.status(401).send({ message: 'Email not verified' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    });
});

app.post('/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin' && password === 'admin') {
    res.send({ message: 'Logged in successfully',
      user: {
        email,
        password,
        id: 'testId',
        role: 'admin'
      }
    });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

app.post('/auth/admin/OAuth/google', (req, res) => {
  const idToken  = req.body.token;
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  fetch(googleVerifyUrl)
    .then(response => response.json())
    .then(data => {
      if (data.email_verified) {
        res.send({ message: 'Logged in successfully',
          user: {
            email: data.email,
            id: data.sub,
            role: 'admin'
          }
        });
      } else {
        res.status(401).send({ message: 'Email not verified' });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    });
});

const imagekit = new ImageKit({
  publicKey: 'public_tTc9vCi5O7L8WVAQquK6vQWNx08=',
  privateKey: 'private_edl1a45K3hzSaAhroLRPpspVRqM=',
  urlEndpoint: 'https://ik.imagekit.io/loayalsaid1/proLearningHub'
});

app.get('/auth/imagekit', (req, res) => {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  res.json(authenticationParameters);
});

app.post('/auth/register', (req, res) => {
  const { userData } = req.body;
  console.log(userData);
  const { email, firstName, lastName, userName, pictureId, pictureURL, id = 'fakeId' } = userData;

    res.status(201).json({
      user: {email, firstName, lastName, userName, pictureId, pictureURL, id},
      message: 'Email is already used, Please try another one or login',
    });
});

app.get('/courses/:courseId/lectures/:lectureId', (req, res) => {
  const courseId = req.params.courseId;
  const lectureId = req.params.lectureId;
  console.log(courseId, lectureId)
  const allowedLectures = mockSections.flatMap(section => section.lectures.map(lecture => lecture.id));
  if (courseId === "testId" && allowedLectures.includes(lectureId)) {
    res.json({lectureData: {
      id: lectureId,
      title: 'Week 4',
      videoLink: 'https://youtu.be/F9-yqoS7b8w',
      notes: 'https://cs50.harvard.edu/x/2024/notes/4/',
      audioLink: 'https://cs50.harvard.edu/college/2022/spring/lectures/4/wav/lecture4.wav',
      slides: 'https://cs50.harvard.edu/college/2022/spring/lectures/4/slides/lecture4.pdf',
      subtitles: 'https://cs50.harvard.edu/college/2022/spring/lectures/4/subtitles/lecture4.srt',
      transcript: 'https://cs50.harvard.edu/college/2022/spring/lectures/4/transcript',
      description: 'Pointers. Segmentation Faults. Dynamic Memory Allocation. Stack. Heap. Buffer Overflow. File I/O. Images.',
      demos: [
        {
          title: 'Demo: HTML/CSS',
          url: 'https://youtu.be/nM0x2vV6uG8?t=1019'
        },
        {
          title: 'Demo: JavaScript',
          url: 'https://youtu.be/nM0x2vV6uG8?t=1749'
        }
      ],
      shorts: [
        {
          title: 'Short: HTML/CSS',
          url: 'https://youtu.be/nM0x2vV6uG8?t=1273'
        },
        {
          title: 'Short: JavaScript',
          url: 'https://youtu.be/nM0x2vV6uG8?t=1993'
        }
      ],
      quizzez: [
        {
          title: 'Problem Set 4',
          url: 'https://cs50.harvard.edu/college/2022/spring/psets/4/'
        }
      ]
    }});
  } else if (courseId === "testId") {
    res.status(404).send({ message: 'Lecture not found' });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});


app.get('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  console.log(courseId);
  if (courseId === "testId") {
    res.json({sections: mockSections});
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

app.post('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  const { demos, description, extras, name, notesLink, section, slidesLink, tags, youtubeLink } = req.body;
  if (courseId === "testId") {
    const newLecture = {
      id: `lecture-${Date.now()}`,
      title: name,
      videoLink: youtubeLink,
      notes: notesLink,
      audioLink: '', // Add actual audio link if available
      slides: slidesLink,
      subtitles: '', // Add actual subtitles link if available
      transcript: '', // Add actual transcript link if available
      description,
      demos,
      shorts: [], // Add actual shorts if available
      quizzez: [], // Add actual quizzes if available
    };

    const existingSection = mockSections.find(sec => sec.title === section);
    if (existingSection) {
      existingSection.lectures.push(newLecture);
    } else {
      mockSections.push({ title: section, lectures: [newLecture] });
    }
    res.json(newLecture);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

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
  console.log(mockReplies)
  res.status(200).json(mockReplies[index]);
});

app.get('/announcements/:id/comments', (req, res) => {
  const announcementId = req.params.id;
  const ids = mockAnnouncements.map((announcement) => announcement.id);
  ids.push('testId');
  if (ids.includes(announcementId)) {
    res.json(mockComments);
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
app.use((req, res, next) => {
  res.status(404).send({ message: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
