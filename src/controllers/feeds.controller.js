const logger = require('../../utils/winston');

const FeedModel = require('../models/feeds.model');

class FeedController {
  /**
   * Metodo para listar todos os Feeds
   **/
  static async apiGetAllFeed(req, res) {
    try {
      let page = parseInt(req.query.page || 1);
      let limit = parseInt(req.query.limit || 5);

      const feedList = await FeedModel.getAllFeed(page, limit);

      res.status(200).json(feedList);
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro na tratativa dos dados`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para listar um Feed
   */

  static async apiGetFeed(req, res) {
    try {
      let feedId = req.params.feedId;
      const feed = await FeedModel.getFeed(feedId);

      res.status(200).json(feed);
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro na tratativa dos dados`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para cadastrar o Feed
   */
  static async apiPostFeed(req, res) {
    try {
      let data = {
        createdDate: new Date(),
        ...req.body,
      };

      const resultInsert = await FeedModel.addPostFeed(data);

      // res.status(201).json(resultInsert);

      res.status(201).json({
        code: 201,
        message: `Dados inseridos com sucesso`,
        description: `O novo feed foi criado com sucesso`,
      });
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro na tratativa dos dados`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar o Feed
   */
  static async apiAlterFeed(req, res) {
    try {
      let feedId = req.params.feedId;
      let data = {
        updatedDate: new Date(),
        ...req.body,
      };

      const resultUpdate = await FeedModel.updatePostFeed(feedId, data);

      res.status(201).json(resultUpdate);
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro na tratativa dos dados`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para deletar o Feed
   */
  static async apiDeleteFeed(req, res) {
    try {
      let feedId = req.params.feedId;

      const resultDelete = await FeedModel.deletePostFeed(feedId);
      if (resultDelete.sucess) {
        res.status(201).json({
          code: 201,
          message: `Feed Deletado com sucesso`,
          description: `O feed foi deletado da base de dados`,
        });
      } else {
        res.status(200).json({
          code: 200,
          message: `${resultDelete.error}`,
          description: `${resultDelete.description}`,
        });
      }
    } catch (e) {
      logger.error(`${e}`, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Ocorreu erro para excluir o recurso informado`,
        description: `${e}`,
      });
    }
  }
}

module.exports = FeedController;
