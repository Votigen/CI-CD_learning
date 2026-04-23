//git 测试
// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // 加载环境变量

// 创建连接池 (生产环境推荐)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'scmproject',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE || 10,
    queueLimit: 0,
    charset: 'utf8mb4_general_ci', // 支持 emoji
    timezone: '+00:00', // UTC 时区
    decimalNumbers: true // 以数字形式返回 DECIMAL 类型
});


module.exports = {
    pool
};
