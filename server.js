require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

/**local require */
const UsersModels = require('./src/models/users.models');
const UsersRoutes = require('./src/routes/users.routes');

const app = express();

const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', UsersRoutes);

// const uri =
//   'mongodb+srv://recycle:recycle2020@sandbox-a2uhg.mongodb.net/test?retryWrites=true&w=majority';

const client = new MongoClient(process.env.DB_MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client
  .connect()
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async client => {
    /**Conecta na database  */
    const db = client.db('recycle');
    console.log(`Conectado no banco db recycle`);

    await UsersModels.conectCollection(db);

    /**starta a aplicação */
    app.listen(port, () => {
      console.log(`Servidor On na porta ${port} `);
    });
  });

client.close();
