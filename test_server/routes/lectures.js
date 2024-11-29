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

// Get all lectures for a course split on sections
router.get('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  console.log(courseId);
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (course) {
    const sections = db
      .prepare('SELECT id, title, description FROM sections WHERE courseId = ?')
      .all(courseId);

    const lectureFields = [
      'id', 'title', 'description', 'tags'
    ].join(', ');

    const lectures = sections.map(section => ({
      ...section,
      lectures: db
        .prepare(`SELECT ${lectureFields} FROM lectures WHERE sectionId = ?`)
        .all(section.id),
    }));
    res.json({ sections: lectures });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get a specific lecture
router.get('/courses/:courseId/lectures/:lectureId', (req, res) => {
  const courseId = req.params.courseId;
  const lectureId = req.params.lectureId;
  console.log(courseId, lectureId);

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
  }

  const lectureFields = [
    'id',
    'title',
    'videoLink',
    'notes',
    'audioLink',
    'slides',
    'subtitles',
    'transcript',
    'description',
    'tags',
  ].join(', ');
  const lecture = db.prepare(`SELECT ${lectureFields} FROM lectures WHERE id = ?`).get(lectureId);
  if (!lecture) {
    return res.status(404).send({ message: 'Lecture not found' });
  }

  const getResource = (lectureId, type) => {
    return db.prepare(
      'SELECT title, url FROM lectureResources WHERE lectureId = ? AND type = ?'
    ).all(lectureId, type);
  };

  res.json({
    lectureData: {
      ...lecture,
      demos: getResource(lectureId, 'demo'),
      shorts: getResource(lectureId, 'short'),
      quizzez: getResource(lectureId, 'quiz')
    }
  });
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
