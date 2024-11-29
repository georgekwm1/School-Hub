const express = require('express');
const {v4: uuidv4} = require('uuid');
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

// Get all lectures for a course
router.get('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  console.log(courseId);
  if (courseId === 'testId') {
    res.json({ sections: mockSections });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get a specific lecture
router.get('/courses/:courseId/lectures/:lectureId', (req, res) => {
  const courseId = req.params.courseId;
  const lectureId = req.params.lectureId;
  console.log(courseId, lectureId);
  const allowedLectures = mockSections.flatMap((section) =>
    section.lectures.map((lecture) => lecture.id)
  );
  if (courseId === 'testId' && allowedLectures.includes(lectureId)) {
    res.json({
      lectureData: {
        id: lectureId,
        title: 'Week 4',
        section: 'Low Level Programming',
        videoLink: 'https://youtu.be/F9-yqoS7b8w',
        notes: 'https://cs50.harvard.edu/x/2024/notes/4/',
        audioLink:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/wav/lecture4.wav',
        slides:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/slides/lecture4.pdf',
        subtitles:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/subtitles/lecture4.srt',
        transcript:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/transcript',
        description:
          'Pointers. Segmentation Faults. Dynamic Memory Allocation. Stack. Heap. Buffer Overflow. File I/O. Images.',
        tags: [
          'pointers',
          'segmentation faults',
          'dynamic memory allocation',
          'stack',
          'heap',
          'buffer overflow',
          'file i/o',
          'images',
        ],
        demos: [
          {
            title: 'Demo: HTML/CSS',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1019',
          },
          {
            title: 'Demo: JavaScript',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1749',
          },
        ],
        shorts: [
          {
            title: 'Short: HTML/CSS',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1273',
          },
          {
            title: 'Short: JavaScript',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1993',
          },
        ],
        quizzez: [
          {
            title: 'Problem Set 4',
            url: 'https://cs50.harvard.edu/college/2022/spring/psets/4/',
          },
        ],
      },
    });
  } else if (courseId === 'testId') {
    res.status(404).send({ message: 'Lecture not found' });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get all section titles for creating a lecture
router.get('/courses/:id/sections_titles', (req, res) => {
  const courseId = req.params.id;
  const stmt = db.prepare('SELECT title FROM sections where courseId = ?');
  const sectionTitles = stmt.all(courseId).map(row => row.title);
  res.json(sectionTitles);
});

// create a course lecture
router.post('/courses/:id/lectures', (req, res) => {
  // Oh, Boy, This is big.
  const { id: courseId } = req.params;
  const { demos, description, extras: shorts, name: title, notesLink, section, slidesLink, tags, youtubeLink } = req.body;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).send({ message: 'Course not found' });
  try {
    db.transaction(() => {
      // Retrieve or create section basd on existence of ht title
      let sectionId = db.prepare('SELECT id FROM sections WHERE title = ?').get(section)?.id;
      if (!sectionId) {
        sectionId = uuidv4();
        db.prepare('INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)').run(sectionId, section, courseId);
      }

      // Create lecture
      const lectureId = uuidv4();
      db.prepare(`
        INSERT INTO lectures (id, title, description, tags, videoLink, notes, slides, userId, courseId, sectionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(lectureId, title, description, tags.join(','), youtubeLink, notesLink, slidesLink, 'admin', courseId, sectionId);
  
      // Insert resources
      const insertResource = (resource, type) => db.prepare(`
        INSERT INTO lectureResources (id, title, url, type, lectureId) 
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), resource.title, resource.url, type, lectureId);
  
      demos.forEach(demo => insertResource(demo, 'demo'));
      shorts.forEach(short => insertResource(short, 'short'));
  
      res.status(201).json({
        id: lectureId,
        title,
        description,
        section,
        notes: notesLink,
        slides: slidesLink,
        videoLink: youtubeLink,
        audioLink: '',
        subtitles: '',
        transcript: '',
        tags,
        demos,
        shorts,
        quizzez: [],
      });
    })();          
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error creating lecture' });
  }
});

// Edit a lecture
router.put('/lectures/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    youtubeLink,
    notesLink,
    slidesLink,
    section,
    extras,
    tags,
    demos,
  } = req.body;

  const index = mockSections
    .flatMap((section) => section.lectures)
    .findIndex((lecture) => lecture.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Lecture not found' });
  }

  const lecture = mockSections.flatMap((section) => section.lectures)[index];
  lecture.title = name;
  lecture.description = description;
  lecture.videoLink = youtubeLink;
  lecture.notes = notesLink;
  lecture.slides = slidesLink;
  lecture.section = section;
  lecture.shorts = extras;
  lecture.demos = demos;
  lecture.tags = tags;

  res.status(200).json(lecture);
});

// delete a lecture
router.delete('/lectures/:id', (req, res) => {
  const lectureId = req.params.id;
  const index = mockSections.findIndex(
    (section) =>
      section.lectures.findIndex((lecture) => lecture.id === lectureId) !== -1
  );

  if (index === -1) {
    return res.status(404).send({ message: 'Lecture not found' });
  }
  const lectureIndex = mockSections[index].lectures.findIndex(
    (lecture) => lecture.id === lectureId
  );
  mockSections[index].lectures.splice(lectureIndex, 1);
  res.status(200).json({ message: 'Lecture deleted successfully' });
});

module.exports = router;
