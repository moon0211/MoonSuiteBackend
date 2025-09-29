const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// 获取菜单列表接口（对应前端请求）
router.get('/menu', menuController.getMenuList);

module.exports = router;
    