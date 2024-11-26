const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: 'public_tTc9vCi5O7L8WVAQquK6vQWNx08=',
  privateKey: 'private_edl1a45K3hzSaAhroLRPpspVRqM=',
  urlEndpoint: 'https://ik.imagekit.io/loayalsaid1/proLearningHub'
});

router.get('/imagekit', (req, res) => {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  res.json(authenticationParameters);
});


router.post('/login', (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (email === 'admin' && password === 'admin') {
    res.send({
      message: 'Logged in successfully',
      user: {
        email,
        password,
        id: 'testId',
        role: 'student',
      },
    });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

router.post('/oauth/google', (req, res) => {
  const idToken = req.body.token;
  console.log(idToken);
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
            role: 'student',
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

router.post('/oauth/googleRegister', (req, res) => {
  const idToken = req.body.token;
  console.log(idToken);
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
  fetch(googleVerifyUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.email_verified) {
        res.send({
          message: 'Logged in successfully',
          user: {
            email: data.email,
            id: data.sub,
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

router.post('/register', (req, res) => {
  const { userData } = req.body;
  console.log(userData);
  const { email, firstName, lastName, userName, pictureId, pictureURL, id = 'fakeId' } = userData;

    res.status(201).json({
      user: {email, firstName, lastName, userName, pictureId, pictureURL, id},
      message: 'Email is already used, Please try another one or login',
    });
});

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin' && password === 'admin') {
    res.send({
      message: 'Logged in successfully',
      user: {
        email,
        password,
        id: 'testId',
        role: 'admin',
      },
    });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

router.post('/admin/OAuth/google', (req, res) => {
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

module.exports = router;
