SELECT * FROM lectures;
SELECT * FROM courses;
SELECT * from users;
select * from questions; 

SELECT id, title, body, updatedAt, upvotes, repliesCount FROM questions WHERE lectureId = 'test-course' ORDER BY updatedAt DESC;
SELECT id, firstName, lastName, pictureThumbnail FROM users where Id = 'userId';
SELECT * from votes where userId = 'userId' and questionId = 'questionId';
-- -- UPDATE questions SET upvotes = upvotes + 1 WHERE id = '833bd103-a5f7-4f9b-a2c8-6f4a0b296d38';

-- DROP TRIGGER IF EXISTS questions_update;
-- DROP TRIGGER IF EXISTS reply_update_time;
