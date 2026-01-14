const express = require('express');
const router = express.Router();
const permissionController = require('../controller/permissionController');

// 获取菜单列表接口（对应前端请求）
router.post('/getPermissionsData', permissionController.getPermissionsData);
router.post('/addPermission', permissionController.addPermission);
router.put('/updatePermission/:parentId/:id', permissionController.updatePermission);
router.delete('/delPermission/:parentId/:id', permissionController.delPermission);
module.exports = router;
