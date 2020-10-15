const logger = require('../../utils/winston');
const UsersModels = require('../models/users.models');
const CollectModel = require('../models/collections.models');

class StatisticsController {
  static async apiGetStatisticsInformation(req, res) {
    try {
      const { totalUsers, totalCollectors } = await UsersModels.getTotalUsers();
      const {
        totalCollections,
        CompletedCollections,
      } = await CollectModel.getTotalCollections();

      let response = {
        users: totalUsers,
        collectors: totalCollectors,
        collections: totalCollections,
        completedCollections: CompletedCollections,
      };

      res.status(200).json(response);
    } catch (e) {
      logger.error(`${e}`);
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  static async apiGetStatisticsCollections(req, res) {
    const calcLastDayOfMonth = (year, month) => {
      var lastDay = new Date(year, month, 0).getDate();
      return lastDay;
    };

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let lastDayOfMonth = calcLastDayOfMonth(year, month);

    let initialDate = req.query.initialDate || `${year}-${month}-01`;
    let finalDate = req.query.finalDate || `${year}-${month}-${lastDayOfMonth}`;

    try {
      const collectionsInfo = await CollectModel.getCollectionForDay(
        initialDate,
        finalDate
      );

      res.status(200).json(collectionsInfo);
    } catch (e) {
      logger.error(`${e}`);
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }
}

module.exports = StatisticsController;
