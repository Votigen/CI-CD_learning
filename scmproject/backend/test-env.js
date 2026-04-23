// test-env.js
require('dotenv').config();

console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI);
console.log('🔍 DB_HOST:', process.env.DB_HOST);
console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);