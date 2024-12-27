const db = require('./connect');

function getUserData(userId) {
  const [user] = db.execute(
      `SELECT id, firstName, lastName, pictureThumbnail
      FROM users
      WHERE id = ?`,
      [userId]
    );


  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    pictureThumbnail: user.pictureThumbnail,
  };
}

function getUpvoteStatus(userId, resourceId, resourceType) {
  const idColumn = resourceType === 'question' ? 'questionId' : 'replyId';

  return (
    db.execture(
        `SELECT userId FROM votes WHERE userId = ? AND ${idColumn} = ?`,
        [userId, resourceId]
      ) !== undefined
  );
}

function isCourseAdmin(userId, courseId) {
  const stmt = db.prepare(
    'SELECT 1 FROM courseAdmins WHERE courseId = ? AND userId = ?'
  );
  return stmt.get(courseId, userId) !== undefined;
}

function isUserEnroledInCourse(userId, courseId) {
  const stmt = db.prepare(
    'SELECT 1 FROM courseEnrollments WHERE courseId = ? AND userId = ?'
  );
  return stmt.get(courseId, userId) !== undefined;
}

function getCurrentTimeInDBFormat() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

module.exports = {
  getUserData,
  getUpvoteStatus,
  isCourseAdmin,
  isUserEnroledInCourse,
  getCurrentTimeInDBFormat,
};
