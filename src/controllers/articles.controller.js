const ArticleModels = require('../models/articles.models');

class ArticleController {
  /**metodo para listar todos os artigos */
  static async apiGetAllArticles(req, res) {
    try {
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);

      const { articleList, totalNumArticle } = await ArticleModels.getAllModels(
        page,
        limit
      );

      let response = {
        articles: articleList,
        total_results: totalNumArticle,
        page: page
      };

      res.status(200).json(response);
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`
      });
    }
  }

  static async apiAddArticle(req, res) {
    try {
      const { article_title, article_body, post_author } = req.body;

      let data = {
        article_title: article_title,
        article_body: article_body,
        post_author: post_author,
        post_created_date: new Date()
      };

      // console.log(data);

      const resultInsert = await ArticleModels.addArticle(data);

      if (!resultInsert.error) {
        res.status(201).json({
          status: 'Sucesso',
          url: `http:localhost:3001/articles/${resultInsert.article_id}`
        });
      }
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`
      });
    }
  }
}

module.exports = ArticleController;

// https://dev.weebly.com/pf_api_blog_posts.html

// {
//   'article_title': 'Teste de postagem'
//   "article_body":"LOrem ipsum",
//   "post_author":
//   "post_created_date":
// }
