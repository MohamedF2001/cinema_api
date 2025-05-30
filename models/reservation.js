/* const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    seanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seance',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Si vous avez un système d'utilisateurs
    nombrePlaces: {
        type: Number,
        required: true,
        min: 1
    },
    prixTotal: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        default: "confirmée"
    }, // Ex: "annulée"
}, {
    timestamps: true
}); // Pour garder une trace de la date de création et de mise à jour

module.exports = mongoose.model('Reservation', reservationSchema); */

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    seanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seance',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nombrePlaces: {
        type: Number,
        default: 1,  // Toujours 1 place par réservation
        immutable: true // Empêche la modification
    },
    numeroSiege: {  // Numéro unique du siège
        type: String, // Ou Number selon votre système
        required: true,
        validate: {
            validator: async function (v) {
                // Vérifie que le siège n'est pas déjà pris pour cette séance
                const existing = await this.constructor.findOne({
                    seanceId: this.seanceId,
                    numeroSiege: v
                });
                return !existing;
            },
            message: 'Ce siège est déjà réservé pour cette séance'
        }
    },
    prixTotal: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        default: "confirmée"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);