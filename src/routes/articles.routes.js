const express = require('express');
const routes = express.Router();

const ArticleController = require('../controllers/articles.controller');

/**rotas a partir /api/v1/articles */

routes.get('/', ArticleController.apiGetAllArticles);

routes.post('/', ArticleController.apiAddArticle);

module.exports = routes;
