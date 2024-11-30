-- SELECT * FROM lectures;
-- SELECT * FROM courses;
-- SELECT * from users;
select * from questions; 
select * from votes; 
select * from replies;

-- SELECT id, title, body, updatedAt, upvotes, repliesCount FROM questions WHERE lectureId = 'test-course' ORDER BY updatedAt DESC;
-- SELECT id, firstName, lastName, pictureThumbnail FROM users where Id = 'userId';
-- SELECT * from votes where userId = 'userId' and questionId = 'questionId';

-- UPDATE questions SET repliesCount = 0;

-- DROP TRIGGER IF EXISTS questions_update;

-- DROP TRIGGER IF EXISTS reply_update_time;
-- DROP TRIGGER IF EXISTS increase_question_replies_count;
-- DROP TRIGGER IF EXISTS decrease_quesiton_replies_count;
-- SELECT name FROM sqlite_master WHERE type = 'trigger';
