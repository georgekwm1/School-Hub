const express = require('express');
const {
  mockComments,
  mockAnnouncements,
  mockReplies,
  question,
  mockDiscussion,

  mockSections,
  repliesList,
} = require('../mockData');
const db = require('../connect');

const router = express.Router();

// Get all lectures for a course
router.get('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  console.log(courseId);
  if (courseId === 'testId') {
    res.json({ sections: mockSections });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get a specific lecture
router.get('/courses/:courseId/lectures/:lectureId', (req, res) => {
  const courseId = req.params.courseId;
  const lectureId = req.params.lectureId;
  console.log(courseId, lectureId);
  const allowedLectures = mockSections.flatMap((section) =>
    section.lectures.map((lecture) => lecture.id)
  );
  if (courseId === 'testId' && allowedLectures.includes(lectureId)) {
    res.json({
      lectureData: {
        id: lectureId,
        title: 'Week 4',
        section: 'Low Level Programming',
        videoLink: 'https://youtu.be/F9-yqoS7b8w',
        notes: 'https://cs50.harvard.edu/x/2024/notes/4/',
        audioLink:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/wav/lecture4.wav',
        slides:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/slides/lecture4.pdf',
        subtitles:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/subtitles/lecture4.srt',
        transcript:
          'https://cs50.harvard.edu/college/2022/spring/lectures/4/transcript',
        description:
          'Pointers. Segmentation Faults. Dynamic Memory Allocation. Stack. Heap. Buffer Overflow. File I/O. Images.',
        tags: [
          'pointers',
          'segmentation faults',
          'dynamic memory allocation',
          'stack',
          'heap',
          'buffer overflow',
          'file i/o',
          'images',
        ],
        demos: [
          {
            title: 'Demo: HTML/CSS',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1019',
          },
          {
            title: 'Demo: JavaScript',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1749',
          },
        ],
        shorts: [
          {
            title: 'Short: HTML/CSS',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1273',
          },
          {
            title: 'Short: JavaScript',
            url: 'https://youtu.be/nM0x2vV6uG8?t=1993',
          },
        ],
        quizzez: [
          {
            title: 'Problem Set 4',
            url: 'https://cs50.harvard.edu/college/2022/spring/psets/4/',
          },
        ],
      },
    });
  } else if (courseId === 'testId') {
    res.status(404).send({ message: 'Lecture not found' });
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Get all section titles for creating a lecture
router.get('/sections_titles', (req, res) => {
  const stmt = db.prepare('SELECT title FROM sections');
  const sectionTitles = stmt.all().map(row => row.title);
  res.json(sectionTitles);
});

// create a course lecture
router.post('/courses/:id/lectures', (req, res) => {
  const courseId = req.params.id;
  const {
    demos,
    description,
    extras,
    name,
    notesLink,
    section,
    slidesLink,
    tags,
    youtubeLink,
  } = req.body;
  if (courseId === 'testId') {
    const newLecture = {
      id: `lecture-${Date.now()}`,
      title: name,
      videoLink: youtubeLink,
      notes: notesLink,
      audioLink: '', // Add actual audio link if available
      slides: slidesLink,
      subtitles: '', // Add actual subtitles link if available
      transcript: '', // Add actual transcript link if available
      description,
      demos,
      shorts: extras, // Add actual shorts if available
      quizzez: [], // Add actual quizzes if available
      tags,
    };

    const existingSection = mockSections.find((sec) => sec.title === section);
    if (existingSection) {
      existingSection.lectures.push(newLecture);
    } else {
      const newId = `section-${Date.now()}`;
      mockSections.push({ id: newId, title: section, lectures: [newLecture] });
    }
    res.json(newLecture);
  } else {
    res.status(404).send({ message: 'Course not found' });
  }
});

// Edit a lecture
router.put('/lectures/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    youtubeLink,
    notesLink,
    slidesLink,
    section,
    extras,
    tags,
    demos,
  } = req.body;

  const index = mockSections
    .flatMap((section) => section.lectures)
    .findIndex((lecture) => lecture.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Lecture not found' });
  }

  const lecture = mockSections.flatMap((section) => section.lectures)[index];
  lecture.title = name;
  lecture.description = description;
  lecture.videoLink = youtubeLink;
  lecture.notes = notesLink;
  lecture.slides = slidesLink;
  lecture.section = section;
  lecture.shorts = extras;
  lecture.demos = demos;
  lecture.tags = tags;

  res.status(200).json(lecture);
});

// delete a lecture
router.delete('/lectures/:id', (req, res) => {
  const lectureId = req.params.id;
  const index = mockSections.findIndex(
    (section) =>
      section.lectures.findIndex((lecture) => lecture.id === lectureId) !== -1
  );

  if (index === -1) {
    return res.status(404).send({ message: 'Lecture not found' });
  }
  const lectureIndex = mockSections[index].lectures.findIndex(
    (lecture) => lecture.id === lectureId
  );
  mockSections[index].lectures.splice(lectureIndex, 1);
  res.status(200).json({ message: 'Lecture deleted successfully' });
});

module.exports = router;
