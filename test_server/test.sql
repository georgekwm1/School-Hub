SELECT * FROM lectures;
SELECT * FROM courses;
SELECT * from users;

SELECT id, title, body, updatedAt, upvotes, repliesCount FROM questions WHERE courseId = 'test-course' ORDER BY updatedAt DESC;
SELECT id, firstName, lastName, pictureThumbnail FROM users where Id = 'userId';
SELECT * from votes where userId = 'userId' and questionId = 'questionId';
