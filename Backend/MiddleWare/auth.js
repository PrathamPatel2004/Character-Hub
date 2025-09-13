import jwt from 'jsonwebtoken';

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (req.cookies?.accesstoken) return req.cookies.accesstoken;
    if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
    return null;
};

const auth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({
                message : 'Unauthorized. Token missing.',
                error : true,
                success : false,
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message:
                error.name === 'TokenExpiredError'
                    ? 'Unauthorized. Token has expired.'
                    : 'Unauthorized. Invalid token.',
                error : true,
                success : false,
        });
    }
};

export default auth;