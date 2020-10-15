const express = require('express');
const routes = express.Router();

const StatisticsController = require('../controllers/statistics.controller');

/**rotas a partir /api/v1/statistics */

routes.get('/', StatisticsController.apiGetStatisticsInformation);
routes.get('/collections', StatisticsController.apiGetStatisticsCollections);

module.exports = routes;
