var Seance = require('../models/seance')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var j_decoo = require('jwt-decode')

var functions = {
    addSeance: function (req, res) {
        if ((!req.body.filmId) || (!req.body.film) || (!req.body.img_film) ||
            (!req.body.horaire) || (!req.body.date) ||
            (!req.body.salle) || (!req.body.typeSeance) || (!req.body.prix) || (!req.body.img_film)) {
            res.json({ success: false, msg: 'Veuillez remplir tous les champs obligatoires' });
        }
        else {
            var newSeance = new Seance({
                filmId: req.body.filmId,
                film: req.body.film,
                img_film: req.body.img_film,
                horaire: new Date(req.body.horaire),
                date: new Date(req.body.date),
                salle: req.body.salle,
                typeSeance: req.body.typeSeance,
                prix: req.body.prix,
                placesDisponibles: req.body.placesDisponibles || 100 // Utilise la valeur fournie ou la valeur par défaut
            });

            newSeance.save()
                .then((seance) => {
                    res.json({
                        success: true,
                        msg: 'Séance créée avec succès',
                        seance: seance
                    });
                })
                .catch((err) => {
                    res.json({
                        success: false,
                        msg: 'Création de la séance échouée',
                        error: err.message
                    });
                });
        }
    },

    // Récupérer toutes les séances
    getAllSeances: function (req, res) {
        Seance.find()
            .then((seances) => {
                res.json({
                    success: true,
                    seance: seances
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Erreur lors de la récupération des séances',
                    error: err.message
                });
            });
    },

    // Récupérer une séance par son ID
    getSeanceById: function (req, res) {
        Seance.findById(req.params.id)
            .then((seance) => {
                if (!seance) {
                    return res.json({
                        success: false,
                        msg: 'Séance non trouvée'
                    });
                }
                res.json({
                    success: true,
                    seance: seance
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Erreur lors de la récupération de la séance',
                    error: err.message
                });
            });
    },

    // Récupérer les séances par film
    getSeancesByFilm: function (req, res) {
        Seance.find({ filmId: req.params.filmId })
            .then((seances) => {
                res.json({
                    success: true,
                    seances: seances
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Erreur lors de la récupération des séances pour ce film',
                    error: err.message
                });
            });
    },

    // Récupérer les séances par date
    getSeancesByDate: function (req, res) {
        const dateString = req.params.date; // Format attendu: YYYY-MM-DD
        const startDate = new Date(dateString);
        const endDate = new Date(dateString);
        endDate.setDate(endDate.getDate() + 1); // Jusqu'à la fin de la journée

        Seance.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
            .then((seances) => {
                res.json({
                    success: true,
                    seances: seances
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Erreur lors de la récupération des séances pour cette date',
                    error: err.message
                });
            });
    },

    // Mettre à jour une séance
    updateSeance: function (req, res) {
        // Vérifier que tous les champs nécessaires sont présents
        if ((!req.body.filmId) || (!req.body.horaire) || (!req.body.date) ||
            (!req.body.salle) || (!req.body.typeSeance) || (!req.body.prix)) {
            return res.json({ success: false, msg: 'Veuillez remplir tous les champs obligatoires' });
        }

        const updateData = {
            filmId: req.body.filmId,
            horaire: new Date(req.body.horaire),
            date: new Date(req.body.date),
            salle: req.body.salle,
            typeSeance: req.body.typeSeance,
            prix: req.body.prix
        };

        // Ajouter placesDisponibles seulement s'il est fourni
        if (req.body.placesDisponibles !== undefined) {
            updateData.placesDisponibles = req.body.placesDisponibles;
        }

        Seance.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true } // Retourne le document mis à jour et valide les contraintes
        )
            .then((seance) => {
                if (!seance) {
                    return res.json({
                        success: false,
                        msg: 'Séance non trouvée'
                    });
                }
                res.json({
                    success: true,
                    msg: 'Séance mise à jour avec succès',
                    seance: seance
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Mise à jour de la séance échouée',
                    error: err.message
                });
            });
    },

    // Mettre à jour le nombre de places disponibles
    updatePlacesDisponibles: function (req, res) {
        if (req.body.placesDisponibles === undefined) {
            return res.json({ success: false, msg: 'Veuillez spécifier le nombre de places disponibles' });
        }

        Seance.findByIdAndUpdate(
            req.params.id,
            { placesDisponibles: req.body.placesDisponibles },
            { new: true, runValidators: true }
        )
            .then((seance) => {
                if (!seance) {
                    return res.json({
                        success: false,
                        msg: 'Séance non trouvée'
                    });
                }
                res.json({
                    success: true,
                    msg: 'Places disponibles mises à jour avec succès',
                    seance: seance
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Mise à jour des places disponibles échouée',
                    error: err.message
                });
            });
    },

    // Supprimer une séance
    deleteSeance: function (req, res) {
        Seance.findByIdAndDelete(req.params.id)
            .then((seance) => {
                if (!seance) {
                    return res.json({
                        success: false,
                        msg: 'Séance non trouvée'
                    });
                }
                res.json({
                    success: true,
                    msg: 'Séance supprimée avec succès'
                });
            })
            .catch((err) => {
                res.json({
                    success: false,
                    msg: 'Suppression de la séance échouée',
                    error: err.message
                });
            });
    }
}

module.exports = functions;