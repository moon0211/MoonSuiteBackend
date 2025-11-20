
//有了表之后，我要写查询，登录，登录接口一般是，输入账号密码，传给后端，后端返回token，把token存储在本地，还有刷新token,在拦截器里看token是否过期，但是用户表只存储用户信息
// 后端认证控制器示例 (Node.js + Express)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { userData } = require('./userController'); // 导入用户数据

// 密钥配置 - 实际项目中应放在环境变量中
const JWT_SECRET = 'moondailyhappy';
const ACCESS_TOKEN_EXPIRY = '15m'; // 访问令牌15分钟过期
const REFRESH_TOKEN_EXPIRY = '7d'; // 刷新令牌7天过期

// 登录接口
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = userData.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ code: 401, message: '用户名或密码错误' });
        }

        // 验证密码 (实际项目中应该使用bcrypt.compare)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ code: 401, message: '用户名或密码错误' });
        }

        // 生成访问令牌和刷新令牌
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 更新最后登录时间
        user.lastLoginAt = new Date().toISOString();

        // 返回令牌和用户基本信息
        return res.json({
            code: 200,
            message: '登录成功',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
};
// 注册接口
exports.register = async (req, res) => {
    try {
        const { username, password, role = 'user' } = req.body;

        // 基本数据验证
        if (!username || !password) {
            return res.status(400).json({ code: 400, message: '用户名、密码为必填项' });
        }

        // 检查用户名是否已存在
        const existingUser = userData.find(u => u.username === username);
        if (existingUser) {
            return res.status(409).json({ code: 409, message: '用户名已被注册' });
        }

        // // 检查邮箱是否已存在
        // const existingEmail = userData.find(u => u.email === email);
        // if (existingEmail) {
        //     return res.status(409).json({ message: '邮箱已被注册' });
        // }

        // 密码强度简单验证 (实际项目中可根据需求增强)
        if (password.length < 6) {
            return res.status(400).json({ code: 400, message: '密码长度不能少于6位', data: {} });
        }

        // 生成密码哈希 (实际项目中应使用更高的saltRounds)
        const passwordHash = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = {
            id: Date.now().toString(), // 简单生成唯一ID，实际项目可用UUID
            username,
            passwordHash,
            // email,
            role, // 默认为普通用户
            status: 'active', // 默认为活跃状态
            createdAt: new Date().toISOString(),
            lastLoginAt: null
        };

        // 保存用户到数据存储 (实际项目中是保存到数据库)
        userData.push(newUser);
        console.log('userData: ', userData);
        // 返回成功信息和用户数据 (不包含密码哈希)
        return res.status(201).json({
            code: 201,
            message: '注册成功',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status,
                    createdAt: newUser.createdAt
                }
            }

        });
    } catch (error) {
        console.error('注册错误:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
};

// 刷新令牌接口
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ code: 401, message: '刷新令牌不能为空' });
    }

    try {
        // 验证刷新令牌
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // 查找用户
        const user = userData.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ code: 401, message: '用户不存在' });
        }

        // 生成新的访问令牌
        const newAccessToken = generateAccessToken(user);

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('刷新令牌错误:', error);
        return res.status(401).json({ code: 401, message: '刷新令牌无效或已过期' });
    }
};

// 生成访问令牌
function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

// 生成刷新令牌
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
}
