const express = require('express');
const router = express.Router();
const menuRouter = require('./menuRouter');
const authRouter = require('./authRouter');

// 挂载子路由
router.use(menuRouter); // 菜单相关接口（完整路径：/api/menu）
router.use(authRouter); // 登录相关接口（完整路径：/api/login）

module.exports = router;
    