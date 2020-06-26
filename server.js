require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const logger = require('./utils/winston');
const path = require('path');

/**local require */
const UsersModels = require('./src/models/users.models');
const UsersRoutes = require('./src/routes/users.routes');
const ArticleModels = require('./src/models/articles.models');
const ArticleRoutes = require('./src/routes/articles.routes');
const CollectorRoutes = require('./src/routes/collector.routes');
const CollectorModels = require('./src/models/collector.models');
const CollectRoutes = require('./src/routes/collections.routes');
const CollectModels = require('./src/models/collections.models');
const FeedModels = require('./src/models/feeds.model');
const FeedRoutes = require('./src/routes/feeds.routes');

logger.info(`Iniciando o servidor...`, { label: 'Express' });

const app = express();

const port = process.env.PORT || process.env.LOCAL_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', UsersRoutes);
app.use('/api/v1/articles', ArticleRoutes);
app.use('/api/v1/collectors', CollectorRoutes);
app.use('/api/v1/collections', CollectRoutes);
app.use('/api/v1/feeds', FeedRoutes);

/**Rotas staticas */
app.use(
  '/images',
  express.static(path.resolve(__dirname, 'uploads', 'images'))
);

logger.info(`Rotas Carregadas`, { label: 'Express' });
/**inicializando a conexão com o mongoDb */
logger.info(`Inciando conexões com o MongoDb`, { label: 'Express' });
const client = new MongoClient(process.env.DB_MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client
  .connect()
  .catch((err) => {
    logger.error(err.stack, { label: 'MongoDb' });
    process.exit(1);
  })
  .then(async (client) => {
    /**Conecta na database  */
    const db = client.db('recycleDB');
    logger.info(`Conectado no banco db recycleDB`, { label: 'MongoDb' });

    await UsersModels.conectCollection(db);
    await ArticleModels.conectCollection(db);
    await CollectorModels.conectCollection(db);
    await CollectModels.conectCollection(db);
    await FeedModels.conectCollection(db);

    /**starta a aplicação */
    app.listen(port, () => {
      logger.info(`O servidor foi iniciado na porta ${port}`, {
        label: 'Express',
      });
    });
  });

client.close();
