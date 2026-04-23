// config/server.js
const app = require('../app');
const path = require('path');
const { pool } = require('./database');
const dotenv = require('dotenv');
dotenv.config({
    path: path.resolve(__dirname, '../../.env') // ✅ 正确路径：从 config/ 上两级到根目录
});

// 测试环境变量
// console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET);
// console.log('🔍 DB_HOST:', process.env.DB_HOST);
// console.log('🔍 PORT:', process.env.PORT);
// console.log('📦 Environment:', process.env.NODE_ENV || 'development');


// 测试数据库连接
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release(); // 释放连接回连接池
    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1); // 连接失败时退出进程
    }
}

testDatabaseConnection();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});