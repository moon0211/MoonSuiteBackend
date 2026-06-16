const { userData } = require('./userController'); // 导入用户数据
const dayjs = require('dayjs'); // 导入用户数据
// 细化后的角色配置（角色-权限联动更清晰）
const rolesData = [
    {
        id: 'role_mifpittm_39y01klft',
        encode: "SUPER_ADMIN", // 英文标识（后端逻辑用）
        name: "超级管理员", // 中文名称（前端展示用）
        description: "系统超级管理员，拥有所有操作权限（不可删除/修改）",
        permissions: [], // 关联所有权限
        status: "active", // 角色状态（active/inactive，控制是否可用）
        correlation: false,
        builtIn: true,
        users: [1],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    },
    {
        id: "role_mifpj5pw_j00h3hrfj",
        encode: "ADMIN", // 英文标识（后端逻辑用）
        name: "普通管理员", // 中文名称（前端展示用）
        description: "负责日常业务管理，无角色/权限修改权限",
        permissions: [], // 可管理用户、数据操作、审核，不可改角色/菜单
        status: "active",
        correlation: false,
        builtIn: false,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""

    },
    {
        id: "role_mifpjegj_c3wdirnfe",
        encode: "OPERATOR", // 英文标识（后端逻辑用）
        name: "运营人员", // 中文名称（前端展示用）
        description: "负责数据录入、批量处理、内容审核，无用户/角色管理权限",
        permissions: [], // 仅查看用户、数据操作、审核
        status: "active",
        correlation: false,
        builtIn: false,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    },
    {
        id: "role_mifpjlfm_o8kz6d6qo",
        encode: "AUDITOR", // 英文标识（后端逻辑用）
        name: "审计人员", // 中文名称（前端展示用）
        description: "负责查看系统数据、操作日志，无修改/删除权限（合规审计用）",
        permissions: [], // 仅查看用户、角色、操作日志
        status: "active",
        correlation: false,
        builtIn: false,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    },
    {
        id: 'role_mifpjs2q_t6ie04ibb',
        encode: "USER", // 英文标识（后端逻辑用）
        name: "普通用户", // 中文名称（前端展示用）
        description: "系统普通用户，仅能查看自己的相关数据和基础菜单",
        permissions: [], // 仅查看基础可见菜单（前端根据权限过滤个人无关菜单）
        status: "active",
        correlation: false,
        builtIn: false,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    },
    {
        id: 'role_mifpjwux_t0n1prpwj',
        encode: "GUEST", // 英文标识（后端逻辑用）
        name: "访客", // 中文名称（前端展示用）
        description: "临时访问用户，仅能查看公开菜单（如帮助中心、公告）",
        permissions: [], // 无核心权限，前端仅渲染公开菜单
        status: "active",
        correlation: false,
        builtIn: true,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    },
    {
        id: 'role_mifpk3d0_36jknekz0',
        encode: "DEVELOPER", // 英文标识（后端逻辑用）
        name: "开发人员", // 中文名称（前端展示用）
        description: "系统开发/维护人员，拥有配置类权限（非生产环境用）",
        permissions: [], // 可改角色、菜单、系统配置，方便调试
        status: "active", // 默认禁用，需手动激活
        correlation: false,
        builtIn: false,
        users: [],
        createdAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs('2025-11-26').format('YYYY-MM-DD HH:mm:ss'),
        updatedBy: ""
    }
];

// 获取角色列表
exports.getRolesData = (req, res) => {
    //接收查询信息：角色名称，角色状态，创建时间，权限范围
    try {
        const createdAt = req.query['createdAt[]'] || req.query.createdAt;
        let { encode, name, permissions, status } = req.query;
        //给每个角色新增字段 correlation，标记有没有用户在用这个角色
        let rolesWithCorrelation = rolesData.map(role => {
            const hasCorrelation = userData.some(user => user.roles === role.id);
            return {
                ...role,
                correlation: hasCorrelation
            };
        });
        if (Array.isArray(createdAt) && createdAt.length === 2) {
            rolesWithCorrelation = rolesWithCorrelation.filter(role =>
                role.createdAt >= createdAt[0] && role.createdAt <= createdAt[1]
            );
        }
        if (encode) {
            rolesWithCorrelation = rolesWithCorrelation.filter(role => role.encode === encode);
        }
        if (name) {
            rolesWithCorrelation = rolesWithCorrelation.filter(role =>
                role.name.includes(name)
            );
        }
        if (permissions) {
            const targetPermissions = permissions.map(Number).filter(id => !isNaN(id));
            // const targetPermissions = permissions.split(',').map(Number).filter(id => !isNaN(id));
            rolesWithCorrelation = rolesWithCorrelation.filter(role =>
                targetPermissions.every(p => role.permissions.includes(p))
            );
        }
        if (status !== undefined && status !== null && status !== '') {
            rolesWithCorrelation = rolesWithCorrelation.filter(role => role.status === status);
        }
        return res.status(200).json({ code: 200, data: rolesWithCorrelation });
    } catch (error) {
        console.error('角色查询失败：', error.stack);
        return res.status(500).json({ code: 500, message: '查询错误', data: [] });

    }

};

exports.addRole = (req, res) => {
    try {
        let { encode, name, description, permissions, status, users } = req.body;
        if (!name) {
            return res.status(200).json({ code: 400, message: '角色名称为必填项' });
        }
        if (!encode) {
            return res.status(200).json({ code: 400, message: '角色编码为必填项' });
        }
        if (!description) {
            return res.status(200).json({ code: 400, message: '角色描述为必填项' });
        }
        if (!permissions || permissions.length === 0) {
            return res.status(200).json({ code: 400, message: '权限不能为空' });
        }
        if (status === undefined) {
            return res.status(200).json({ code: 400, message: '状态不能为空' });
        }

        const nameExists = rolesData.some(role => role.name === name);
        const encodeExists = rolesData.some(role => role.encode === encode);
        if (encodeExists) {
            return res.status(200).json({ code: 400, message: '角色编码已存在' });
        }
        if (nameExists) {
            return res.status(200).json({ code: 400, message: '角色名称已存在' });
        }
        if (!Array.isArray(users)) {
            return res.status(200).json({ code: 400, message: '用户列表必须为数组格式' });
        }
        let role = {
            id: getRoleId(),
            encode: encode,
            name: name,
            description: description,
            permissions: permissions,
            status: status,
            builtIn: false,
            users: users,
            correlation: users?.length > 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        rolesData.push(role);
        return res.status(201).json({ code: 200, message: '添加成功' });
    } catch (error) {
        return res.status(500).json({ code: 500, message: '添加失败', data: [] });
    }
}

exports.updateRole = (req, res) => {
    try {
        const { id } = req.params;
        let { encode, name, description, permissions, status, users } = req.body;

        if (!name) {
            return res.status(200).json({ code: 400, message: '角色名称为必填项' });
        }
        if (!encode) {
            return res.status(200).json({ code: 400, message: '角色编码为必填项' });
        }
        if (!description) {
            return res.status(200).json({ code: 400, message: '角色描述为必填项' });
        }
        if (!permissions || permissions.length === 0) {
            return res.status(200).json({ code: 400, message: '权限不能为空' });
        }
        if (status === undefined) {
            return res.status(200).json({ code: 400, message: '状态不能为空' });
        }

        let role = rolesData.find(role => role.id === id);
        if (!role) {
            return res.status(200).json({ code: 404, message: '角色未找到' });
        }
        if (role.builtIn) {
            return res.status(200).json({ code: 403, message: '内置角色不可修改' });
        }

        const nameExists = rolesData.some(role => role.name === name);
        const encodeExists = rolesData.some(role => role.encode === encode);
        if (encodeExists && encode !== role.encode) {//如果角色编码已经存在，且不是当前角色的编码，就返回错误
            return res.status(200).json({ code: 400, message: '角色编码已存在' });
        }
        if (nameExists && name !== role.name) {
            return res.status(200).json({ code: 400, message: '角色名称已存在' });
        }


        role.name = name;
        role.encode = encode;
        role.description = description;
        role.permissions = permissions;
        role.status = status;
        role.users = users;
        role.correlation = users?.length > 0;
        role.updatedAt = new Date();
        return res.status(200).json({ code: 200, message: '更新成功' });
    } catch (error) {
        return res.status(500).json({ code: 500, message: '更新失败', data: [] });

    }
}

exports.deleteRole = (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(200).json({ code: 400, message: '请传入删除id' });
        }
        // 查找并更新角色状态
        const roleIndex = rolesData.findIndex(role => role.id === id);
        if (roleIndex === -1) {
            return res.status(200).json({ code: 404, message: '角色不存在' });
        }
        let role = rolesData[roleIndex]
        const hasAssociatedUsers = userData.some(user => user.roles.includes(id));
        if (hasAssociatedUsers) {
            return res.status(200).json({ code: 400, message: '角色关联用户，无法删除' });
        }
        if (role.builtIn) {
            return res.status(200).json({ code: 403, message: '内置角色，无法删除' });
        }
        rolesData.splice(roleIndex, 1);
        return res.status(200).json({ code: 200, message: '删除成功' });
    } catch (error) {
        return res.status(500).json({ code: 500, message: '删除失败', data: [] });
    }
}

exports.updateRoleStatus = (req, res) => {
    try {
        const { id } = req.params;
        let { status } = req.body;
        if (!id || status === undefined) {
            return res.status(200).json({ code: 400, message: '请传入角色id和启用状态' });
        }

        // 查找并更新角色状态
        const roleIndex = rolesData.findIndex(role => role.id === id);
        if (roleIndex === -1) {
            return res.status(200).json({ code: 404, message: '角色不存在' });
        }
        let role = rolesData[roleIndex]
        if (role.name === 'SUPER_ADMIN' && status === 'inactive') {
            return res.status(200).json({ code: 403, message: '超级管理员不可禁用' });
        }
        if (role.builtIn && role.name !== 'SUPER_ADMIN') {
            return res.status(200).json({ code: 403, message: '内置角色不可修改状态' });
        }
        role.status = status;
        role.updatedAt = new Date().toISOString();

        return res.status(200).json({
            code: 200,
            success: true,
            message: status == 'active' ? '角色启用成功' : '角色禁用成功',
            data: role
        });
    } catch (error) {
        return res.status(500).json({ code: 500, success: false, message: '服务器内部错误，修改状态失败', data: [] });
    }
}
exports.assignPermissions = (req, res) => {
    try {
        const { id } = req.params;
        const { permissions, updatedBy } = req.body;
        if (!id) {
            return res.status(200).json({ code: 400, message: '请传入角色id' });
        }
        const roleIndex = rolesData.findIndex(role => role.id === id);
        if (roleIndex === -1) {
            return res.status(200).json({ code: 404, message: '角色不存在' });
        }
        const role = rolesData[roleIndex]
        if (role.builtIn) {
            return res.status(200).json({ code: 403, message: '内置角色不可修改' });
        }
        rolesData[roleIndex] = {
            ...role,
            permissions: permissions,
            updatedAt: new Date().toISOString(),
            updatedBy: updatedBy
        };
        console.log('rolesData: ', rolesData);
        return res.status(200).json({
            code: 200,
            success: true,
            message: '分配角色权限成功',
            data: rolesData[roleIndex]
        });
    } catch (error) {

        return res.status(500).json({ code: 500, success: false, message: '服务器内部错误，权限分配失败', data: [] });

    }
}
function getRoleId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `role_${timestamp}_${randomStr}`;
}