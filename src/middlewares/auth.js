const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    const token = req.header('X-Auth_Token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        req.user = await User.findOne({ _id: decoded._id });
        next();
    } catch (e) {
        res.status(400).send('Invalid token.');
    }
};