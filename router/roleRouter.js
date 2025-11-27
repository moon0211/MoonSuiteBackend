const express = require('express');
const router = express.Router();
const roleController = require('../controller/roleController');

// 获取菜单列表接口（对应前端请求）
router.get('/roles', roleController.getRolesData); 
router.post('/role', roleController.addRole); 
router.put('/role/:id', roleController.updateRole); 
router.delete('/role/:id', roleController.deleteRole); 
router.patch('/role/:id/status', roleController.updateRoleStatus); 
module.exports = router;
    