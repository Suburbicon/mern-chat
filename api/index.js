require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');
const { UserModel, MessageModel } = require('./models')

const app = express();
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173'
}));
app.use(cookieParser());
app.use(express.json());
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database is connected 🌶🌶🌶️'))
  .catch(err => console.log(err));

const bcryptSalt = bcrypt.genSaltSync(10);

app.get('/test', (req, res) => {
  res.json('test ok');
});

const getUserDataFromRequest = (req) => {
  return new Promise((res, rej) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, {httpOnly: true}, (err, userData) => {
        if (err) rej(err);
        res(userData)
      });
    } else {
      rej('no token');
    }
  });
}

app.get('/profile', (req, res) => {
  getUserDataFromRequest(req)
    .then(userData => res.json(userData))
    .catch(err => res.status(401).json(err));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  UserModel.findOne({ username })
    .then(foundUser => {
      if (!foundUser) {
        throw new Error;
      }
      const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (isPasswordCorrect) {
        jwt.sign(
          { userId: foundUser._id, username: foundUser.username },
          process.env.JWT_SECRET,
          {},
          (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(201).json({
              _id: foundUser._id,
              username: foundUser.username
            });
          });
      }
    })
    .catch(err => {
      res.status(401).json({username});
    });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
  UserModel.create({
    username,
    password: hashedPassword
  })
    .then((createdUser) => {
      jwt.sign(
        { userId: createdUser._id, username: createdUser.username },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
        if (err) throw err;
        res.cookie('token', token).status(201).json({
          _id: createdUser._id,
          username: createdUser.username
        });
      });
    })
    .catch(err => {
      console.log('create user Error: ' + err);
      res.status(500).json(err);
    });
});

app.get('/messages/:userId', (req, res) => {
  const { userId: recipientUserId } = req.params;
  getUserDataFromRequest(req)
    .then(userData => {
      MessageModel.find({
        sender: {$in: [recipientUserId, userData.userId]},
        recipient: {$in: [recipientUserId, userData.userId]}
      })
        .sort({ createdAt: 1 })
        .then(messagesFromDB => res.json(messagesFromDB))
        .catch(err => res.status(500).json(err));
    })
    .catch(err => res.status(401).json(err));
});

const server= app.listen(4000 ,() => {
  console.log('Server is started 🧨🧨🧨');
});

const wss = new ws.WebSocketServer({
  server
});
wss.on('connection', (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(';')
      .map(el => el.trim())
      .find(str => str.startsWith('token='))
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on('message', (message) => {
    const parsedMessage = JSON.parse(message.toString());
    const { recipient, text } = parsedMessage;
    if (recipient && text) {
      MessageModel.create({
        sender: connection.userId,
        recipient,
        text
      })
        .then((messageDoc) => {
          [...wss.clients]
            .filter(c => c.userId === recipient || c.userId === connection.userId)
            .forEach(c => {
              c.send(JSON.stringify({
                text,
                sender: connection.userId,
                recipient,
                _id: messageDoc._id
              }))
            })
        })
        .catch(err => {});
    }
  });

  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients]
        .map(client => ({userId: client.userId, username: client.username}))
    }))
  });
});