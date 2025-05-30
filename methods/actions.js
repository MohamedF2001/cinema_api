var User = require('../models/user')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var j_decoo = require('jwt-decode')
const jwt_decode = require('jwt-decode');

const jwtt = require('jsonwebtoken');

var functions = {
    addUser: function (req, res) {
        if ((!req.body.nom) || (!req.body.password) || (!req.body.prenom) || (!req.body.email) || (!req.body.numero)) {
            res.json({ success: false, msg: 'Entrez tous les champs' })
        }
        else {
            var newUser = new User({
                name: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                numero: req.body.numero,
                password: req.body.password
            });
            newUser.save()
                .then(() => {
                    var token = jwt.encode(newUser, config.secret);
                    res.json({ success: true, msg: 'Enregistré avec succès', token: token })
                })
                .catch((err) => {
                    res.json({ success: false, msg: 'Enregistrement échoué' })
                });
        }
    },

    authenticate: function (req, res) {
        User.findOne({ name: req.body.nom })
            .then(user => {
                if (!user) {
                    res.status(403).send({ success: false, msg: 'Authentication Failed, User not found' });
                } else {
                    user.comparePassword(req.body.password)
                        .then(isMatch => {
                            if (isMatch) {
                                var token = jwt.encode(user, config.secret);
                                res.json({ success: true, token: token });
                            } else {
                                res.status(403).send({ success: false, msg: 'Authentication failed, wrong password' });
                            }
                        })
                        .catch(err => {
                            res.status(500).send({ success: false, msg: 'Error comparing password' });
                        });
                }
            })
            .catch(err => {
                res.status(500).send({ success: false, msg: 'Error finding user' });
            });
    },

    getinfo: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1];
            try {
                //var decodedtoken = jwt_decode(token);
                var decodedtoken = jwtt.verify(token, config.secret);
                if (decodedtoken && decodedtoken.name) {
                    //return res.json({ success: true, msg: 'Hello ' + decodedtoken.name });
                    return res.json({ success: true, msg: decodedtoken.name });
                } else {
                    return res.json({ success: false, msg: 'Invalid token or missing data' });
                }
            } catch (error) {
                return res.json({ success: false, msg: 'Error decoding token', error: error.message });
            }
        } else {
            return res.json({ success: false, msg: 'No Headers' });
        }
    },

    // Créer un film
    addFilm: function (req, res) {
        if (!req.body.titre || !req.body.realisateur || !req.body.duree || !req.body.genre) {
            return res.status(400).json({ success: false, msg: 'Remplissez tous les champs obligatoires' });
        }

        const newFilm = new Film({
            titre: req.body.titre,
            realisateur: req.body.realisateur,
            duree: req.body.duree,
            genre: req.body.genre,
            dateSortie: req.body.dateSortie,
            description: req.body.description,
            acteurs: req.body.acteurs,
            classification: req.body.classification,
            affiche: req.body.affiche
        });

        newFilm.save()
            .then(film => res.status(201).json({ success: true, msg: 'Film créé', data: film }))
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de création', error: err }));
    },

    // Lire tous les films
    getAllFilms: function (req, res) {
        Film.find({})
            .then(films => res.json({ success: true, data: films }))
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de lecture', error: err }));
    },

    // Lire un film par ID
    getFilmById: function (req, res) {
        Film.findById(req.params.id)
            .then(film => {
                if (!film) {
                    return res.status(404).json({ success: false, msg: 'Film non trouvé' });
                }
                res.json({ success: true, data: film });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de lecture', error: err }));
    },

    // Mettre à jour un film
    updateFilm: function (req, res) {
        Film.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then(film => {
                if (!film) {
                    return res.status(404).json({ success: false, msg: 'Film non trouvé' });
                }
                res.json({ success: true, msg: 'Film mis à jour', data: film });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de mise à jour', error: err }));
    },

    // Supprimer un film
    deleteFilm: function (req, res) {
        Film.findByIdAndDelete(req.params.id)
            .then(film => {
                if (!film) {
                    return res.status(404).json({ success: false, msg: 'Film non trouvé' });
                }
                res.json({ success: true, msg: 'Film supprimé' });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de suppression', error: err }));
    },

    // Créer une réservation
    addReservation: function (req, res) {
        if (!req.body.seanceId || !req.body.userId || !req.body.nombrePlaces || !req.body.prixTotal) {
            return res.status(400).json({ success: false, msg: 'Remplissez tous les champs obligatoires' });
        }

        const newReservation = new Reservation({
            seanceId: req.body.seanceId,
            userId: req.body.userId,
            nombrePlaces: req.body.nombrePlaces,
            prixTotal: req.body.prixTotal,
            statut: req.body.statut || 'confirmée'
        });

        newReservation.save()
            .then(async reservation => {
                // Mettre à jour les places disponibles dans la séance
                await Seance.findByIdAndUpdate(
                    req.body.seanceId,
                    { $inc: { placesDisponibles: -req.body.nombrePlaces } }
                );
                res.status(201).json({ success: true, msg: 'Réservation créée', data: reservation });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de création', error: err }));
    },

    // Lire toutes les réservations
    getAllReservations: function (req, res) {
        Reservation.find({}).populate('seanceId').populate('userId')
            .then(reservations => res.json({ success: true, data: reservations }))
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de lecture', error: err }));
    },

    // Lire les réservations d'un utilisateur
    getUserReservations: function (req, res) {
        Reservation.find({ userId: req.params.userId }).populate('seanceId')
            .then(reservations => res.json({ success: true, data: reservations }))
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de lecture', error: err }));
    },

    // Annuler une réservation
    cancelReservation: function (req, res) {
        Reservation.findByIdAndUpdate(
            req.params.id,
            { statut: 'annulée' },
            { new: true }
        )
            .then(async reservation => {
                if (!reservation) {
                    return res.status(404).json({ success: false, msg: 'Réservation non trouvée' });
                }
                // Rembourser les places dans la séance
                await Seance.findByIdAndUpdate(
                    reservation.seanceId,
                    { $inc: { placesDisponibles: reservation.nombrePlaces } }
                );
                res.json({ success: true, msg: 'Réservation annulée', data: reservation });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur d\'annulation', error: err }));
    },

    // Supprimer une réservation
    deleteReservation: function (req, res) {
        Reservation.findByIdAndDelete(req.params.id)
            .then(reservation => {
                if (!reservation) {
                    return res.status(404).json({ success: false, msg: 'Réservation non trouvée' });
                }
                res.json({ success: true, msg: 'Réservation supprimée' });
            })
            .catch(err => res.status(500).json({ success: false, msg: 'Erreur de suppression', error: err }));
    }

}

module.exports = functions