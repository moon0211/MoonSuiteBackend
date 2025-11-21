const jwt = require('jsonwebtoken');
const { userData } = require('../controller/userController'); // 导入用户数据

class TokenValidator {
    constructor() {
        this.secret = 'moondailyhappy'
    }

    validateAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.secret);
            console.log('decoded: ', decoded);
            const user = userData.find(u => u.username === decoded.username);
            if (!user) {
                throw new Error('Invalid token type');
            }

            return {
                isValid: true,
                payload: decoded,
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                payload: null,
                error: error.message
            };
        }
    }

    validateRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.secret);

            const user = userData.find(u => u.username === decoded.username);
            if (!user) {
                throw new Error('Invalid token type');
            }
            return {
                isValid: true,
                payload: decoded,
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                payload: null,
                error: error.message
            };
        }
    }
}

// 假设的检查函数 - 你需要根据实际情况实现
async function checkTokenRevocation(token) {
    // 实现检查token是否在黑名单中的逻辑
    return false;
}

// 假设的User模型 - 你需要根据实际情况引入
const User = {
    findById: async (id) => {
        // 实现用户查找逻辑
        return null;
    }
};

// Express中间件 - 验证access token
const authMiddleware = async (req, res, next) => {
    // 排除登录相关路径
    const excludedPaths = ['/login', '/getMenu', '/register', '/refreshToken'];
    if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    try {
        // 1. 从请求头获取token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('无效token,请登录: ');
            return res.status(401).json({ code: 401, message: '无效token,请登录', error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // 2. 基础JWT验证
        const validator = new TokenValidator();
        const validationResult = validator.validateAccessToken(token);
        console.log('validationResult: ', validationResult);

        if (!validationResult.isValid) {
            return res.status(401).json({
                error: 'Invalid token',
                details: validationResult.error
            });
        }

        // 3. 检查token是否在黑名单中
        // const isRevoked = await checkTokenRevocation(token);
        // if (isRevoked) {
        //     return res.status(401).json({ error: 'Token revoked' });
        // }

        // 4. 检查用户状态
        // const user = await User.findById(validationResult.payload.userId);
        // console.log('user: ', user);
        // if (!user || !user.status) {
        //     return res.status(401).json({ error: 'User not found or inactive' });
        // }

        // 5. 将用户信息附加到请求对象
        // req.user = {
        //     id: user._id,
        //     username: user.username,
        //     roles: user.roles,
        //     permissions: user.permissions
        // };

        // 6. 验证通过，继续处理
        next();
    } catch (error) {   
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = { authMiddleware, TokenValidator };