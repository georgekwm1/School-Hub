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
    db.execute(
        `SELECT userId FROM votes WHERE userId = ? AND ${idColumn} = ?`,
        [userId, resourceId]
      ).length !== 0
  );
}

function isCourseAdmin(userId, courseId) {
  const stmt = 
    'SELECT 1 FROM courseAdmins WHERE courseId = ? AND userId = ?';
  return db.execute(stmt, [courseId, userId]).length !== 0;
}

function isUserEnroledInCourse(userId, courseId) {
  const stmt =
    'SELECT 1 FROM courseEnrollments WHERE courseId = ? AND userId = ?';

  return db.execute(stmt,[courseId, userId]).length !== 0;
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
