/* const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db');
const routes = require('./routes/index'); // Vérifiez que "routes" exporte bien un middleware Express
const bodyParser = require('body-parser');
const app = express();
const Admin = require('./models/admin');

// Connexion à la base de données
connectDB();

// const createDefaultAdmin = async () => {
//     const existing = await Admin.findOne({ pseudo: 'admin' });
//     if (!existing) {
//         const admin = new Admin({ pseudo: 'admin', password: 'admin123' });
//         await admin.save();
//         console.log('Admin par défaut créé : admin/admin123');
//     }
// };
// createDefaultAdmin();

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Middleware pour les données URL-encoded
app.use(bodyParser.json()); // Middleware pour les données JSON
app.use(routes); // Assurez-vous que "routes" est un routeur Express valide

// Démarrage du serveur
app.listen(3000, () => {
    console.log("Server is running at port 3000");
}); */

const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const serverless = require("serverless-http"); // Import nécessaire pour Vercel

const app = express();
const Admin = require('./models/admin');

// Connexion à la base de données
connectDB();
//Créer un admin par défaut si nécessaire
// const createDefaultAdmin = async () => {
//     const existing = await Admin.findOne({ pseudo: 'admin' });
//     if (!existing) {
//         const admin = new Admin({ pseudo: 'admin', password: 'admin123' });
//         await admin.save();
//         console.log('Admin par défaut créé : admin/admin123');
//     }
// };
// createDefaultAdmin();

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routes);

// ⛔ Supprimer ceci
app.listen(3000, () => {
    console.log("Server is running at port 3000");
});

// ✅ Exporter la fonction handler pour Vercel
//module.exports = serverless(app);

