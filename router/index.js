const express = require('express');
const router = express.Router();
const menuRouter = require('./menuRouter');

// 挂载子路由
router.use(menuRouter); // 菜单相关接口（完整路径：/api/menu）

module.exports = router;
    