const express = require('express');
const router = express.Router();
const menuRouter = require('./menuRouter');
const authRouter = require('./authRouter');
const { authMiddleware } = require('../middleware/authMiddleware'); // 使用require

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 挂载子路由
router.use(menuRouter);
router.use(authRouter);

module.exports = router;