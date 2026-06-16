export const userData = [
    {
        "id": 1,
        "username": "moon0211",
        "email": "",
        "passwordHash": "$2b$10$mh6ea39ZQ3UyLJBK8ZNB0uuLYGTIfgg8HO9us5UxvdrDbQcRzrTGu",
        "passwordSalt": "",
        "role": "",
        "roles": [1],
        "status": 1,
        "lastLoginAt": "",
        "createdAt": "",
        "updatedAt": "",
    }
]
//获取用户列表
//创建用户
//更新用户
//删除用户
//更新用户状态
//分配用户角色
//用户列表会有什么查询条件？用户名，用户邮箱，用户角色，账号状态是否存活，
export const getUsersData = (req, res) => {
    try {
        let { username, email, roles, status } = req.query;
        //filter的规则：true保留，false剔除，不改变原数组
        const result = userData.filter(item => {
            if (username && !item.username.includes(username)) return false
            if (email && !item.email.includes(email)) return false
            return true
        })
    } catch (error) {

    }

}
// GET /users - 获取用户列表

// POST /user - 创建用户

// PUT /user/{id} - 更新用户

// DELETE /user/{id} - 删除用户

// PATCH /user/{id}/status - 更新用户状态

// PATCH /user/{id}/roles - 分配用户角色