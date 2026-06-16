const { menuData } = require('./menuController'); // 导入用户数据

let permissionsData = [];

// 递归过滤嵌套菜单的函数
const filterNestedMenu = (menuItems, queryData) => {
  const { isShow, parentId, status, title, type, value, fullScreen } = queryData;

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
      (isShow === undefined || isShow === "" || menu.isShow === isShow) &&
      (fullScreen === undefined || fullScreen === "" || menu.fullScreen === fullScreen)
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

// 获取权限列表
exports.getPermissionsData = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  // 先拿到菜单数据，确保新增了菜单也会同步数据，得到一个id数组作为比对
  let queryData = {
    type: 'menuItem'
  };
  let nestedData = menuData;
  let data = filterNestedMenu(nestedData, queryData);

  permissionsData = data.map(item => {
    const originalItem = permissionsData.find(perm => perm.id === item.id);
    const originalChildren = originalItem ? originalItem.children : [];

    return {
      name: item.title,
      encode: item.id,
      id: item.id,
      parentId: null,
      interfaceUrl: null,
      children: originalChildren
    };
  });

  return res.json({ code: 200, data: permissionsData });
};

function checkDuplicateInParent(parentNode, encode, name, options = {}) {
  const idKey = options.idKey ?? 'id';
  const childrenKey = options.childrenKey ?? 'children';
  if (!Array.isArray(parentNode[childrenKey])) return false;

  for (const child of parentNode[childrenKey]) {
    if (child.encode === encode) {
      return { isDuplicate: true, type: 'encode', message: '权限编码已存在' };
    }
    if (child.name === name) {
      return { isDuplicate: true, type: 'name', message: '权限名称已存在' };
    }
  }
  return { isDuplicate: false };
}

// 新增权限接口
exports.addPermission = (req, res) => {
  try {
    const { encode, name, parentId, interfaceUrl } = req.query;
    if (!encode || !name || encode.trim() === '' || name.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '权限编码和名称不能为空且不能为空白字符'
      });
    }
    if (parentId === undefined || parentId === null) {
      return res.status(400).json({ code: 400, message: '根节点ID不能为空' });
    }

    const parentNode = findDataById(permissionsData, parentId);
    if (!parentNode) {
      return res.status(400).json({ code: 400, message: '根节点不存在' });
    }
    // 检查权限名称or编码是否已存在
    const duplicateCheck = checkDuplicateInParent(parentNode, encode, name);
    if (duplicateCheck.isDuplicate) {
      return res.status(400).json({
        code: 400,
        message: duplicateCheck.message
      });
    }


    /**
     * 获取下一个权限ID
     * @param {string/number} parentId - 父级ID
     * @returns {string} 新的权限ID（格式：permission_xxx）
     */
    function getNextId(parentId) {
      try {
        if (!Array.isArray(permissionsData) || permissionsData.length === 0) {
          throw new Error('权限数据为空');
        }
        const targetParent = permissionsData.find(item => item.id === parentId);

        if (!targetParent) {
          throw new Error('父节点不存在');
        }


        const { children } = targetParent;
        if (!Array.isArray(children) || children.length === 0) {
          return "permission_1001";
        }

        const maxNum = children.reduce((max, child) => {
          const num = Number(child.id?.replace(/^permission_/, "")) || 0;
          return num > max ? num : max;
        }, 1000);
        return `permission_${maxNum + 1}`;


      } catch (error) {
        console.error('获取下一个权限ID失败：', error);
      }


    }

    const newId = getNextId(parentId)

    const newPermission = {
      id: newId,
      encode: encode.trim(),
      name: name.trim(),
      parentId: parentId,
      interfaceUrl: interfaceUrl || '',
    };

    if (!Array.isArray(parentNode.children)) {
      parentNode.children = [];
    }
    parentNode.children.push(newPermission);

    return res.status(201).json({
      code: 201,
      message: '权限新增成功',
      success: true,
      data: newPermission
    });

  } catch (error) {
    console.error('新增权限失败：', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误，新增权限失败'
    });
  }
};

exports.updatePermission = (req, res) => {

  const id = req.params.id;
  const { encode, name, interfaceUrl } = req.query;


  if (!encode || !name) {
    return res.status(200).json({ code: 400, success: false, message: '参数不能为空' });

  }
  let target = findDataById(permissionsData, id);
  target.name = name;
  target.encode = encode;
  target.interfaceUrl = interfaceUrl;

  return res.json({ code: 200, success: true, data: permissionsData });;
};

exports.delPermission = (req, res) => {
  const id = req.params.id;
  const parentId = req.params.parentId;
  if (!id) {
    return res.status(200).json({ code: 400, success: false, message: '参数不能为空' });
  }
  if (parentId === 'null' || parentId === '') {
    return res.status(200).json({ code: 400, success: false, message: '菜单项不允许删除' });
  }

  delDataById(permissionsData, id, {}, parentId);
  return res.json({ code: 200, data: permissionsData });;
};
/**
 * 递归删除树形数组中指定ID的节点（支持按父ID精准删除/全局删除）
 * @param {Array} arr - 树形结构数组（必传）
 * @param {string|number} targetId - 要删除的节点ID（必传）
 * @param {Object} [options={}] - 配置项（可选）
 * @param {string} [options.idKey='id'] - 自定义ID字段名（如'permissionId'）
 * @param {string} [options.childrenKey='children'] - 自定义子节点字段名（如'subList'）
 * @param {string|number} [parentId] - 根节点ID（可选，传则仅删该根节点下的目标子节点）
 * @returns {boolean} - 是否成功删除节点
 */
function delDataById(arr, targetId, options = {}, parentId) {
  const { idKey = 'id', childrenKey = 'children' } = options;
  let isDeleted = false;
  if (parentId) {
    for (const item of arr) {
      if (item[idKey] === parentId) {
        if (!Array.isArray(item[childrenKey])) continue;

        for (let i = item[childrenKey].length - 1; i >= 0; i--) {
          const child = item[childrenKey][i];
          if (child[idKey] === targetId) {
            item[childrenKey].splice(i, 1);
            isDeleted = true;
            break;
          }
        }
        break;
      }
    }
    if (isDeleted) return true;
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    const current = arr[i];
    if (typeof current !== 'object' || current === null) continue;

    if (current[idKey] === targetId) {
      arr.splice(i, 1);
      isDeleted = true;
      continue;
    }

    if (Array.isArray(current[childrenKey]) && current[childrenKey].length > 0) {
      const childDeleted = delDataById(
        current[childrenKey],
        targetId,
        options,
        null
      );
      if (childDeleted) isDeleted = true;
    }
  }

  return isDeleted;
}

/**
 * 递归查找树形数组中指定ID的节点（支持自定义ID/子节点字段）
 * @param {Array} arr - 树形结构数组（必传）
 * @param {string|number} targetId - 要查找的节点ID（必传）
 * @param {Object} [options={}] - 配置项（可选）
 * @param {string} [options.idKey='id'] - 自定义ID字段名（如'permissionId'）
 * @param {string} [options.childrenKey='children'] - 自定义子节点字段名（如'subList'）
 * @returns {Object|null} - 找到则返回目标节点对象，未找到返回null
 */
function findDataById(arr, targetId, options = {}) {
  const { idKey = 'id', childrenKey = 'children' } = options;

  for (const current of arr) {
    if (typeof current !== 'object' || current === null) continue;

    if (current[idKey] === targetId) {
      return current;
    }

    if (Array.isArray(current[childrenKey]) && current[childrenKey].length > 0) {
      const result = findDataById(current[childrenKey], targetId, options);
      if (result) {
        return result;
      }
    }
  }

  return null;
}
//新增权限的时候同步角色
function syncRolesOnPermAdd() {
}