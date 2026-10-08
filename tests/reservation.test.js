/**
 * Tests pour la suppression de réservations
 * 
 * Ces tests couvrent les scénarios suivants :
 * 1. Une réservation dont la séance est absente ou nulle
 * 2. Une réservation à plus d'une heure de la séance
 * 3. Une réservation à moins d'une heure, avec refus pour un utilisateur non autorisé
 * 4. Le comportement attendu pour un administrateur
 * 
 * Pour exécuter ces tests, installez les dépendances de test :
 * npm install --save-dev jest supertest
 * 
 * Puis configurez le script de test dans package.json :
 * "test": "jest --detectOpenHandles"
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Assurez-vous que server.js exporte l'app express
const Reservation = require('../models/reservation');
const Seance = require('../models/seance');
const User = require('../models/user');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const config = require('../config/dbconfig');

describe('DELETE /reservations/:id', () => {
    let userToken;
    let adminToken;
    let userId;
    let adminId;
    let seanceId;
    let reservationId;

    beforeAll(async () => {
        // Connexion à la base de test
        await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/cinema_test');

        // Créer un utilisateur de test
        const user = new User({
            nom: 'Test',
            prenom: 'User',
            numero: '0123456789',
            password: 'password123'
        });
        await user.save();
        userId = user._id;
        userToken = jwt.sign({ id: userId }, config.secret, { expiresIn: '1h' });

        // Créer un administrateur de test
        const admin = new Admin({
            pseudo: 'testadmin',
            password: 'admin123'
        });
        await admin.save();
        adminId = admin._id;
        adminToken = jwt.sign({ id: adminId }, config.secret, { expiresIn: '1h' });
    });

    afterAll(async () => {
        // Nettoyage
        await Reservation.deleteMany({});
        await Seance.deleteMany({});
        await User.deleteMany({});
        await Admin.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Créer une séance pour les tests
        const seance = new Seance({
            filmId: 'film123',
            film: 'Test Film',
            img_film: 'http://example.com/image.jpg',
            horaire: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
            date: new Date(),
            salle: 'Salle 1',
            typeSeance: 'Normal',
            prix: 10,
            placesDisponibles: 100
        });
        await seance.save();
        seanceId = seance._id;

        // Créer une réservation pour les tests
        const reservation = new Reservation({
            seanceId: seanceId,
            userId: userId,
            numeroSiege: 'A1',
            prixTotal: 10,
            statut: 'confirmée'
        });
        await reservation.save();
        reservationId = reservation._id;
    });

    afterEach(async () => {
        await Reservation.deleteMany({});
        await Seance.deleteMany({});
    });

    // Test 1: Réservation avec séance absente ou nulle
    test('Suppression d\'une réservation dont la séance est absente (seanceId null)', async () => {
        // Créer une réservation avec une séance qui sera supprimée
        const seance = new Seance({
            filmId: 'film456',
            film: 'Test Film 2',
            img_film: 'http://example.com/image2.jpg',
            horaire: new Date(Date.now() + 2 * 60 * 60 * 1000),
            date: new Date(),
            salle: 'Salle 2',
            typeSeance: 'Normal',
            prix: 10,
            placesDisponibles: 100
        });
        await seance.save();
        const seanceIdToDelete = seance._id;

        const reservation = new Reservation({
            seanceId: seanceIdToDelete,
            userId: userId,
            numeroSiege: 'B1',
            prixTotal: 10,
            statut: 'confirmée'
        });
        await reservation.save();
        const reservationIdToDelete = reservation._id;

        // Supprimer la séance
        await Seance.findByIdAndDelete(seanceIdToDelete);

        // Tenter de supprimer la réservation
        const response = await request(app)
            .delete(`/reservations/${reservationIdToDelete}`)
            .set('Authorization', `Bearer ${userToken}`);

        // La suppression doit réussir même si la séance n'existe plus
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Réservation supprimée avec succès');

        // Vérifier que la réservation a bien été supprimée
        const deletedReservation = await Reservation.findById(reservationIdToDelete);
        expect(deletedReservation).toBeNull();
    });

    // Test 2: Réservation à plus d'une heure de la séance
    test('Suppression d\'une réservation à plus d\'une heure de la séance (utilisateur)', async () => {
        const response = await request(app)
            .delete(`/reservations/${reservationId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Réservation supprimée avec succès');
    });

    // Test 3: Réservation à moins d'une heure (refus pour utilisateur)
    test('Suppression d\'une réservation à moins d\'une heure (refus pour utilisateur)', async () => {
        // Créer une séance dans 30 minutes
        const seance = new Seance({
            filmId: 'film789',
            film: 'Test Film 3',
            img_film: 'http://example.com/image3.jpg',
            horaire: new Date(Date.now() + 30 * 60 * 1000), // Dans 30 minutes
            date: new Date(),
            salle: 'Salle 3',
            typeSeance: 'Normal',
            prix: 10,
            placesDisponibles: 100
        });
        await seance.save();

        const reservation = new Reservation({
            seanceId: seance._id,
            userId: userId,
            numeroSiege: 'C1',
            prixTotal: 10,
            statut: 'confirmée'
        });
        await reservation.save();

        const response = await request(app)
            .delete(`/reservations/${reservation._id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Suppression impossible moins d\'une heure avant la séance');
    });

    // Test 4: Administrateur peut supprimer même à moins d'une heure
    test('Suppression d\'une réservation à moins d\'une heure (administrateur autorisé)', async () => {
        // Créer une séance dans 30 minutes
        const seance = new Seance({
            filmId: 'film999',
            film: 'Test Film 4',
            img_film: 'http://example.com/image4.jpg',
            horaire: new Date(Date.now() + 30 * 60 * 1000), // Dans 30 minutes
            date: new Date(),
            salle: 'Salle 4',
            typeSeance: 'Normal',
            prix: 10,
            placesDisponibles: 100
        });
        await seance.save();

        const reservation = new Reservation({
            seanceId: seance._id,
            userId: userId,
            numeroSiege: 'D1',
            prixTotal: 10,
            statut: 'confirmée'
        });
        await reservation.save();

        // Utiliser la route admin
        const response = await request(app)
            .delete(`/admin/reservations/${reservation._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Réservation supprimée avec succès');
    });

    // Test 5: Réservation non trouvée
    test('Suppression d\'une réservation inexistante', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/reservations/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Réservation non trouvée');
    });

    // Test 6: Suppression sans authentification
    test('Suppression sans token d\'authentification', async () => {
        const response = await request(app)
            .delete(`/reservations/${reservationId}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
