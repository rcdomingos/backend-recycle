const express = require('express');
const routes = express.Router();

const authentication = require('../middlewares/authentication');

const CollectorController = require('../controllers/collector.controller');

/**rotas apartir do '/api/v1/collectors' */
routes.post('/', authentication, CollectorController.apiAddCollector);

routes.get('/', authentication, CollectorController.apiGetAllCollector);

routes.delete('/:id', authentication, CollectorController.apiDeleteCollector);

routes.get(
  '/:id/status',
  authentication,
  CollectorController.apiGetStatusPreCollector
);

routes.put(
  '/:id/status',
  authentication,
  CollectorController.apiAlterStatusPreCollector
);

module.exports = routes;
