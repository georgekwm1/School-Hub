const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../connect');
const { verifyToken } = require('../middlewares/authMiddlewares');
const { isUserEnroledInCourse } = require('../helperFunctions');

const imagekit = new ImageKit({
  publicKey: 'public_tTc9vCi5O7L8WVAQquK6vQWNx08=',
  privateKey: 'private_edl1a45K3hzSaAhroLRPpspVRqM=',
  urlEndpoint: 'https://ik.imagekit.io/loayalsaid1/proLearningHub',
});

router.get('/imagekit', (req, res) => {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  res.json(authenticationParameters);
});

router.post('/login', async (req, res) => {
  // I believe the login system is abit wiered for now.
  // Sinse we are not making it so that.. you are making a backend
  // for one course with admins platform
  // But you are kinda making the backend almost ready for the bigger model/s
  // But you are fornow.. done with the core of the paltform
  // With can seamlisly server a course.. with it's admin and content.
  // and if someone else wanna use the platform, you make anotehr instance
  // of the front-end with some customizations if needed
  // and you manually create a course entry in the db and also for the admins
  // and then make the hardcode teh courseId in teh front-end
  // so it logs in as one of the course in the front-end.
  // but what is wiered for me now is.. the process of erros..
  // I not sure if there is something wronge or not..
  // Like, I'm cehcking for email.. then i'm checking for if this email in the course
  // I think this is just becuase i'm kinda serving multible systmes
  // but sinse thy all share the core.. the course platform.
  // without all the overhead above this layer..
  // may be this is hwat is making it abit wiered..
  // or may be it's totally find and it's just me.
  console.log(req.body);
  const { email, password, courseId } = req.body;

  const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    return res.status(401).send({ message: 'Email not found' });
  }

  if (!user.passwordHash && user.googleId) {
    return res
      .status(401)
      .json({
        message: 'Accountd registered with Google. Please use google login',
      });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    let message;
    if (user.googleId) {
      message = 'Wronge password. You can still use google login, tho.';
    } else {
      message = 'Wrong passoword';
    }
    return res.status(401).json({ message });
  }

  const [enrollment] = await db.execute(
      'SELECT * FROM courseEnrollments WHERE userId = ? AND courseId = ?',
      [user.id, courseId]
    );

  if (!enrollment) {
    return res
      .status(403)
      .send({ message: 'User is not enrolled in the course' });
  }

  const accessToken = jwt.sign(
    { userId: user.id, courseId, role: user.role },
    process.env.TOKEN_SECRET_KEY
  );

  res.send({
    message: 'Logged in successfully',
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      pictureThumbnail: user.pictureThumbnail,
      pictureUrl: user.pictureUrl,
    },
  });
});

router.post('/oauth/google', async (req, res) => {
  const { token: idToken, courseId } = req.body;
  console.log(idToken);
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  try {
    /**
     * Get teh token and verify it.. and get it's content..
     * then log the userIn.. check if he has a id with that naem
     * and return his things
     */
    const response = await fetch(googleVerifyUrl);
    const data = await response.json();
    if (!data.email_verified) {
      res.status(401).send({ message: 'Email not verified' });
    }

    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [data.email]);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    } else if (!user.googleId) {
      await db.execute(`UPDATE users SET googleId = ? WHERE email = ?`,
        [
          data.sub,
          data.email
        ]
      );
    }
    if (! await isUserEnroledInCourse(user.id, courseId)) {
      // Again.. on of the wierd things...
      // Because if you a user of the model of one course one prof.. using this..
      // for him.. the entire platform or app. is tihs course..
      // But anyway.. sinse the front-end will have the course Id hard coded
      // and in registration and logging in.. it's using the same thing..
      // This the enduser will no nothing
      // It's just we here playing smart to sever different models with one backend
      // Sinse they all share the smae core.. the course platform..
      // But genrally.. this is of course might need some consultancy from a beckend
      // or an architect.. and how we are making things here.
      return res
        .status(403)
        .json({ message: 'User is not enrolled in this course' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, courseId, role: user.role },
      process.env.TOKEN_SECRET_KEY
    );

    res.send({
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        pictureThumbnail: user.pictureThumbnail,
        pictureUrl: user.pictureUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error while loggin in' });
  }
});

router.post('/oauth/googleRegister', async (req, res) => {
  const { token: idToken, courseId } = req.body;
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  try {
    const response = await fetch(googleVerifyUrl);
    const userData = await response.json();

    if (!response.ok) {
      res
        .status(response.status)
        .send({ message: 'Error connecting to google' });
    } else if (userData.error) {
      res
        .status(401)
        .send({
          message: `${userData.error} => ${userData.error_description}`,
        });
    } else if (!userData.email_verified) {
      res.status(401).send({ message: 'Email not verified' });
    }
    console.log(userData);
    console.log(userData.email);

    const [existingUser] = await db
      .execute('SELECT 1 FROM users WHERE email = ?', [userData.email]);
    if (existingUser) {
      return res.status(409).send({ message: 'Email already exists' });
    }

    await db.transaction(async (connection) => {
      const userId = userData.sub;
      await connection.executeWithPluck(
        `INSERT INTO users (id, googleId, email, firstName, lastName, pictureUrl, pictureThumbnail)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          userId,
          userData.email,
          userData.given_name,
          userData.family_name,
          userData.picture,
          userData.picture
        ]
      );
      await connection.executeWithPluck(
        'INSERT INTO courseEnrollments (userId, courseId) VALUES (?, ?)',
        [userId, courseId]
      );

      const accessToken = jwt.sign(
        { userId, courseId, role: 'student' },
        process.env.TOKEN_SECRET_KEY
      );

      res.status(201).json({
        accessToken,
        user: {
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.given_name,
          username: userData.family_name,
          pictureThumbnail: userData.picture,
          pictureUrl: userData.picture,
        },
        message: 'User registered and logged in successfully',
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server Error while registering' });
  }
});

router.post('/register', async (req, res) => {
  const { userData, courseId } = req.body;
  const {
    email,
    password,
    firstName,
    lastName,
    username,
    pictureId,
    pictureURL,
    pictureThumbnail,
  } = userData;
  try {
    const [existingUser] = await db.execute(
      `SELECT * FROM users WHERE email = ?`, [email]
    );
    if (existingUser) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.transaction(async (connection) => {
      await connection.executeWithPluck(
        `INSERT INTO users (
          id, email, passwordHash, firstName, lastName, username, pictureId,
          pictureUrl, pictureThumbnail
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          id,
          email,
          passwordHash,
          firstName,
          lastName,
          username,
          pictureId ?? null,
          pictureURL ?? null,
          pictureThumbnail ?? null,
        ]
      );

      await connection.executeWithPluck(
        `INSERT INTO courseEnrollments (userId, courseId) VALUES (?, ?)`,
        [id, courseId]
      )
      // Student is the default of the role for now.. admins will be added amnaully when instantiating
      // and instance for the course.. and seeting things up and if there are customizations..
      const accessToken = jwt.sign(
        { userId: id, courseId, role: 'student' },
        process.env.TOKEN_SECRET_KEY
      );

      res.status(201).json({
        accessToken,
        user: {
          email,
          firstName,
          lastName,
          username,
          pictureThumbnail,
          pictureURL,
          id,
        },
        message: 'User created successfully',
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/admin/login', async (req, res) => {
  const { email, password, courseId } = req.body;
  const [user] = await db.execute(
    'SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']
  );
  if (!user) {
    res.status(401).send({ message: 'Invalid credentials' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    res.status(401).send({ message: 'Wrong password' });
    return;
  }

  const [enrollment] = await db.execute(
    'SELECT * FROM courseAdmins WHERE userId = ? AND courseId = ?',
    [user.id, courseId]
  );
  if (!enrollment) {
    return res.status(403).send({ message: 'User is not a course admin' });
  }

  const accessToken = jwt.sign(
    { userId: user.id, courseId, role: 'admin' },
    process.env.TOKEN_SECRET_KEY
  );

  res.send({
    message: 'Logged in successfully',
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      pictureThumbnail: user.pictureThumbnail,
      pictureUrl: user.pictureUrl,
    },
  });
});

router.post('/admin/OAuth/google', (req, res) => {
  // I have one simple question ❓❔❓❔❓❔❓❔❓❔❓
  // How on earth i just moved on without checking if the user
  // Exists in the database or not.. 
  // I really have no idea...
  // TODO: Fix this stupid bug..
  const idToken = req.body.token;
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  fetch(googleVerifyUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.email_verified) {
        res.send({
          message: 'Logged in successfully',
          user: {
            email: data.email,
            id: data.sub,
            role: 'admin',
          },
        });
      } else {
        res.status(401).send({ message: 'Email not verified' });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    });
});

router.post('/api/logout', verifyToken, (req, res) => {
  // Temoraily do nothing..
  res.status(200).send({ message: 'Logged out successfully' });
});

module.exports = router;
