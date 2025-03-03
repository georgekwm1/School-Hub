SELECT * FROM users WHERE updatedAt < '2024-12-03 12:01:16';
SELECT * FROM lectures;
SELECT * FROM courses;
SELECT * FROM sections;
SELECT * from users;
select * from questions; 
select * from votes; 
select * from replies;
-- SELECT * FROM announcements;
-- SELECT * FROM comments;

-- UPDATE questions
-- SET updatedAt = CURRENT_TIMESTAMP,
    -- createdAt = CURRENT_TIMESTAMP;

-- SELECT
--   replies.id,
--   questions.courseId,
-- 	-- This is a good one.. I happy i chose to do it without ORM for the testServer.
--   (SELECT courseId FROM lectures WHERE id = questions.lectureId) as courseIdFromLecture
-- FROM replies
--   JOIN questions ON replies.questionId = questions.id;


-- SELECT * FROM courseEnrollments; 

-- -- Oh, boy... this is crazy... 
-- SELECT 
-- 	q.courseId AS courseIdFromQuestion,
-- 	(SELECT courseId FROM lectures WHERE id = q.lectureId) AS courseIdFromLecture
-- FROM replies r
-- 	JOIN questions q ON r.questionId = q.id

-- SELECT id, title, body, updatedAt, upvotes, repliesCount FROM questions WHERE lectureId = 'test-course' ORDER BY updatedAt DESC;
-- SELECT id, firstName, lastName, pictureThumbnail FROM users where Id = 'userId';
-- SELECT * from votes where userId = 'userId' and questionId = 'questionId';

-- UPDATE questions SET repliesCount = 0;

-- DROP TRIGGER IF EXISTS questions_update;

-- DROP TRIGGER IF EXISTS reply_update_time;
-- DROP TRIGGER IF EXISTS increase_question_replies_count;
-- DROP TRIGGER IF EXISTS decrease_quesiton_replies_count;
-- SELECT name FROM sqlite_master WHERE type = 'trigger';



-- SELECT a.courseID FROM announcements a JOIN comments c
-- 	ON c.announcementId = a.id
-- 	WHERE c.id = '62b4a82e-0e09-4748-866e-393749c735e5';

-- SELECT c.userId = 'admin' AS result
-- FROM comments c
-- WHERE c.id = '62b4a82e-0e09-4748-866e-393749c735e5';


-- DROP TABLE IF EXISTS users;
-- UPDATE users SET id = 'admin' WHERE email = 'admin';

-- SELECT 1 FROM courseAdmins WHERE courseId = 'test-course' AND userId = 'admin';
-- -- Oh, boy... this is crazy... 
--     SELECT 
--       q.courseId AS courseIdFromQuestion,
--       (SELECT courseId FROM lectures WHERE id = q.lectureId) AS courseIdFromLecture
--     FROM replies r
--       JOIN questions q ON r.questionId = q.id
--     WHERE r.id = '94e8fc75-2e0d-4001-adcb-fde9d90d90d8';
