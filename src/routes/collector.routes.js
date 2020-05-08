const express = require('express');
const routes = express.Router();

const authentication = require('../middlewares/authentication');

const CollectorController = require('../controllers/collector.controller');

/**rotas apartir do '/api/v1/collectors' */
routes.post('/', CollectorController.apiAddCollector);

routes.get('/', CollectorController.apiGetAllPreCollector);

routes.delete('/:id', CollectorController.apiDeletePreCollector);

routes.get('/:id/status', CollectorController.apiGetStatusPreCollector);

routes.put('/:id/status', CollectorController.apiAlterStatusPreCollector);

module.exports = routes;
