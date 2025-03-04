const db = require('./connect');

async function getUserData(userId) {
  const [user] = await db.execute(
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

async function getUpvoteStatus(userId, resourceId, resourceType) {
  const idColumn = resourceType === 'question' ? 'questionId' : 'replyId';

  const result = await db.execute(
    `SELECT userId FROM votes WHERE userId = ? AND ${idColumn} = ?`,
    [userId, resourceId],
    pluck=true
  );
  return result.length !== 0;
}

async function isCourseAdmin(userId, courseId) {
  const stmt = 
    'SELECT 1 FROM courseAdmins WHERE courseId = ? AND userId = ?';
  return await db.execute(stmt, [courseId, userId]).length !== 0;
}

async function isUserEnroledInCourse(userId, courseId) {
  const stmt =
    'SELECT 1 FROM courseEnrollments WHERE courseId = ? AND userId = ?';

  return await db.execute(stmt,[courseId, userId]).length !== 0;
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
