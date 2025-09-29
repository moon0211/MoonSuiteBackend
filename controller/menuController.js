// 模拟菜单数据（实际项目可能从数据库获取）
const mockMenuList = [
    {
        type: "menuItem",
        value: "1",
        title: "数据看板",
        icon: "chart-line-data-1",
        path: "/",
    },
    {
        // 基础属性：对应 t-submenu 的核心配置
        type: "submenu", // 区分「子菜单容器」和「菜单项」，必选
        value: "2", // 对应 t-submenu 的 value，唯一标识，必选
        title: "系统管理", // 对应 t-submenu 的 title 内容，必选
        icon: "application", // 对应 t-icon 的 name，可选（无则不渲染图标）

        children: [
            {
                type: "menuItem",
                value: "2-1",
                title: "权限管理",
                icon: "shield-error",
                path: "/mockMenuList",
            },
            {
                type: "menuItem",
                value: "2-2",
                title: "菜单管理",
                icon: "catalog",
                path: "/menu",
            },
        ],
    },
];

// 获取菜单列表
exports.getMenuList = (req, res) => {
    // 可以在这里添加缓存控制头，避免304
    res.setHeader('Cache-Control', 'no-store');

    // 返回菜单数据
    res.json({
        code: 200,
        data: mockMenuList,
        msg: 'success'
    });
};
//新增菜单列表
//
exports.addMenuList = (req, res) => {
    if (req.parentValue) {
        //查找根菜单并添加子菜单
    } else {
        // 添加根菜单
    }

};
//     app.post('/api/permissions', (req, res) => {
//   // 前端通过请求体（body）传递新增的数据（如 name、desc）
//   const newPermission = req.body;

//   // 生成唯一 ID（简单方式：取数组最后一条数据的 id+1，若数组为空则从 1 开始）
//   const newId = mockMenuList.length > 0
//     ? Math.max(...mockMenuList.map(item => item.id)) + 1
//     : 1;

//   // 拼接完整的新数据（补充 id 和创建时间）
//   const addPermission = {
//     id: newId,
//     name: newPermission.name,
//     desc: newPermission.desc,
//     createTime: new Date().toLocaleDateString() // 当前日期（格式：2024/9/29）
//   };

//   // 加入内存数组
//   mockMenuList.push(addPermission);

//   // 返回新增的结果
//   res.status(201).json({
//     success: true,
//     data: addPermission,
//     message: '新增权限成功'
//   });
// });

// // -------------------------- 4. 改（Update）：编辑权限 --------------------------
// app.put('/api/permissions/:id', (req, res) => {
//   // 获取 URL 中的 ID 和请求体中的修改数据
//   const id = Number(req.params.id);
//   const updateData = req.body;

//   // 找到要修改的数据在数组中的索引
//   const index = mockMenuList.findIndex(item => item.id === id);

//   if (index !== -1) {
//     // 合并原数据和修改数据（原数据的 id、createTime 不允许修改）
//     mockMenuList[index] = {
//       ...mockMenuList[index], // 保留原数据的 id、createTime
//       name: updateData.name,    // 覆盖新的 name
//       desc: updateData.desc     // 覆盖新的 desc
//     };

//     res.status(200).json({
//       success: true,
//       data: mockMenuList[index],
//       message: '修改权限成功'
//     });
//   } else {
//     res.status(404).json({ success: false, message: '未找到该权限，无法修改' });
//   }
// });

// // -------------------------- 5. 删（Delete）：删除权限 --------------------------
// app.delete('/api/permissions/:id', (req, res) => {
//   const id = Number(req.params.id);
//   // 过滤掉要删除的 ID，生成新数组（相当于删除）
//   const newmockMenuList = mockMenuList.filter(item => item.id !== id);

//   if (newmockMenuList.length !== mockMenuList.length) {
//     mockMenuList = newmockMenuList; // 更新内存数组
//     res.status(200).json({ success: true, message: '删除权限成功' });
//   } else {
//     res.status(404).json({ success: false, message: '未找到该权限，无法删除' });
//   }
// });
