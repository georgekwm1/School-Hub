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
const { verifyToken } = require('../middlewares/authMiddlewares');
const { verify } = require('jsonwebtoken');
const {
  isCourseAdmin,
  isUserEnroledInCourse,
} = require('../helperFunctions');
const router = express.Router();

// Get all lectures for a course split on sections
// Here nothing much to be done regardig the token
// becuase anywaye the overhead of checking different courses
// and all this is not there yet.. and the login is already made for
// a specific course
// so. if he is logged in.. he is in teh course already
// But hold on.. I can do somehting.... 
// I don't know if it's necessary or not now..
// but i can actually send the courseId with the token
// Oh boy.. I think i did forget to make the enrollment table.. what a brilliane mind I have!
// I totally forgot..
// I think now, i'm going to make it as many to many relationshitp and now. I can check 
// if the user is in that course or not..
// But this is a test server any way!
// the dealine is very tight now.. I'm going to leave theis part of the git requests
// and I will just keep with that part of editing and adding.. sinse I will check if the user
// is an admin or not..
// I forgot about that.. and I've very running out of time
router.get('/courses/:id/lectures', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.userId;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    res.status(404).send({ message: 'Course not found' });
  }

  if (!isUserEnroledInCourse(userId, courseId)) {
    res.status(403).send({ message: 'User is not enrolled in this course' });
  }

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
});

// Get a specific lecture
router.get('/courses/:courseId/lectures/:lectureId', verifyToken, (req, res) => {
  const courseId = req.params.courseId;
  const lectureId = req.params.lectureId;
  const userId = req.userId;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
  }

  if (!isUserEnroledInCourse(userId, courseId)) {
    return res.status(403).send({ message: 'User is not enrolled in this course' });
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
      tags: lecture.tags.split(','),
      demos: getResource(lectureId, 'demo'),
      shorts: getResource(lectureId, 'short'),
      quizzez: getResource(lectureId, 'quiz')
    }
  });
});

// Get all section titles for creating a lecture
router.get('/courses/:id/sections_titles', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const stmt = db.prepare('SELECT title FROM sections where courseId = ?');
  const sectionTitles = stmt.all(courseId).map(row => row.title);
  res.json(sectionTitles);
});

// create a course lecture
router.post('/courses/:id/lectures', verifyToken, (req, res) => {
  // Oh, Boy, This is big.
  const { id: courseId } = req.params;
  const userId = req.userId;
  const { demos, description, extras: shorts, name: title, notesLink, section, slidesLink, tags, youtubeLink } = req.body;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).send({ message: 'Course not found' });

  if (!isCourseAdmin(userId, courseId)) return res.status(403).send({ message: 'User is not a course admin' });

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
      `).run(lectureId, title, description, tags.join(','), youtubeLink, notesLink, slidesLink, userId, courseId, sectionId);
  
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
router.put('/lectures/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    youtubeLink,
    notesLink,
    slidesLink,
    section,
    extras: shorts,
    tags,
    demos,
  } = req.body;
  const userId = req.userId;
  const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(id);

  if (!lecture) {
    return res.status(404).send({ message: 'Lecture not found' });
  }

  if (!isCourseAdmin(userId, lecture.courseId)) return res.status(403).send({ message: "User don't have previlate to delete this lecture" });

  try {
    db.transaction(() => {
      let sectionId;
      const sectionLecture = db.prepare('SELECT id FROM sections WHERE title = ?').get(section);
      if (sectionLecture) {
        sectionId = sectionLecture.id;
      } else {
        sectionId = uuidv4();
        db.prepare('INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)').run(sectionId, section, lecture.courseId);
      }

      db.prepare(`
        UPDATE lectures
        SET title = ?, description = ?, videoLink = ?, notes = ?, slides = ?, sectionId = ?, tags = ?
        WHERE id = ?
      `).run(name, description, youtubeLink, notesLink, slidesLink, sectionId, tags.join(','), id);

      db.prepare('DELETE FROM lectureResources WHERE lectureId = ?').run(id);

      const insertResource = (resource, type) => db.prepare(`
        INSERT INTO lectureResources (id, title, url, type, lectureId) 
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), resource.title, resource.url, type, id);

      demos.forEach(demo => insertResource(demo, 'demo'));
      shorts.forEach(short => insertResource(short, 'short'));

      const lectureFields = [
        'id', 'title', 'description', 'notes', 'videoLink', 
        'slides', 'subtitles', 'transcript', 'audioLink',
        'sectionId'
      ].join(', ');
      const updatedLecture = db.prepare(`SELECT ${lectureFields} FROM lectures WHERE id = ?`).get(id);
      // I some how in the hurry forgot all about quizez.. so.. this is to fixes system wide next
      res.status(200).json({...updatedLecture, tags, demos, shorts, quizzez: []});
    })();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error updating lecture' });
  }
});

// delete a lecture
router.delete('/lectures/:id', verifyToken, (req, res) => {
  const lectureId = req.params.id;
  const userId = req.userId;

  try {
    const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(lectureId);
    if (!lecture) {
      return res.status(404).send({ message: 'Lecture not found' });
    }

    if (!isCourseAdmin(userId, lecture.courseId)) return res.status(403).send({ message: 'User is not a course admin' });

    db.transaction(() => {
      const sectionId = db.prepare(
        `SELECT sectionId FROM lectures WHERE id = ?`
      ).get(lectureId).sectionId;
      db.prepare('DELETE FROM lectures WHERE id = ?').run(lectureId);

      const lectures = db.prepare(
        'SELECT id  FROM lectures WHERE sectionId = ?'
      ).all(sectionId);
      if (lectures.length === 0) {
        db.prepare('DELETE FROM sections WHERE id = ?').run(sectionId);
      }
      res.status(200).json({ message: 'Lecture deleted successfully' });
    })();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error deleting lecture' });
  }
});

module.exports = router;
