const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();  // Pour charger les variables d'environnement depuis le fichier .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour traiter les données du formulaire
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier public
app.use(express.static('public'));

// Route pour afficher le formulaire
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});