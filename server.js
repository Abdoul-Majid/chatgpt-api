const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();  // Pour charger les variables d'environnement depuis le fichier .env

const app = express();
const port = process.env.PORT || 5000;

// Middleware pour traiter les données du formulaire
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier public
app.use(express.static('public'));

// Mise en place de la route pour afficher la page index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.post('/submit', (req, res) => {
  const { nom, prenom, email, recherche } = req.body;

  // Enregistre les données dans un fichier JSON
  const data = {
    nom,
    prenom,
    email,
    recherche,
  };
  
  fs.writeFile('data.json', JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors de l\'enregistrement des données.');
    } else {
      // Appelle la fonction pour communiquer avec l'API ChatGPT
      chatGPTResponse(recherche)
        .then((response) => {
          // Enregistre la réponse dans le fichier JSON
          data.reponseChatGPT = response;
          fs.writeFile('data.json', JSON.stringify(data), (err) => {
            if (err) {
              console.error(err);
              res.status(500).send('Erreur lors de l\'enregistrement de la réponse ChatGPT.');
            } else {
              res.status(200).send('Données enregistrées avec succès.');
            }
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Erreur lors de la communication avec l\'API ChatGPT.');
        });
    }
  });
}
)

const chatGPTResponse = async (texteRecherche) => {
  try {
    
    const apiKey = process.env.CHATGPT_API_KEY; // chargement de ma clé

    // Envoi de la requette
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: texteRecherche },
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    throw error;
  }
};

// Gestionnaire d'erreur global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erreur interne du serveur.');
});

// Mise à l'écoute du serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});