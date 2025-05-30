var User = require('../models/user')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
const invalidatedTokens = new Set();

const jwtt = require('jsonwebtoken');
const generateToken = (user) => {
    return jwtt.sign({
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        numero: user.numero
    }, config.secret, { expiresIn: '7d' });
};

// Fonction pour formater la réponse utilisateur (sans le mot de passe)
const formatUserResponse = (user) => {
    return {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        numero: user.numero,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

var functions = {
    register: async (req, res) => {
        const { nom, prenom, numero, password } = req.body;
        if (!nom || !prenom || !numero || !password) {
            return res.status(400).json({ success: false, msg: 'Tous les champs sont requis' });
        }

        try {
            const existing = await User.findOne({ nom, prenom, numero });
            if (existing) return res.status(400).json({ success: false, msg: 'Utilisateur déjà inscrit' });

            const user = new User({ nom, prenom, numero, password });
            await user.save();

            const token = generateToken(user);
            //return res.json({ success: true, token });
            return res.json({
                success: true,
                token,
                user: formatUserResponse(user) // Ajout des infos utilisateur
            });
        } catch (err) {
            console.error('Erreur d’enregistrement :', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur' });
        }
    },

    login: async (req, res) => {
        const { nom, prenom, numero, password } = req.body;
        if (!nom || !prenom || !numero || !password) {
            return res.status(400).json({ success: false, msg: 'Tous les champs sont requis' });
        }

        try {
            const user = await User.findOne({ nom, prenom, numero });
            if (!user) return res.status(404).json({ success: false, msg: 'Utilisateur non trouvé' });

            const match = await user.comparePassword(password);
            if (!match) return res.status(401).json({ success: false, msg: 'Mot de passe incorrect' });

            const token = generateToken(user);
            //return res.json({ success: true, token });
            return res.json({
                success: true,
                token,
                user: formatUserResponse(user) // Ajout des infos utilisateur
            });
        } catch (err) {
            console.error('Erreur de connexion :', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur' });
        }
    },

    resetPassword: async (req, res) => {
        const { nom, prenom, numero, newPassword } = req.body;
        if (!nom || !prenom || !numero || !newPassword) {
            return res.status(400).json({ success: false, msg: 'Tous les champs sont requis' });
        }

        try {
            const user = await User.findOne({ nom, prenom, numero });
            if (!user) return res.status(404).json({ success: false, msg: 'Utilisateur non trouvé' });

            user.password = newPassword;
            await user.save();

            return res.json({ success: true, msg: 'Mot de passe réinitialisé avec succès' });
        } catch (err) {
            console.error('Erreur de réinitialisation du mot de passe :', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur' });
        }
    },

    getUserProfile: async (req, res) => {
        try {
            const user = req.user; // Injecté par le middleware

            return res.json({
                success: true,
                user: {
                    id: user._id,
                    nom: user.nom,
                    prenom: user.prenom,
                    numero: user.numero,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (err) {
            console.error('Erreur lors de la récupération du profil :', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur' });
        }
    },

    logout: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ success: false, msg: 'Token manquant' });

            const token = authHeader.split(' ')[1];
            invalidatedTokens.add(token);

            return res.json({ success: true, msg: 'Déconnexion réussie' });
        } catch (err) {
            console.error('Erreur logout:', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur' });
        }
    }



}

module.exports = functions
