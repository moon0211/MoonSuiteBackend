const express = require('express');
const cors = require('cors'); // 引入cors中间件
const router = require('./router');
const { PORT } = require('./config');

const app = express();

// 1. 配置CORS（必须放在路由之前！）
app.use(cors({
  origin: 'http://localhost:5173', // 允许前端的源（精确匹配）
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的请求方法
  allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
}));

// 2. 其他中间件（解析请求体等）
app.use(express.json());

// 3. 挂载路由
app.use('/api', router);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
