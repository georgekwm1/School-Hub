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
router.get('/courses/:id/lectures', verifyToken, async (req, res) => {
  const courseId = req.params.id;
  const { lastFetched } = req.query;
  const userId = req.userId;

  try {
    const [course] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    if (
      !isUserEnroledInCourse(userId, courseId) &&
      !await isCourseAdmin(userId, courseId)
    ) {
      return res
        .status(403)
        .send({ message: 'User is not enrolled in this course' });
    }

    const sections = await db.execute(
      'SELECT id, title, description FROM sections WHERE courseId = ?',
      [courseId]
    );

    const lectureFields = ['id', 'title', 'description', 'tags'].join(', ');

    const lectures = [];
    for (const section of sections) {
      const sectionLectures = await db.execute(
        `SELECT ${lectureFields} FROM lectures WHERE sectionId = ? 
        ${lastFetched ? 'AND createdAt > ?' : ''}`,
        [section.id, ...(lastFetched ? [lastFetched] : [])],
      )
      lectures.push({...section, lectures: sectionLectures});
    };
    console.log(sections, lectures);
    // Filter empty sections
    const result = lectures.filter((section) => section.lectures.length > 0);
    res.json({ sections: result, lastFetched: getCurrentTimeInDBFormat() });
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Error getting the lectures'});
  }
});

// Get a specific lecture
router.get(
  '/courses/:courseId/lectures/:lectureId',
  verifyToken,
  async (req, res) => {
    const courseId = req.params.courseId;
    const lectureId = req.params.lectureId;
    // representing the updatedAt value stored in userCache
    // sinse fetching the lecture befroe
    const updatedAt = req.query.updatedAt;
    const userId = req.userId;

    const [course] = await db.execute(
      'SELECT * FROM courses WHERE id = ?', [courseId]
    );
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    if (
      !isUserEnroledInCourse(userId, courseId) &&
      !await isCourseAdmin(userId, courseId)
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
    const [lecture] = await db.execute(
      `SELECT ${lectureFields} FROM lectures WHERE id = ?`, [lectureId]
    )
    if (!lecture) {
      return res.status(404).send({ message: 'Lecture not found' });
    } else if (lecture.updatedAt === updatedAt) {
      return res.status(304).send({ message: 'Lecture not updated' });
    }

    const getResource = async (lectureId, type) => {
      return await db.execute(
          'SELECT title, url FROM lectureResources WHERE lectureId = ? AND type = ?',
          [lectureId, type]
      );
    };

    res.json({
      lectureData: {
        ...lecture,
        tags: lecture.tags.split(','),
        demos: await getResource(lectureId, 'demo'),
        shorts: await getResource(lectureId, 'short'),
        quizzez: await getResource(lectureId, 'quiz'),
      },
    });
  }
);

// Get all section titles for creating a lecture
router.get('/courses/:id/sections_titles', verifyToken, async (req, res) => {
  const courseId = req.params.id;
  const stmt = 'SELECT title FROM sections where courseId = ?';
  const sectionTitles = await db.execute(stmt, [courseId], pluck=true);
  res.json(sectionTitles);
});

// create a course lecture
router.post('/courses/:id/lectures', verifyToken, async (req, res) => {
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

  const [course] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
  if (!course) return res.status(404).send({ message: 'Course not found' });

  if (!await isCourseAdmin(userId, courseId))
    return res.status(403).send({ message: 'User is not a course admin' });

  try {
    await db.transaction(async (connection) => {
      // Retrieve or create section basd on existence of ht title
      // I'm skeptic about how good this flag approach is
      // For later to decide the socketIo event to emit;
      let newSection = false;
      let [sectionId] = await connection.queryWithPluck(
        'SELECT id FROM sections WHERE title = ?', [section], pluck=true
      );
      if (!sectionId) {
        newSection = true;
        sectionId = uuidv4();
        await connection.executeWithPluck(
          'INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)',
          [sectionId, section, courseId]
        );
      }

      // Create lecture
      const lectureId = uuidv4();
      await connection.executeWithPluck(
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
      const insertResource = async (resource, type) =>
        await connection.executeWithPluck(
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
        const [section] = await connection.executeWithPluck(
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error creating lecture' });
  }
});

// Edit a lecture
router.put('/lectures/:id', verifyToken, async (req, res) => {
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
  const [lecture] = await db.execute('SELECT * FROM lectures WHERE id = ?', [id]);

  if (!lecture) {
    return res.status(404).send({ message: 'Lecture not found' });
  }

  if (!await isCourseAdmin(userId, lecture.courseId))
    return res
      .status(403)
      .send({ message: "User don't have previlate to delete this lecture" });

  try {
    await db.transaction(async (connection) => {
      let sectionId;
      // WHat a name i used! 🙂🙁
      const [sectionLecture] = await connection.queryWithPluck(
        'SELECT id FROM sections WHERE title = ?', [section]
      );
      console.log(sectionLecture)
      if (sectionLecture) {
        sectionId = sectionLecture.id;
      } else {
        sectionId = uuidv4();
        await connection.queryWithPluck(
          'INSERT INTO sections (id, title, courseId) VALUES (?, ?, ?)',
          [sectionId, section, lecture.courseId],
        );
      }

      await connection.queryWithPluck(
        `UPDATE lectures
        SET title = ?, description = ?, videoLink = ?, notes = ?, slides = ?, sectionId = ?, tags = ?
        WHERE id = ?`,
        [
          name,
          description,
          youtubeLink,
          notesLink,
          slidesLink,
          sectionId,
          tags.join(','),
          id
        ]
      );

      await connection.queryWithPluck('DELETE FROM lectureResources WHERE lectureId = ?', [id]);

      const insertResource = async (resource, type) =>
        await connection.executeWithPluck(
          `INSERT INTO lectureResources (id, title, url, type, lectureId) 
          VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), resource.title, resource.url, type, id],
        );

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
      const [updatedLecture] = await connection.queryWithPluck(
        `SELECT ${lectureFields} FROM lectures WHERE id = ?`,
        [id],
      )
      // I some how in the hurry forgot all about quizez.. so.. this is to fixes system wide next
      const response = { ...updatedLecture, tags, demos, shorts, quizzez: [] };
      res.status(200).json(response);

      io.to([`sections-${lecture.courseId}`, `lecture-${id}`])
        .except(`user-${userId}`)
        .emit('lectureUpdated', {
          payload: { updatedLecture: response },
          userId,
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error updating lecture' });
  }
});

// delete a lecture
router.delete('/lectures/:id', verifyToken, async (req, res) => {
  const lectureId = req.params.id;
  const userId = req.userId;
  const io = req.app.get('io');

  try {
    const [lecture] = await db.query(
      'SELECT * FROM lectures WHERE id = ?',
      [lectureId]
    )
    if (!lecture) {
      return res.status(404).send({ message: 'Lecture not found' });
    }

    if (!await isCourseAdmin(userId, lecture.courseId))
      return res.status(403).send({ message: 'User is not a course admin' });

    await db.transaction(async (connection) => {
      const [sectionId] = await connection.queryWithPluck(
        `SELECT sectionId FROM lectures WHERE id = ?`,
        [lectureId],
        pluck=true,
      );
      await connection.queryWithPluck('DELETE FROM lectures WHERE id = ?', [lectureId]);

      const lectures = await connection.queryWithPluck(
        'SELECT id  FROM lectures WHERE sectionId = ?',
        [sectionId],
      );
      if (lectures.length === 0) {
        await connection.queryWithPluck('DELETE FROM sections WHERE id = ?', [sectionId]);
      }
      res.status(200).json({ message: 'Lecture deleted successfully' });

      io.to([`sections-${lecture.courseId}`, `lecture-${lectureId}`])
        .except(`user-${userId}`)
        .emit('lectureDeleted', {
          payload: { lectureId, sectionId },
          userId,
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error deleting lecture' });
  }
});

// Sync existing data
router.post('/courses/:id/lectures/diff', async (req, res) => {
  const courseId = req.params.id;
  const { entries, lastSynced } = req.body;
  const userId = req.userId;

  const [course] = await db.query('SELECT 1 FROM courses WHERE id = ?', [courseId]);
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
    const dbSections = await db.query(
      `SELECT id FROM sections WHERE courseId = ? AND createdAt <= ?`,
      [courseId, lastSynced],
      pluck=true
    );

    for (const section of dbSections) {
      const sectionLectures = await db.execute(
        `SELECT id, title, description, tags,
        (updatedAt >= :lastSynced ) as isChanged
        FROM lectures WHERE sectionId = :sectionId AND createdAt <= :lastSynced`,
        { sectionId: section, lastSynced }
      );

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
