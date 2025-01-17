const db = require('./db');

// ************** Note: Don't do like me.. I'm violating SQL convetions here
//
// I'm using camelcase here.. just to match the names in the already existing
// mock REST API for ease of access.. to not refactor much because of time
// This is just an emergency
// This should be snake case
//
// **************************

// Users table
(async () => {
	await db.execute(`
		CREATE TABLE IF NOT EXISTS users (
			id varchar(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			email VARCHAR(255) UNIQUE NOT NULL,
			passwordHash VARCHAR(512),
			googleId VARCHAR(255) UNIQUE,
			firstName VARCHAR(255) NOT NULL,
			lastName VARCHAR(255) NOT NULL,
			-- I added and this mocking the data in teh mock vars.. but
			-- I havn't relied on it on or havn't needed it.
			username VARCHAR(255),
			pictureId VARCHAR(255),
			pictureUrl VARCHAR(255),
			pictureThumbnail VARCHAR(255),
			role VARCHAR(255) CHECK (role IN ('student', 'admin', 'tutor')) DEFAULT 'student',
			CHECK (googleId IS NOT NULL OR passwordHash IS NOT NULL)
		);
		`);

	// Courses table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS courses (
			id varchar(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title VARCHAR(255) NOT NULL,
			description VARCHAR(512)
		);
	`);

	// Course admins table
	await db.execute(
		`
		CREATE TABLE IF NOT EXISTS courseAdmins (
			courseId VARCHAR(36) NOT NULL,
			userId VARCHAR(36) NOT NULL,
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
			FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
			PRIMARY KEY (courseId, userId)
		)
		`
	);

	// Course Enrollments table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS courseEnrollments (
			courseId VARCHAR(36) NOT NULL,
			userId VARCHAR(36) NOT NULL,
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
			FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
			PRIMARY KEY (courseId, userId)
		)
		`);

	// Sections table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS sections (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title TINYTEXT NOT NULL,
			description VARCHAR(512),
			courseId VARCHAR(36) NOT NULL,
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
		);	
		`);

	// Lectures table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS lectures (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title VARCHAR(255) NOT NULL,
			description VARCHAR(512) NOT NULL,
			tags VARCHAR(255),
			videoLink VARCHAR(255) NOT NULL,
			notes VARCHAR(255) NOT NULL,
			audioLink VARCHAR(255),
			slides VARCHAR(255),
			subtitles VARCHAR(255),
			transcript VARCHAR(255),
			userId VARCHAR(36) NOT NULL,
			courseId VARCHAR(36) NOT NULL,
			sectionId VARCHAR(36) NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
			FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE CASCADE
		);
		`);

	// lecture resources
	await db.execute(`
		CREATE TABLE IF NOT EXISTS lectureResources (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title VARCHAR(255) NOT NULL,
			url VARCHAR(255) NOT NULL,
			type VARCHAR(64) CHECK (type IN ('short', 'demo', 'quiz')),
			lectureId VARCHAR(36) NOT NULL,
			FOREIGN KEY (lectureId) REFERENCES lectures(id) ON DELETE CASCADE
		)
	`);

	// Questions table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS questions(
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title VARCHAR(255) NOT NULL,
			body VARCHAR(1024) NOT NULL,
			upvotes MEDIUMINT DEFAULT 0,
			repliesCount MEDIUMINT DEFAULT 0,
			userId VARCHAR(36) NOT NULL,
			lectureId VARCHAR(36),
			courseId VARCHAR(36),
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (lectureId) REFERENCES lectures(id) ON DELETE CASCADE,
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
			UNIQUE(courseId, lectureId, id)
		);
		`);

	// Replies Table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS replies (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			upvotes MEDIUMINT DEFAULT 0,
			body VARCHAR(1024) NOT NULL,
			userId VARCHAR(36) NOT NULL,
			questionId VARCHAR(36) NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
		)
		`);

	// votes table
	// I'm not sure about my design for this table...
	await db.execute(`
		CREATE TABLE IF NOT EXISTS votes (
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			userId VARCHAR(36) NOT NULL,
			questionId VARCHAR(36),
			replyId VARCHAR(36),
			FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
			FOREIGN KEY (replyId) REFERENCES replies(id) ON DELETE CASCADE,
			UNIQUE (userId, questionId, replyId),
			CHECK (questionId IS NOT NULL AND replyId IS NULL OR
			questionId IS NULL AND replyId IS NOT NULL)
		);
		`);

		// Announcements table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS announcements (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			title VARCHAR(255) NOT NULL,
			body VARCHAR(1024) NOT NULL,
			commentsCount MEDIUMINT DEFAULT 0,
			userId VARCHAR(36) NOT NULL,
			courseId VARCHAR(36) NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id),
			FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
		)
		`);

	// Commments table
	await db.execute(`
		CREATE TABLE IF NOT EXISTS comments (
			id VARCHAR(36) PRIMARY KEY,
			createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			body VARCHAR(512) NOT NULL,
			announcementId VARCHAR(36) NOT NULL ,
			userId VARCHAR(36) NOT NULL,
			FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (announcementId) REFERENCES announcements(id) ON DELETE CASCADE
		);
		`);

	// I'm amazed rightnow.. I hope to refactor some endpoitns now
	// These triggers are amazing.. that will save alot of redunenet code
	// Thank god sqlite doesn't have on update current_timestamp
	// otherwise i wouln't have searched for these triggers stuff
	await db.query(`
		CREATE TRIGGER IF NOT EXISTS increase_question_replies_count
		AFTER INSERT ON replies
		FOR EACH ROW
		BEGIN
			UPDATE questions
			SET repliesCount = repliesCount + 1
			WHERE id = NEW.questionId;
		END
	`);

	await db.query(`
		CREATE TRIGGER IF NOT EXISTS decrease_quesiton_replies_count
		AFTER DELETE ON replies
		FOR EACH ROW
		BEGIN
			UPDATE questions
			SET repliesCount = repliesCount - 1
			WHERE id = OLD.questionId;
		END	
	`);

	await db.query(`
		CREATE TRIGGER IF NOT EXISTS increase_announcement_comments_count
		AFTER INSERT ON comments
		FOR EACH ROW
		BEGIN
			UPDATE announcements
			SET commentsCount = commentsCount + 1
			WHERE id = NEW.announcementId;
		END
	`);

	await db.query(`
		CREATE TRIGGER IF NOT EXISTS decrease_announcement_comments_count
		AFTER DELETE ON comments
		FOR EACH ROW
		BEGIN
			UPDATE announcements
			SET commentsCount = commentsCount - 1
			WHERE id = OLD.announcementId;
		END	
	`);

	// No network.. Make a conditional to save some perforamnce
	await db.query(`
		CREATE TRIGGER IF NOT EXISTS delete_empty_sections
		AFTER UPDATE ON lectures
		FOR EACH ROW
		BEGIN
			DELETE FROM sections
			WHERE id = OLD.sectionId
			AND NOT EXISTS (
				SELECT 1
				FROM lectures
				WHERE sectionId = OLD.sectionId
			);
		END
	`);
})()

process.on('exit', async () => await db.pool.end());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;
