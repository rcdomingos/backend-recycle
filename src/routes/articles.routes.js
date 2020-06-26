const express = require('express');
const routes = express.Router();

const ArticleController = require('../controllers/articles.controller');

/**rotas a partir /api/v1/articles */

routes.get('/', ArticleController.apiGetAllArticles);

routes.get('/:articleId', ArticleController.apiGetArticle);

routes.post('/', ArticleController.apiAddArticle);

routes.put('/:articleId', ArticleController.apiAlterArticle);

routes.delete('/:articleId', ArticleController.apiDeleteArticle);

module.exports = routes;
