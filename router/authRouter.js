const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// 获取菜单列表接口（对应前端请求）
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refreshToken', authController.refreshToken);
module.exports = router;
    