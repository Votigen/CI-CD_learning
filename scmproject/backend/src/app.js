//app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('./routes/index'); // 启用路由
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API 路由
app.use('/api', routes);

module.exports = app;
