const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    }, // Titre du film
    realisateur: {
        type: String,
        required: true,
        trim: true
    }, // Réalisateur du film
    duree: {
        type: Number,
        required: true,
        min: 1
    }, // Durée en minutes
    genre: {
        type: [String],
        required: true,
        validate: {
            validator: function (array) {
                return array.length > 0;
            },
            message: 'Au moins un genre doit être spécifié'
        }
    }, // Genres du film (action, comédie, etc.)
    dateSortie: {
        type: Date,
        required: true
    }, // Date de sortie
    description: {
        type: String,
        required: true
    }, // Synopsis ou description
    acteurs: {
        type: [String],
        required: true
    }, // Liste des acteurs principaux
    classification: {
        type: String,
        enum: ['Tous publics', '-12 ans', '-16 ans', '-18 ans'],
        required: true
    }, // Classification d'âge
    langue: {
        type: String,
        required: true,
        default: 'Français'
    }, // Langue originale
    sousTitres: {
        type: String
    }, // Langue des sous-titres si applicable
    affiche: {
        type: String,
        required: true
    }, // URL de l'affiche du film
    bandeAnnonce: {
        type: String
    }, // URL de la bande annonce
    note: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    }, // Note moyenne du film
    seances: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seance'
    }] // Référence aux séances associées
}, {
    timestamps: true
});

// Export du modèle
module.exports = mongoose.model('Film', filmSchema);