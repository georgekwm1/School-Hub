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
const { verifyToken } = require('../middlewares/authMiddlewares');
const { verify } = require('jsonwebtoken');
const {
  isCourseAdmin,
  isUserEnroledInCourse,
  getCurrentTimeInDBFormat,
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
  const { lastFetched } = req.query;
  const userId = req.userId;

  const [course] = db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) {
    return res.status(404).send({ message: 'Course not found' });
  }

  if (
    !isUserEnroledInCourse(userId, courseId) &&
    !isCourseAdmin(userId, courseId)
  ) {
    return res
      .status(403)
      .send({ message: 'User is not enrolled in this course' });
  }

  const sections = db.execute(
    'SELECT id, title, description FROM sections WHERE courseId = ?',
    [courseId]
  );

  const lectureFields = ['id', 'title', 'description', 'tags'].join(', ');

  const lectures = sections.map((section) => ({
    ...section,
    lectures: db.execute(
        `SELECT ${lectureFields} FROM lectures WHERE sectionId = ? 
        ${lastFetched ? 'AND createdAt > ?' : ''}`,
        [section.id, ...(lastFetched ? [lastFetched] : [])],
    ),
  }));

  // Filter empty sections
  const result = lectures.filter((section) => section.lectures.length > 0);
  res.json({ sections: result, lastFetched: getCurrentTimeInDBFormat() });
});

// Get a specific lecture
router.get(
  '/courses/:courseId/lectures/:lectureId',
  verifyToken,
  (req, res) => {
    const courseId = req.params.courseId;
    const lectureId = req.params.lectureId;
    // representing the updatedAt value stored in userCache
    // sinse fetching the lecture befroe
    const updatedAt = req.query.updatedAt;
    const userId = req.userId;

    const [course] = db.execute(
      'SELECT * FROM courses WHERE id = ?', [courseId]
    );
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    if (
      !isUserEnroledInCourse(userId, courseId) &&
      !isCourseAdmin(userId, courseId)
    ) {
      return res
        .status(403)
        .send({ message: 'User is not enrolled in this course' });
    }

    const lectureFields = [
      'id',
      'updatedAt',
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
    const [lecture] = db.execute(
      `SELECT ${lectureFields} FROM lectures WHERE id = ?`, [lectureId]
    )
    if (!lecture) {
      return res.status(404).send({ message: 'Lecture not found' });
    } else if (lecture.updatedAt === updatedAt) {
      return res.status(304).send({ message: 'Lecture not updated' });
    }

    const getResource = (lectureId, type) => {
      return db.execute(
          'SELECT title, url FROM lectureResources WHERE lectureId = ? AND type = ?',
          [lectureId, type]
      );
    };

    res.json({
      lectureData: {
        ...lecture,
        tags: lecture.tags.split(','),
        demos: getResource(lectureId, 'demo'),
        shorts: getResource(lectureId, 'short'),
        quizzez: getResource(lectureId, 'quiz'),
      },
    });
  }
);

// Get all section titles for creating a lecture
router.get('/courses/:id/sections_titles', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const stmt = 'SELECT title FROM sections where courseId = ?';
  const sectionTitles = db.execute(stmt, [courseId], pluck=true);
  res.json(sectionTitles);
});

// create a course lecture
router.post('/courses/:id/lectures', verifyToken, (req, res) => {
  // Oh, Boy, This is big.
  const { id: courseId } = req.params;
  const io = req.app.get('io');
  const userId = req.userId;
  const {
    demos,
    description,
    extras: shorts,
    name: title,
    notesLink,
    section,
    slidesLink,
    tags,
    youtubeLink,
  } = req.body;

  const [course] = db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) return res.status(404).send({ message: 'Course not found' });

  if (!isCourseAdmin(userId, courseId))
    return res.status(403).send({ message: 'User is not a course admin' });

  try {
    db.transaction(async (connection) => {
      // Retrieve or create section basd on existence of ht title
      // I'm skeptic about how good this flag approach is
      // For later to decide the socketIo event to emit;
      let newSection = false;
      let [sectionId] = connection.execute(
        'SELECT id FROM sections WHERE title = ?', [section], pluck=true
      );
      if (!sectionId) {
        newSection = true;
        sectionId = uuidv4();
        connection.execute(
          'INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)',
          [sectionId, section, courseId]
        );
      }

      // Create lecture
      const lectureId = uuidv4();
      connection.execute(
        `
        INSERT INTO lectures (id, title, description, tags, videoLink, notes, slides, userId, courseId, sectionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          lectureId,
          title,
          description,
          tags.join(','),
          youtubeLink ?? '',
          notesLink ?? '',
          slidesLink ?? '',
          userId,
          courseId,
          sectionId
        ]
      );

      // Insert resources
      const insertResource = (resource, type) =>
        connection.execute(
          `INSERT INTO lectureResources (id, title, url, type, lectureId) 
          VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), resource.title, resource.url, type, lectureId]
        );

      demos.forEach((demo) => insertResource(demo, 'demo'));
      shorts.forEach((short) => insertResource(short, 'short'));

      const newLecture = {
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
      };
      res.status(201).json(newLecture);

      // I think this one the most obvious reasons that I have to move io events to
      // Separate middlewares next sprint..
      // Also.. now I know why in express .. I see teh routes in a place
      // and the actually logic in another place...
      // to be able to put middlewares as needes..
      // because here if i try that.. i will have to put the middleware after the function ends.
      // Which seems very ugly.
      const lastFetched = getCurrentTimeInDBFormat();
      const room = `sections-${courseId}`;
      if (!newSection) {
        io.to(room)
          .except(`user-${userId}`)
          .emit('lectureCreated', {
            payload: {
              sectionId,
              lecture: {
                id: lectureId,
                title,
                description,
                tags,
              },
              lastFetched,
            },
            userId,
          });
      } else {
        const [section] = connection.execute(
          'SELECT id, title, description FROM sections WHERE id = ?',
          [sectionId],
        );
        // Should the event be more clear?
        // Like, newlectureWithNewSection?! I don't know
        io.to(room)
          .except(`user-${userId}`)
          .emit('sectionCreated', {
            payload: {
              newSection: {
                ...section,
                lectures: [{ id: lectureId, title, description, tags }],
              },
              lastFetched,
            },
            userId,
          });
      }
    })();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error creating lecture' });
  }
});

// Edit a lecture
router.put('/lectures/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const io = req.app.get('io');
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

  if (!isCourseAdmin(userId, lecture.courseId))
    return res
      .status(403)
      .send({ message: "User don't have previlate to delete this lecture" });

  try {
    db.transaction(() => {
      let sectionId;
      const sectionLecture = db
        .prepare('SELECT id FROM sections WHERE title = ?')
        .get(section);
      if (sectionLecture) {
        sectionId = sectionLecture.id;
      } else {
        sectionId = uuidv4();
        db.prepare(
          'INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)'
        ).run(sectionId, section, lecture.courseId);
      }

      db.prepare(
        `
        UPDATE lectures
        SET title = ?, description = ?, videoLink = ?, notes = ?, slides = ?, sectionId = ?, tags = ?
        WHERE id = ?
      `
      ).run(
        name,
        description,
        youtubeLink,
        notesLink,
        slidesLink,
        sectionId,
        tags.join(','),
        id
      );

      db.prepare('DELETE FROM lectureResources WHERE lectureId = ?').run(id);

      const insertResource = (resource, type) =>
        db
          .prepare(
            `
        INSERT INTO lectureResources (id, title, url, type, lectureId) 
        VALUES (?, ?, ?, ?, ?)
      `
          )
          .run(uuidv4(), resource.title, resource.url, type, id);

      demos.forEach((demo) => insertResource(demo, 'demo'));
      shorts.forEach((short) => insertResource(short, 'short'));

      const lectureFields = [
        'id',
        'title',
        'description',
        'notes',
        'videoLink',
        'slides',
        'subtitles',
        'transcript',
        'audioLink',
        'sectionId',
      ].join(', ');
      const updatedLecture = db
        .prepare(`SELECT ${lectureFields} FROM lectures WHERE id = ?`)
        .get(id);
      // I some how in the hurry forgot all about quizez.. so.. this is to fixes system wide next
      const response = { ...updatedLecture, tags, demos, shorts, quizzez: [] };
      res.status(200).json(response);

      io.to([`sections-${lecture.courseId}`, `lecture-${id}`])
        .except(`user-${userId}`)
        .emit('lectureUpdated', {
          payload: { updatedLecture: response },
          userId,
        });
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
  const io = req.app.get('io');

  try {
    const lecture = db
      .prepare('SELECT * FROM lectures WHERE id = ?')
      .get(lectureId);
    if (!lecture) {
      return res.status(404).send({ message: 'Lecture not found' });
    }

    if (!isCourseAdmin(userId, lecture.courseId))
      return res.status(403).send({ message: 'User is not a course admin' });

    db.transaction(() => {
      const sectionId = db
        .prepare(`SELECT sectionId FROM lectures WHERE id = ?`)
        .get(lectureId).sectionId;
      db.prepare('DELETE FROM lectures WHERE id = ?').run(lectureId);

      const lectures = db
        .prepare('SELECT id  FROM lectures WHERE sectionId = ?')
        .all(sectionId);
      if (lectures.length === 0) {
        db.prepare('DELETE FROM sections WHERE id = ?').run(sectionId);
      }
      res.status(200).json({ message: 'Lecture deleted successfully' });

      io.to([`sections-${lecture.courseId}`, `lecture-${lectureId}`])
        .except(`user-${userId}`)
        .emit('lectureDeleted', {
          payload: { lectureId, sectionId },
          userId,
        });
    })();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error deleting lecture' });
  }
});

// Sync existing data
router.post('/courses/:id/lectures/diff', (req, res) => {
  const courseId = req.params.id;
  const { entries, lastSynced } = req.body;
  const userId = req.userId;

  const course = db.prepare('SELECT 1 FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).send({ message: 'Course not found' });

  if (typeof entries !== 'object' || entries === null || lastSynced === null)
    return res.status(400).send({ message: 'Missing or invalid entries' });

  result = {
    updated: {},
    deleted: {
      sections: [],
      lectures: {},
    },
  };
  try {
    const dbSections = db
      .prepare(`SELECT id FROM sections WHERE courseId = ? AND createdAt <= ?`)
      .pluck()
      .all(courseId, lastSynced);

    for (const section of dbSections) {
      const sectionLectures = db
        .prepare(
          `SELECT id, title, description, tags,
          (updatedAt >= @lastSynced ) as isChanged
        FROM lectures WHERE sectionId = @sectionId AND createdAt <= @lastSynced`
        )
        .all({ sectionId: section, lastSynced });

      for (const lecture of sectionLectures) {
        if (lecture.isChanged) {
          if (!result.updated[section]) result.updated[section] = [];
          delete lecture.isChanged;
          result.updated[section].push(lecture);
        }
      }

      // Deleted lectures
      const existingIds = sectionLectures.map((lecture) => lecture.id);
      result.deleted.lectures[section] = entries[section].filter(
        (lectureId) => !existingIds.includes(lectureId)
      );
    }

    // Deleted sections
    const userSections = Object.keys(entries);
    result.deleted.sections = userSections.filter(
      (sectionId) => !dbSections.includes(sectionId)
    );

    res.status(200).json({
      entries: result,
      lastSynced: getCurrentTimeInDBFormat(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error', error });
  }
});

module.exports = router;
