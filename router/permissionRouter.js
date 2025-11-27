const express = require('express');
const router = express.Router();
const permissionController = require('../controller/permissionController');

// 获取菜单列表接口（对应前端请求）
router.post('/getPermissionsData', permissionController.getPermissionsData);

module.exports = router;
