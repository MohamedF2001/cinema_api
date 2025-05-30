var Reservation = require('../models/reservation')
const Seance = require('../models/seance');
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')

const jwtt = require('jsonwebtoken');

var functions = {
    createReservation: async (req, res) => {
        try {
            const { seanceId, userId, numeroSiege, prixTotal } = req.body;

            // Vérifier si le siège est déjà réservé pour cette séance
            const existingReservation = await Reservation.findOne({
                seanceId,
                numeroSiege
            });

            if (existingReservation) {
                return res.status(400).json({
                    success: false,
                    message: 'Ce siège est déjà réservé pour cette séance'
                });
            }

            const newReservation = new Reservation({
                seanceId,
                userId,
                numeroSiege: numeroSiege, // Nouveau champ
                prixTotal,
                // nombrePlaces n'est plus nécessaire (toujours 1)
                statut: "confirmée" // Valeur par défaut
            });

            const saved = await newReservation.save();
            res.status(201).json({ success: true, reservation: saved });
        } catch (err) {
            console.error('Erreur d\'enregistrement :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création',
                error: err.message
            });
        }
    },

    getReservations: async (req, res) => {
        try {
            const reservations = await Reservation.find()
                .populate('seanceId')
                .populate('userId');
            res.json({ success: true, reservations });
        } catch (err) {
            console.error('Erreur de récupération :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération',
                error: err.message
            });
        }
    },

    getReservationsByUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const reservations = await Reservation.find({ userId })
                .populate('seanceId')
                .populate('userId');

            res.json({ success: true, reservations });
        } catch (err) {
            console.error('Erreur lors de la récupération :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur',
                error: err.message
            });
        }
    },

    // GET /api/reservations/seance/:seanceId
    getReservedSeats: async (req, res) => {
        try {
            const reservations = await Reservation.find({ seanceId: req.params.seanceId });
            const siegesReserves = reservations.map(r => r.numeroSiege);
            res.json(siegesReserves);
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur", error });
        }
    },


    getReservationsBySeance: async (req, res) => { // Nouvelle fonction utile
        try {
            const seanceId = req.params.seanceId;
            const reservations = await Reservation.find({ seanceId });
            res.json({ success: true, reservations });
        } catch (err) {
            console.error('Erreur de récupération :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur',
                error: err.message
            });
        }
    },

    updateReservation: async (req, res) => {
        try {
            const reservationId = req.params.id;
            const { numeroSiege } = req.body;

            const reservation = await Reservation.findById(reservationId)
                .populate('seanceId');

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Réservation non trouvée'
                });
            }

            // Vérifier le délai avant la séance
            const seanceHoraire = new Date(reservation.seanceId.horaire);
            const now = new Date();
            const diffInHours = (seanceHoraire - now) / (1000 * 60 * 60);

            if (diffInHours < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Modification impossible moins d\'une heure avant la séance'
                });
            }

            // Si changement de siège, vérifier disponibilité
            if (numeroSiege && numeroSiege !== reservation.numeroSiege) {
                const existing = await Reservation.findOne({
                    seanceId: reservation.seanceId,
                    numeroSiege
                });

                if (existing) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ce siège est déjà réservé'
                    });
                }
            }

            const updated = await Reservation.findByIdAndUpdate(
                reservationId,
                req.body,
                { new: true }
            );

            res.json({ success: true, reservation: updated });
        } catch (err) {
            console.error('Erreur de modification :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la modification',
                error: err.message
            });
        }
    },

    deleteReservation: async (req, res) => {
        try {
            const reservationId = req.params.id;
            const reservation = await Reservation.findById(reservationId)
                .populate('seanceId');

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Réservation non trouvée'
                });
            }

            const seanceHoraire = new Date(reservation.seanceId.horaire);
            const now = new Date();
            const diffInHours = (seanceHoraire - now) / (1000 * 60 * 60);

            if (diffInHours < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Suppression impossible moins d\'une heure avant la séance'
                });
            }

            await Reservation.findByIdAndDelete(reservationId);
            res.json({
                success: true,
                message: 'Réservation supprimée avec succès'
            });
        } catch (err) {
            console.error('Erreur de suppression :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression',
                error: err.message
            });
        }
    },

    getReservationById: async (req, res) => {
        try {
            const reservationId = req.params.id;
            const reservation = await Reservation.findById(reservationId)
                .populate('seanceId')
                .populate('userId');

            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    message: 'Réservation non trouvée'
                });
            }

            res.json({ success: true, reservation });
        } catch (err) {
            console.error('Erreur lors de la récupération de la réservation :', err);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur',
                error: err.message
            });
        }
    },

}

module.exports = functions;