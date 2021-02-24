var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var api = require('./routes/api');
var autenticacao = require('./routes/autenticacao');

var app = express();
app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.json());

require("dotenv-safe").config();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', api);
app.use('/users', usersRouter);
app.use('/autenticacao', autenticacao);

module.exports = app;
