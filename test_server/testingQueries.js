const db = require('better-sqlite3')('./db.sqlite');
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
  const insertAdmin = db.prepare(
    `INSERT INTO users (
			id, email, passwordHash, firstName, lastName, username, role, pictureId,
			pictureUrl, pictureThumbnail)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const id = uuidv4();
  const passwordHash = await bcrypt.hash('admin', 10);

  insertAdmin.run(
    id,
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
  );
}
// insertAdmin();

async function insertTestCourse() {
  const insertCourse = db.prepare(
    `INSERT INTO courses (id, title, description) VALUES (?, ?, ?)`
  );

  insertCourse.run(
    'test-course',
    'Test CS50',
    'This is a test data mocking CS50 with manipulation of course'
  );
}
// insertTestCourse();

async function insertTestSections() {
  const insertSection = db.prepare(
    'INSERT INTO sections (id, title, description, courseId) VALUES (?, ?, ?, ?);'
  );

  for (const section of mockSections) {
    insertSection.run(
      section.id,
      section.title,
      section.description,
      'test-course'
    );
  }
}
// insertTestSections();

