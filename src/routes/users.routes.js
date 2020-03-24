const express = require('express');
const routes = express.Router();

const UsersController = require('../controllers/users.controller');

/**rotas apartir do '/api/v1/users' */
routes.get('/', UsersController.apiGetAllUsers);

routes.get('/:id', UsersController.apiGetUsers);

routes.put('/:id', UsersController.apiAlterUser);

routes.delete('/:id', UsersController.apiDeleteUser);

routes.post('/', UsersController.apiAddUser);

module.exports = routes;
