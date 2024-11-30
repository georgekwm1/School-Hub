const db = require('better-sqlite3')('./db.sqlite');

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ************** Note: Don't do like me.. I'm violating SQL convetions here
//
// I'm using camelcase here.. just to match the names in the already existing
// mock REST API for ease of access.. to not refactor much because of time
// This is just an emergency
// This should be snake case
//
// **************************

// Users table
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		email TEXT UNIQUE NOT NULL,
		passwordHash TEXT NOT NULL,
		googleId TEXT UNIQUE,
		firstName TEXT NOT NULL,
		lastName TEXT NOT NULL,
		username TEXT,
		pictureId TEXT,
		pictureUrl TEXT,
		pictureThumbnail TEXT,
		role TEXT CHECK (role IN ('student', 'admin', 'tutor')) DEFAULT 'student'
	);
	`);

// Courses table
db.exec(`
	CREATE TABLE IF NOT EXISTS courses (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		description TEXT
	);
`);

// Course admins table
db.exec(
  `
	CREATE TABLE IF NOT EXISTS courseAdmins (
		courseId TEXT NOT NULL,
		userId TEXT NOT NULL,
		FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		PRIMARY KEY (courseId, userId)
	)
	`
);

// Sections table
db.exec(`
	CREATE TABLE IF NOT EXISTS sections (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		description TEXT,
		courseId TEXT NOT NULL,
		FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
	);	
	`);

// Lectures table
db.exec(`
	CREATE TABLE IF NOT EXISTS lectures (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		tags TEXT,
		videoLink TEXT NOT NULL,
		notes TEXT NOT NULL,
		audioLink TEXT,
		slides TEXT,
		subtitles TEXT,
		transcript TEXT,
		userId TEXT NOT NULL,
		courseId TEXT NOT NULL,
		sectionId TEXT NOT NULL,
		FOREIGN KEY (userId) REFERENCES users(id),
		FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
		FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE
	);
	`);

// lecture resources
db.exec(`
	CREATE TABLE IF NOT EXISTS lectureResources (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		url TEXT NOT NULL,
		type TEXT CHECK (type IN ('short', 'demo', 'quiz')),
		lectureId TEXT NOT NULL,
		FOREIGN KEY (lectureId) REFERENCES lectures(id) ON DELETE CASCADE
	)
`);

// Questions table
db.exec(`
	CREATE TABLE IF NOT EXISTS questions(
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		body TEXT NOT NULL,
		upvotes INTEGER DEFAULT 0,
		repliesCount INTEGER DEFAULT 0,
		userId TEXT NOT NULL,
		lectureId TEXT,
		courseId TEXT,
		FOREIGN KEY (userId) REFERENCES users(id),
		FOREIGN KEY (lectureId) REFERENCES lectures(id) ON DELETE CASCADE,
		FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
		UNIQUE(courseId, lectureId, id)
	);
	`);

// Replies Table
db.exec(`
	CREATE TABLE IF NOT EXISTS replies (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		upvotes INTEGER DEFAULT 0,
		body TEXT NOT NULL,
		userId TEXT NOT NULL,
		questionId TEXT NOT NULL,
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
	)
	`);

// votes table
// I'm not sure about my design for this table... 
db.exec(`
	CREATE TABLE IF NOT EXISTS votes (
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    userId TEXT NOT NULL,
    questionId TEXT,
    replyId TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (replyId) REFERENCES replies(id) ON DELETE CASCADE,
		UNIQUE (userId, questionId, replyId),
    CHECK (questionId IS NOT NULL AND replyId IS NULL OR
		questionId IS NULL AND replyId IS NOT NULL)
	);
	`);

// Announcements table
db.exec(`
	CREATE TABLE IF NOT EXISTS announcements (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		body TEXT NOT NULL,
		commentsCount INTEGER DEFAULT 0,
		userId TEXT NOT NULL,
		courseId TEXT NOT NULL,
		FOREIGN KEY (userId) REFERENCES users(id),
		FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
	)
	`);

// Commments table
db.exec(`
	CREATE TABLE IF NOT EXISTS comments (
		id TEXT PRIMARY KEY,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		body TEXT NOT NULL,
		announcementId TEXT NOT NULL ,
		userId TEXT NOT NULL,
		FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (announcementId) REFERENCES announcements(id) ON DELETE CASCADE
	);
	`);



// I'm amazed rightnow.. I hope to refactor some endpoitns now
// These triggers are amazing.. that will save alot of redunenet code
// Thank god sqlite doesn't have on update current_timestamp
// otherwise i wouln't have searched for these triggers stuff
db.exec(`
	CREATE TRIGGER IF NOT EXISTS questions_update
	AFTER UPDATE ON questions
	WHEN old.title != new.title OR old.body != new.body
	BEGIN
		UPDATE questions
		SET updatedAt = CURRENT_TIMESTAMP
		WHERE id = old.id;
	END
`)

db.exec(`
	CREATE TRIGGER IF NOT EXISTS reply_update_time
	AFTER UPDATE ON replies
	WHEN old.body != new.body
	BEGIN
		UPDATE replies
		SET updatedAt = CURRENT_TIMESTAMP
		WHERE id = old.id;
	END
`)

db.exec(`
	CREATE TRIGGER IF NOT EXISTS increase_question_replies_count
	AFTER INSERT ON replies
	BEGIN
		UPDATE questions
		SET repliesCount = repliesCount + 1
		WHERE id = new.questionId;
	END
`)

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;
