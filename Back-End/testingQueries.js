const db = require('./connect');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,
  mockSections,
  repliesList,
} = require('./mockData');

async function insertAdmin() {
  const passwordHash = await bcrypt.hash('admin', 10);

  const params = [
    'admin',
    // I'm testing here OK? Don't do that ever
    'admin',
    passwordHash,
    'Mr,',
    'Admin',
    'admin',
    'admin',
    '',
    'https://picsum.photos/100',
    'https://picsum.photos/100'
    ];
  await db.execute(
    `INSERT INTO users (
			id, email, passwordHash, firstName, lastName, username, role, pictureId,
			pictureUrl, pictureThumbnail)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );
}
// insertAdmin();

async function insertTestCourse() {
  await db.execute(
    `INSERT INTO courses (id, title, description) VALUES (?, ?, ?)`,
    [
      'test-course',
      'Test CS50',
      'This is a test data mocking CS50 with manipulation of course'
    ]);
}
// insertTestCourse();

async function insertTestCourseAdmin() {
  await db.execute(
    `INSERT INTO courseAdmins (courseId, userId) VALUES (?, ?)`,
    ['test-course', 'admin']
  );
}
// insertTestCourseAdmin();

async function insertTestUser() {
  const passwordHash = await bcrypt.hash('test', 10);
  const params = [
    'test-user',
    'test',
    passwordHash,
    'Test',
    'User',
    'testUser',
    'student',
    '',
    'https://picsum.photos/100',
    'https://picsum.photos/100'
  ];
  await db.execute(
    `INSERT INTO users (
      id, email, passwordHash, firstName, lastName, username, role, pictureId,
      pictureUrl, pictureThumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  await db.execute(
    `INSERT INTO courseEnrollments (userId, courseId) VALUES (?, ?)`,
    ['test-user', 'test-course']
  )
}
// insertTestUser();

async function insertTestSections() {
  const insertSectionQuery = 
    'INSERT INTO sections (id, title, description, courseId) VALUES (?, ?, ?, ?);';

  for (const section of mockSections) {
    await db.execute(
      insertSectionQuery,
      [
        section.id,
        section.title,
        section.description ?? '',
        'test-course'
      ]
    );
  }
}
// insertTestSections();

async function insertCourseLectures() {
  for (const section of mockSections) {
    const lectureId = `${section.id}-lecture-1`;
    const insertLectureQuery = 
      `INSERT INTO lectures
        (id, title, description, tags, videoLink, notes, slides, userId, courseId, sectionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    await db.execute(
      insertLectureQuery,
      [
        lectureId,
        'Test Lecture',
        'This is a test lecture',
        'test',
        'https://www.youtube.com/watch?v=5a3lKp7aCj8',
        'https://drive.google.com/file/d/1JmV9lJ3uKz3qEhYhR--qjQbT9s9A5H8/view?usp=sharing',
        'https://drive.google.com/file/d/1JmV9lJ3uKz3qEhYhR--qjQbT9s9A5H8/view?usp=sharing',
        'admin',
        'test-course',
        section.id
      ]
    );
  }
}
// insertCourseLectures();
