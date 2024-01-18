const express = require('express');
const mongoose = require('mongoose');
const ipRouter=require("./routes/ipRoutes")
const app = express();
const port = 3000;

// Configuration de Mongoose et connexion à la base de données MongoDB
mongoose.set("strictQuery", true);
mongoose.connect('mongodb://127.0.0.1:27017/django_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Gestion des erreurs de connexion à MongoDB
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Utilisation des routes définies dans ipAddressRoutes
app.use("/api/v1/iproutes", ipRouter)

// Lancement du serveur Express
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});