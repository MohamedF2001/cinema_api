const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
    /* filmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film',
        required: true
    }, */ // Référence au film
    filmId: {
        type: String,
        required: true
    }, // Nom du film
    film: {
        type: String,
        required: true
    }, // Nom du film
    img_film: {
        type: String,
        required: true
    }, // Image du film
    horaire: {
        type: Date,
        required: true
    }, // Date et heure de la séance
    date: {
        type: Date,
        required: true
    }, // Date de la séance
    salle: {
        type: String,
        required: true
    }, // Salle de projection
    typeSeance: {
        type: String,
        enum: ['Normal', '3D', 'VIP'], // Types de séance disponibles
        required: true
    }, // Type de séance (2D ou 3D)
    prix: {
        type: Number,
        required: true,
        min: 0
    }, // Prix du ticket
    placesDisponibles: {
        type: Number,
        default: 100,
        min: 0
    },
}, { timestamps: true });

// Export du modèle
module.exports = mongoose.model('Seance', seanceSchema);