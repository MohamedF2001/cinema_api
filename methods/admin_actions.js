const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const config = require('../config/dbconfig');

var functions = {
    loginAdmin: async (req, res) => {
        const { pseudo, password } = req.body;

        if (!pseudo || !password) {
            return res.status(400).json({ success: false, msg: 'Champs requis' });
        }

        try {
            const admin = await Admin.findOne({ pseudo });
            if (!admin) return res.status(404).json({ success: false, msg: 'Admin introuvable' });

            const match = await admin.comparePassword(password);
            if (!match) return res.status(401).json({ success: false, msg: 'Mot de passe incorrect' });

            const token = jwt.sign({ id: admin._id, role: 'admin' }, config.secret, { expiresIn: '7d' });

            return res.json({ success: true, token });
        } catch (err) {
            return res.status(500).json({ success: false, msg: 'Erreur serveur', error: err.message });
        }
    },

    registerAdmin: async (req, res) => {
        const { pseudo, password } = req.body;

        if (!pseudo || !password) {
            return res.status(400).json({ success: false, msg: 'Champs requis' });
        }

        try {
            const existing = await Admin.findOne({ pseudo });
            if (existing) return res.status(400).json({ success: false, msg: 'Admin déjà existant' });

            const admin = new Admin({ pseudo, password });
            await admin.save();

            const token = jwt.sign({ id: admin._id, role: 'admin' }, config.secret, { expiresIn: '7d' });

            return res.json({
                success: true,
                msg: 'Admin enregistré avec succès',
                token
            });
        } catch (err) {
            console.error('Erreur registerAdmin :', err);
            return res.status(500).json({ success: false, msg: 'Erreur serveur', error: err.message });
        }
    }
};



module.exports = functions