// 先补充配套的权限清单（permissionIds 对应的值，建议和权限表一一对应）
// 权限示例（可根据你的系统功能扩展）：
const permissionsData = [
  { id: 1, name: "view_menu", desc: "查看所有可见菜单" }, // 基础权限
  { id: 2, name: "manage_user", desc: "用户管理（增删改查）" },
  { id: 3, name: "manage_role", desc: "角色管理（增删改查+权限分配）" },
  { id: 4, name: "manage_menu", desc: "菜单管理（增删改查）" },
  { id: 5, name: "view_user", desc: "仅查看用户列表" }, // 只读权限
  { id: 6, name: "view_role", desc: "仅查看角色列表" },
  { id: 7, name: "manage_system_setting", desc: "系统配置（如基础参数、全局开关）" },
  { id: 8, name: "operate_data", desc: "数据操作（如导入/导出、批量处理）" },
  { id: 9, name: "audit_content", desc: "内容审核（如审核提交的表单、数据）" },
  { id: 10, name: "view_operation_log", desc: "查看操作日志（审计用）" }
];
// 获取权限列表
exports.getPermissionsData = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ code: 200, data: permissionsData });;
};

