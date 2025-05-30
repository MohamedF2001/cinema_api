const express = require('express')
const seance_actions = require('../methods/seance_actions')
const register_actions = require('../methods/user_actions')
const authMiddleware = require('../middleware/auth_middleware');
const adminMiddleware = require('../middleware/admin_middleware');
const reservation = require('../methods/reservation_actions')
const admin = require('../methods/admin_actions')

const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World')
})

// Routes pour les séances
router.post('/seances', seance_actions.addSeance);
router.get('/seances', seance_actions.getAllSeances);
router.get('/seances/:id', seance_actions.getSeanceById);
router.get('/seances/film/:filmId', seance_actions.getSeancesByFilm);
router.get('/seances/date/:date', seance_actions.getSeancesByDate);
router.put('/seances/:id', seance_actions.updateSeance);
router.patch('/seances/:id/places', seance_actions.updatePlacesDisponibles);
router.delete('/seances/:id', seance_actions.deleteSeance);


router.post('/register', register_actions.register);
router.post('/login', register_actions.login);
router.post('/reset-password', register_actions.resetPassword);

router.get('/me', authMiddleware, register_actions.getUserProfile);
router.get('/logout', authMiddleware, register_actions.logout);

// Protected route
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ success: true, msg: `Bienvenue ${req.user.nom}` });
});

//router.post('/reservations', authMiddleware, reservation_actions.createReservation);
router.post('/reservations', authMiddleware, reservation.createReservation);

// Obtenir toutes les réservations
router.get('/reservations', reservation.getReservations);

router.get('/reservations/seance/:seanceId', reservation.getReservedSeats);

// Obtenir une réservation par userID
//router.get('/reservations/user/:userId', authMiddleware, reservation_actions.getReservationsByUser);
router.get('/reservations/user/:userId', authMiddleware, reservation.getReservationsByUser);

// Modifier une réservation (avec vérification de l'heure)
//router.put('/reservations/:id', authMiddleware, reservation_actions.updateReservation);
router.put('/reservations/:id', reservation.updateReservation);

// Supprimer une réservation (avec vérification de l'heure)
//router.delete('/reservations/:id', authMiddleware, reservation_actions.deleteReservation);
router.delete('/reservations/:id', reservation.deleteReservation);

// routes/reservation.js ou équivalent
router.get('/reservation/:id', authMiddleware, reservation.getReservationById);

router.post('/adminlogin', admin.loginAdmin);
router.post('/adminregister', admin.registerAdmin);
router.get('/admin', adminMiddleware, (req, res) => {
    res.json({ success: true, msg: `Bienvenue admin ${req.admin.pseudo}` });
});



module.exports = router