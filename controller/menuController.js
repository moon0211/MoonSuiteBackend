const menuData = [
    {
        "id": "menu_1001",
        "type": "menuItem",
        "title": "数据看板",
        "value": "/",
        "icon": "chart-line-data-1",
        "parentId": null,
        "sort": 1,
        "isShow": true,
        "component": "views/MainDashboard/index.vue",
        "isExternal": false,
        "fullScreen": false
    },
    {
        "id": "menu_1002",
        "type": "submenu",
        "title": "系统管理",
        "value": "系统管理",
        "icon": "application",
        "parentId": null,
        "sort": 2,
        "isShow": true,
        "fullScreen": false
    },
    {
        "id": "menu_1003",
        "type": "submenu",
        "title": "权限管理",
        "value": "权限管理",
        "icon": "shield-error",
        "parentId": "menu_1002",
        "sort": 1,
        "isShow": true,
        "fullScreen": false
    },
    {
        "id": "menu_1004",
        "type": "menuItem",
        "title": "权限管理列表",
        "value": "/permissionList",
        "icon": "shield-error",
        "parentId": "menu_1003",
        "sort": 1,
        "isShow": true,
        "component": "views/permission/permissionlist/index.vue",
        "isExternal": false,
        "fullScreen": false
    }
    ,
    {
        "id": "menu_1005",
        "type": "menuItem",
        "title": "菜单管理",
        "value": "/menu",
        "icon": "shield-error",
        "parentId": null,
        "sort": 3,
        "isShow": true,
        "component": "views/menu/index.vue",
        "isExternal": false,
        "fullScreen": false
    }
    ,
    {
        "id": "menu_1006",
        "type": "menuItem",
        "title": "登录",
        "value": "/login",
        "icon": "shield-error",
        "parentId": null,
        "sort": 3,
        "isShow": false,
        "component": "views/auth/index.vue",
        "isExternal": false,
        "fullScreen": true
    }
]

const pagination = require('../utils/pagination');
const { paginate } = pagination.default;
// 构建嵌套菜单结构的函数(tree)
const buildNested = (parentId = null, filterShow) => {
    return menuData
        // 如果filterShow为false：!filterShow就是true，
        // 整个条件直接成立（不管menu.isShow是什么值），即不过滤任何菜单项。
        // 如果filterShow为true：!filterShow就是false，
        // 此时需要看menu.isShow的值，只有menu.isShow为true时条件才成立，即只保留显示的菜单项。
        .filter(menu => menu.parentId === parentId && (!filterShow || menu.isShow))
        .sort((a, b) => a.sort - b.sort)
        .map(menu => ({
            ...menu,
            // 只有子菜单类型才递归构建子菜单
            ...(menu.type === 'submenu' && { children: buildNested(menu.id, filterShow) })
        }));
};

// 递归过滤嵌套菜单的函数
const filterNestedMenu = (menuItems, queryData) => {
    const { isShow, parentId, status, title, type, value } = queryData;

    // 先处理所有子菜单，再判断当前菜单
    return menuItems.reduce((result, menu) => {
        // 递归处理子菜单
        let filteredChildren = [];
        if (menu.children && menu.children.length > 0) {
            filteredChildren = filterNestedMenu(menu.children, queryData);
        }

        // 检查当前菜单是否匹配过滤条件
        const matchesCurrentMenu = (
            (!parentId || menu.parentId === parentId) &&
            (!status || menu.status === status) &&
            (!title || menu.title.includes(title)) &&
            (!type || menu.type === type) &&
            (!value || menu.value.toLowerCase().includes(value.toLowerCase())) &&
            (isShow === undefined || isShow === "" || menu.isShow === isShow)
        );

        // 对于有子菜单的菜单，如果子菜单有匹配项，即使自身不匹配也要保留
        if (filteredChildren.length > 0) {
            // 保留当前菜单并更新其子菜单
            result.push({
                ...menu,
                children: filteredChildren
            });
        }
        // 如果当前菜单本身匹配，也保留它
        else if (matchesCurrentMenu) {
            // 如果没有匹配的子菜单，就不要保留空的children属性
            const menuToAdd = filteredChildren.length === 0
                ? { ...menu }
                : { ...menu, children: filteredChildren };

            // 移除空的children属性
            if (menuToAdd.children && menuToAdd.children.length === 0) {
                delete menuToAdd.children;
            }

            result.push(menuToAdd);
        }

        return result;
    }, []);
};



// 获取菜单列表
exports.getMenuList = (req, res) => {
    // 可以在这里添加缓存控制头，避免304
    res.setHeader('Cache-Control', 'no-store');

    const { format, current, pageSize, queryData } = req.body; // format=table（表格）或 format=menu（左侧菜单）


    if (format === 'table') {
        // 表格用扁平化数据，补充父菜单名称
        const result = menuData.map(menu => {
            const parent = menuData.find(m => m.id === menu.parentId);
            return { ...menu, parentTitle: parent ? parent.title : '无' };
        });


        if (!pageSize && !current) {
            return res.json({ code: 200, data: result });
        }
        return res.json({ code: 200, data: paginate(result, current, pageSize) });;
    } else {
        // 构建完整嵌套结构
        //「不进行分页」的场景下，才需要过滤掉 isShow: false 的菜单项
        // 传分页的时候就是菜单管理列表需要展示所有内容
        const filterShow = !pageSize && !current;
        let nestedData = buildNested(null, filterShow);
        // 如果有查询条件，在嵌套结构上应用过滤
        if (queryData !== undefined) {
            nestedData = filterNestedMenu(nestedData, queryData);
        }

        // 根据分页参数返回结果
        if (!pageSize && !current) {
            return res.json({ code: 200, data: nestedData });
        }
        return res.json({ code: 200, data: paginate(nestedData, current, pageSize) });

    }

};

//获取根菜单列表
exports.getParentMenuList = (req, res) => {
    const result = menuData.filter(menu => menu.type === 'submenu');
    return res.json({ code: 200, data: result });
}

function getNextId() {
    if (menuData?.length == 0) {
        return "menu_1001"
    }

    let number = menuData.map(item => {
        const numStr = item.id.split("menu_")[1]
        return Number(numStr)
    })

    const maxNum = Math.max(...number)
    const nextNum = maxNum + 1
    return `menu_${nextNum}`
}

function getNextSort(parentIdParam, sortParam, type) {
    const targetParentId = parentIdParam || null;
    const siblingMenus = menuData.filter(menu => menu.parentId === targetParentId);

    let defaultSort = 1;
    if (siblingMenus.length > 0) {
        const maxSort = Math.max(...siblingMenus.map(menu => menu.sort || 0));
        defaultSort = maxSort + 1;
    }

    const newSort = sortParam !== undefined && sortParam !== null ? sortParam : defaultSort;

    const menusToAdjust = siblingMenus.filter(menu => menu.sort >= newSort);
    if (type === 'update') { return newSort }
    menusToAdjust.forEach(menu => {
        menu.sort += 1;
    });
    return newSort
}
//新增菜单列表
exports.addMenuList = (req, res) => {
    try {
        const { formData } = req.body

        if (!formData || typeof formData !== 'object') {
            return res.status(400).json({ code: 400, message: '无效的数据格式' });
        }

        if (!formData.title) {
            return res.status(400).json({ code: 400, message: '菜单名称不能为空' });
        }

        const newSort = getNextSort(formData.parentId, formData.sort)
        const id = getNextId();
        formData.id = id;
        formData.sort = newSort;
        console.log('formData: ', formData);
        let parentId = formData.parentId ?? null
        formData.parentId = parentId;
        menuData.push(formData);

        return res.json({ code: 200, message: '新增菜单成功', success: true, data: menuData });
    } catch (error) {
        console.error('新增菜单错误:', error); // 打印错误方便调试
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
};


exports.updateMenu = (req, res) => {
    try {
        const id = req.params.id
        const formData = req.body.formData

        if (!formData || typeof formData !== 'object') {
            return res.status(400).json({ code: 400, message: '无效的数据格式' });
        }

        if (!formData.title) {
            return res.status(400).json({ code: 400, message: '菜单名称不能为空' });
        }

        const targetMenu = menuData.find(menu => menu.id === id);

        if (!targetMenu) {
            return res.status(404).json({ code: 404, message: '菜单未找到' });
        }
        const newSort = getNextSort(formData.parentId, formData.sort, 'update')

        targetMenu.title = formData.title;
        targetMenu.icon = formData.icon;
        targetMenu.fullScreen = formData.fullScreen;
        targetMenu.path = formData.path;
        targetMenu.component = formData.component;
        targetMenu.isShow = formData.isShow;

        targetMenu.sort = newSort;
        targetMenu.parentId = formData.parentId;
        targetMenu.type = formData.type;
        targetMenu.value = formData.value;


        return res.json({ code: 200, message: '编辑菜单成功', success: true, data: menuData });
    } catch (error) {
        console.error('编辑菜单错误:', error); // 打印错误方便调试
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
}

exports.delMenu = (req, res) => {
    try {
        const id = req.params.id;
        const targetMenu = menuData.find(menu => menu.id === id);

        if (!targetMenu) {
            return res.status(404).json({ code: 404, message: '菜单未找到' });
        }

        menuData.splice(menuData.indexOf(targetMenu), 1);

        return res.json({ code: 200, message: '删除菜单成功', success: true, data: menuData });
    } catch (error) {
        console.error('删除菜单错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
}
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
