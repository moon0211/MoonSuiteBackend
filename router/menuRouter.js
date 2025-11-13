const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// 获取菜单列表接口（对应前端请求）
router.post('/getMenu', menuController.getMenuList);
router.post('/menu', menuController.addMenuList);
router.put('/menu/:id', menuController.updateMenu);
router.get('/parentMenu', menuController.getParentMenuList);
router.delete('/menu/:id', menuController.delMenu);
module.exports = router;
    