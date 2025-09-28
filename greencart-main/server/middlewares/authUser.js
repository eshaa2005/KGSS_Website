import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { userToken } = req.cookies;
    if (!userToken) {
        return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    try {
        const tokenDecode = jwt.verify(userToken, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            next();
        } else {
            return res.status(401).json({ success: false, message: "Not Authorized" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

export default authUser;
