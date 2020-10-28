const axios = require('axios');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const clientId = "?";
const clientSecret = "?";

app.get('/callback',(req, res) => {
  const AuthorizationCode = req.query.code 
	// Authorization Code 발급
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${AuthorizationCode}`,
    headers: {
      accept: 'application/json',
    },
  }).then( async (response) => {
		// Access Token 발급
    const accessToken = response.data.access_token 
    const { data } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
    },
    });
    console.log(data)
		// data 에는 유저의 GitHub info가 들어있음
    res.send("success");
  })
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  return;
});

module.exports = app;
