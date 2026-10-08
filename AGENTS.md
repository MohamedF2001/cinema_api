# Cinema API - Documentation du projet

## Structure du projet

- `methods/` : Contient les contrôleurs et logique métier
  - `reservation_actions.js` : Actions pour les réservations
  - `seance_actions.js` : Actions pour les séances
  - `user_actions.js` : Actions pour les utilisateurs
  - `admin_actions.js` : Actions pour les administrateurs
- `models/` : Modèles Mongoose
  - `reservation.js` : Modèle de réservation
  - `seance.js` : Modèle de séance
  - `user.js` : Modèle d'utilisateur
  - `admin.js` : Modèle d'administrateur
- `middleware/` : Middlewares Express
  - `auth_middleware.js` : Authentification des utilisateurs
  - `admin_middleware.js` : Authentification des administrateurs
- `routes/` : Routes Express
  - `index.js` : Toutes les routes de l'API
- `config/` : Configuration
  - `db.js` : Configuration de la base de données MongoDB
  - `dbconfig.js` : Configuration JWT et secrets
- `tests/` : Tests Jest
  - `reservation.test.js` : Tests pour les réservations

## Lancement du serveur

```bash
npm start
```

Le serveur démarre sur le port 3000.

## Tests

Pour exécuter les tests, vous devez d'abord installer les dépendances de développement :

```bash
npm install --save-dev jest supertest
```

Ensuite, définissez une variable d'environnement pour la base de données de test (optionnel, utilise par défaut localhost:27017/cinema_test) :

```bash
export MONGO_TEST_URI=mongodb://localhost:27017/cinema_test
```

Exécutez les tests :

```bash
npm test
```

## Routes API

### Réservations

- `POST /reservations` : Créer une réservation (authentifié)
- `GET /reservations` : Obtenir toutes les réservations
- `GET /reservations/user/:userId` : Obtenir les réservations d'un utilisateur (authentifié)
- `GET /reservations/seance/:seanceId` : Obtenir les sièges réservés pour une séance
- `GET /reservation/:id` : Obtenir une réservation par ID (authentifié)
- `PUT /reservations/:id` : Modifier une réservation
- `DELETE /reservations/:id` : Supprimer une réservation (authentifié, restriction de 1h)
- `DELETE /admin/reservations/:id` : Supprimer une réservation (administrateur, sans restriction)

### Séances

- `POST /seances` : Créer une séance
- `GET /seances` : Obtenir toutes les séances
- `GET /seances/:id` : Obtenir une séance par ID
- `GET /seances/film/:filmId` : Obtenir les séances d'un film
- `GET /seances/date/:date` : Obtenir les séances par date
- `PUT /seances/:id` : Modifier une séance
- `PATCH /seances/:id/places` : Mettre à jour les places disponibles
- `DELETE /seances/:id` : Supprimer une séance

### Utilisateurs

- `POST /register` : Inscription
- `POST /login` : Connexion
- `POST /reset-password` : Réinitialisation du mot de passe
- `GET /me` : Profil utilisateur (authentifié)
- `GET /logout` : Déconnexion (authentifié)

### Administrateurs

- `POST /adminlogin` : Connexion administrateur
- `POST /adminregister` : Inscription administrateur
- `GET /admin` : Vérifier statut administrateur (authentifié)

## Règles métier importantes

### Suppression de réservations

1. **Utilisateurs** : Ne peuvent supprimer une réservation que si la séance est dans plus d'une heure
2. **Administrateurs** : Peuvent supprimer n'importe quelle réservation, quel que soit le délai
3. **Séance manquante** : La suppression est possible même si la séance liée n'existe plus (seanceId null)

### Modification de réservations

Les mêmes règles de délai s'appliquent pour les modifications que pour les suppressions.

## Correction récente (DELETE /reservations/:id)

### Problèmes corrigés

1. **Erreur 500 - "Cannot read properties of null (reading 'horaire')"**
   - Cause : La séance liée à la réservation n'existait plus
   - Solution : Ajout d'une vérification avant d'accéder aux propriétés de la séance

2. **Erreur 400 - "Suppression impossible moins d'une heure avant la séance"**
   - La règle métier est conservée pour les utilisateurs
   - Une exception explicite a été ajoutée pour les administrateurs
   - Ajout de l'authMiddleware sur la route DELETE /reservations/:id
   - Création d'une route séparée pour les administrateurs : DELETE /admin/reservations/:id

### Fichiers modifiés

- `methods/reservation_actions.js` : Modification de `deleteReservation` et `updateReservation`
- `routes/index.js` : Ajout des middlewares d'authentification et nouvelle route admin
- `server.js` : Export de l'app pour les tests
- `package.json` : Ajout des dépendances de test
