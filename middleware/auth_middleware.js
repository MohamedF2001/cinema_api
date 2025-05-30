const jwt = require('jsonwebtoken');
const config = require('../config/dbconfig');
const User = require('../models/user');

const invalidatedTokens = new Set(); // Stockage temporaire tokens blacklistés

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: 'Authentification requise - Token manquant'
        });
    }

    // Vérifie si le token est dans la blacklist
    if (invalidatedTokens.has(token)) {
        return res.status(401).json({
            success: false,
            msg: 'Token invalide (déconnecté)'
        });
    }

    try {
        const decoded = jwt.verify(token, config.secret);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Utilisateur non trouvé'
            });
        }

        req.user = user;

        next();

    } catch (err) {
        let errorMsg = 'Erreur d\'authentification';
        let statusCode = 401;

        if (err.name === 'TokenExpiredError') {
            errorMsg = 'Token expiré';
            statusCode = 403;
        } else if (err.name === 'JsonWebTokenError') {
            errorMsg = 'Token invalide';
        }

        return res.status(statusCode).json({
            success: false,
            msg: errorMsg,
            error: err.message
        });
    }
};

module.exports = authMiddleware;