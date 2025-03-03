CREATE TABLE course_instructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, -- Optional, for internal tracking
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Links to the users table
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, -- Links to the courses table
  role TEXT CHECK (role IN ('admin', 'professor')) NOT NULL, -- Defines the user's role in the course
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id) -- Prevent duplicate assignments
);



CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  resource_type TEXT CHECK (resource_type IN ('question', 'reply')),
  resource_id TEXT NOT NULL, -- Can reference questions(id) or replies(id)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, resource_type, resource_id) -- Prevent duplicate votes
);



CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  comments_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE replies (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  lecture_id TEXT REFERENCES lectures(id) ON DELETE CASCADE, -- Nullable for general questions
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE lecture_resources (
  id TEXT PRIMARY KEY,
  lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('short', 'demo', 'quiz')),
  title TEXT NOT NULL,
  url TEXT NOT NULL
);



CREATE TABLE lectures (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_link TEXT,
  notes_link TEXT,
  audio_link TEXT,
  slides_link TEXT,
  subtitles_link TEXT,
  transcript_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Can be numeric, UUID, or Google ID
  email TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE,
  picture_url TEXT,
  picture_thumbnail TEXT,
  google_id TEXT UNIQUE -- Optional, if using Google Login
);
