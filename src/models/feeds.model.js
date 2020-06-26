const logger = require('../../utils/winston');
const ObjectId = require('mongodb').ObjectID;

let feeds;

class FeedModel {
  /**
   * Metodo para conectar na coleção feeds
   */
  static async conectCollection(conn) {
    if (feeds) return;

    try {
      feeds = await conn.collection('feeds');
      logger.info(`Conectado na coleção feeds`, { label: 'MongoDB' });
    } catch (e) {
      logger.error(`Falha para conectar com a coleção feeds: ${e} `, {
        label: 'MongoDB',
      });
    }
  }

  /**
   * Metodo para listar todos os feeds defaul 5
   */
  static async getAllFeed(page = 0, feedPerPage = 5) {
    let query = {};
    let cursor;
    let pagination = page == 0 ? 0 : page - 1;
    let skip = pagination * feedPerPage;

    try {
      cursor = await feeds.find(query).limit(feedPerPage).skip(skip);
    } catch (e) {
      logger.error(`comando find: ${e}`, { label: 'MongoDb' });
      return {
        error: 'Não foi possivel realizar o comando find',
        description: ` ${e}`,
      };
    }

    try {
      let feedList = await cursor.toArray();
      return feedList;
    } catch (e) {
      logger.error(`comando toArray: ${e}`, { label: 'MongoDb' });
      return {
        error: 'Não foi possivel converter os dados',
        description: ` ${e}`,
      };
    }
  }

  /**
   * Metodo para criar um novo feed no banco
   */
  static async addPostFeed(dataFeed) {
    try {
      const resultInsertDb = await feeds.insertOne(dataFeed);

      if (!resultInsertDb.insertedCount) {
        return {
          error: `Ocorreu um erro para Cadastrar o feed`,
          description: `Não foi possivel inserir o feed no banco de dados`,
        };
      }

      return { sucess: true, feedId: resultInsertDb.insertedId };
    } catch (e) {
      logger.error(`comando insert: ${e}`, { label: 'MongoDb' });
      return {
        error: 'Não foi possivel inserir os dados',
        description: ` ${e}`,
      };
    }
  }

  /**
   * Metodo para alterar o feed no banco
   */
  static async updatePostFeed(feedId, dataFeed) {
    try {
      const resultUpdateDb = await feeds.findOneAndUpdate(
        { _id: ObjectId(feedId) },
        { $set: dataFeed },
        { returnOriginal: false }
      );

      return resultUpdateDb.value;
    } catch (e) {
      logger.error(`comando insert: ${e}`, { label: 'MongoDb' });
      return {
        error: 'Não foi possivel inserir os dados',
        description: ` ${e}`,
      };
    }
  }
}

module.exports = FeedModel;
