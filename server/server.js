const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");

const app = express();
const port = 5000;

// URL de connexion à la base de données MongoDB
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'django_database';
const collectionName = 'api_ipaddress';
app.use(express.json());
app.use(cors({ origin: "*" }));
app.get('/api/fetchData', async (req, res) => {
  let client; // Déclaration de la variable client en dehors du bloc try

  try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();

      const database = client.db(dbName);
      const collection = database.collection(collectionName);

      // Récupération de toutes les données de la collection
      const result = await collection.find({}).toArray();

      console.log('Data from MongoDB:', result);

      res.json(result);
  } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      if (client) {
          await client.close();
          console.log('Connection to MongoDB closed');
      }
  }
});

// Nouvelle route pour supprimer tous les éléments de la collection
app.delete('/api/deleteAllData', async (req, res) => {
  let client; // Déclaration de la variable client en dehors du bloc try

  try {
      client = new MongoClient(url, { useUnifiedTopology: true });
      await client.connect();

      const database = client.db(dbName);
      const collection = database.collection(collectionName);

      // Suppression de tous les documents de la collection
      const deleteResult = await collection.deleteMany({});

      console.log('Deleted documents:', deleteResult.deletedCount);

      res.json({ message: 'All data deleted successfully' });
  } catch (error) {
      console.error('Error deleting data from MongoDB:', error);
      res.status(500).send('Internal Server Error');
  } finally {
      if (client) {
          await client.close();
          console.log('Connection to MongoDB closed');
      }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});