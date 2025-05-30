// middlewares/adminAuth.js
const jwt = require('jsonwebtoken');
const config = require('../config/dbconfig');
const Admin = require('../models/admin');

const adminAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, msg: 'Token requis' });

    try {
        const decoded = jwt.verify(token, config.secret);
        const admin = await Admin.findById(decoded.id);

        if (!admin) return res.status(403).json({ success: false, msg: 'Accès interdit' });

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, msg: 'Token invalide', error: err.message });
    }
};

module.exports = adminAuthMiddleware;
