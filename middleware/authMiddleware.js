const jwt = require('jsonwebtoken');
const { userData } = require('../controller/userController'); // 导入用户数据

class TokenValidator {
    constructor() {
        this.secret = 'moondailyhappy'; // 建议移到环境变量（如 process.env.JWT_SECRET）
    }

    /**
     * 验证访问令牌（accessToken）
     * @param {string} token - 待验证的 accessToken
     * @returns {object} 校验结果
     */
    validateAccessToken(token) {
        try {
            // 1. jwt.verify 自动校验：签名有效性 + exp 过期时间
            const decoded = jwt.verify(token, this.secret);

            // 2. 校验 Payload 必需字段（id/username）
            if (!decoded.id || !decoded.username) {
                throw new Error('Token payload missing required fields');
            }

            // 3. 用 id 查用户（比 username 更精准，id 是唯一标识）
            const user = userData.find(u => u.id === decoded.id);
            if (!user) {
                throw new Error('User not found');
            }

            // 4. 校验用户状态（可选，确保用户未被禁用）
            // if (user.status !== 'active') {
            //     throw new Error('User is inactive');
            // }

            return {
                isValid: true,
                payload: decoded,
                user: { id: user.id, username: user.username, role: user.role }, // 返回必要用户信息
                error: null
            };
        } catch (error) {
            // 区分错误类型，方便前端处理
            return {
                isValid: false,
                payload: null,
                user: null,
                error: {
                    message: error.message,
                    type: error.name // 关键：返回错误类型（如 TokenExpiredError）
                }
            };
        }
    }

    /**
     * 验证刷新令牌（refreshToken）
     * @param {string} token - 待验证的 refreshToken
     * @returns {object} 校验结果
     */
    validateRefreshToken(token) {
        try {
            // 1. jwt.verify 自动校验：签名有效性 + exp 过期时间
            const decoded = jwt.verify(token, this.secret);

            // 2. 刷新 Token 的 Payload 只有 id（生成时只传了 id），所以只校验 id
            if (!decoded.id) {
                throw new Error('Refresh token payload missing user id');
            }

            // 3. 用 id 查用户（和 accessToken 保持一致）
            const user = userData.find(u => u.id === decoded.id);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                isValid: true,
                payload: decoded,
                userId: user.id, // 只返回用户 id（刷新 Token 不需要更多信息）
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                payload: null,
                userId: null,
                error: {
                    message: error.message,
                    type: error.name // 关键：返回错误类型
                }
            };
        }
    }
}

// 假设的检查函数 - 实际项目中需实现（如 Redis 存储黑名单）
async function checkTokenRevocation(token) {
    return false; // 暂时返回 false（未撤销）
}

// Express中间件 - 验证 accessToken（用于需要权限的接口）
const authMiddleware = async (req, res, next) => {
    // 排除不需要校验的路径（精确匹配或前缀匹配，根据需求调整）
    const excludedPaths = ['/login', '/register', '/refreshToken', '/getMenu'];
    if (excludedPaths.some(path => req.path === path)) { // 建议用精确匹配，避免误排除子路径
        return next();
    }

    try {
        // 1. 提取 Token（前端需传 Authorization: Bearer <token>）
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                code: 401,
                message: '请先登录（未提供访问令牌）',
                error: 'NO_TOKEN'
            });
        }

        const token = authHeader.slice(7); // 截取 Bearer 后面的 Token（比 substring 更安全）

        // 2. 基础 JWT 验证 + 用户校验
        const validator = new TokenValidator();
        const validationResult = validator.validateAccessToken(token);

        if (!validationResult.isValid) {
            // 区分错误类型，返回对应提示
            const errorType = validationResult.error.type;
            if (errorType === 'TokenExpiredError') {
                return res.status(401).json({
                    code: 401,
                    message: '访问令牌已过期，请刷新令牌',
                    error: 'TOKEN_EXPIRED'
                });
            }

            return res.status(401).json({
                code: 401,
                message: '访问令牌无效',
                error: 'INVALID_TOKEN',
                details: validationResult.error.message
            });
        }

        // 3. 检查 Token 是否被撤销（如用户登出后加入黑名单）
        const isRevoked = await checkTokenRevocation(token);
        if (isRevoked) {
            return res.status(401).json({
                code: 401,
                message: '访问令牌已被撤销（用户已登出）',
                error: 'TOKEN_REVOKED'
            });
        }

        // 4. 将用户信息附加到 req 对象，供后续接口使用
        req.user = validationResult.user; // 包含 id、username、role
        req.tokenPayload = validationResult.payload; // 包含 Token 的完整 Payload
        next(); // 校验通过，放行

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            code: 500,
            message: '认证失败（服务器错误）',
            error: 'SERVER_ERROR'
        });
    }
};

module.exports = { authMiddleware, TokenValidator };