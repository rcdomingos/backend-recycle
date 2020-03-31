let articles;

class ArticleModels {
  /**Metodo para conecatar na coleção usuario */
  static async conectCollection(conn) {
    if (articles) {
      return;
    }

    try {
      articles = await conn.collection('articles');

      console.log(`Conectado na coleção articles`);
    } catch (e) {
      console.error(`Falha para conectar com a coleção articles: ${e} `);
    }
  }

  /** Metodo para listar todos os articles */
  static async getAllModels(page = 0, articlePerPage = 20) {
    let query = {};
    let cursor;
    let pagination = page == 0 ? 0 : page - 1;
    let skip = pagination * articlePerPage;

    try {
      cursor = await articles
        .find(query)
        .limit(articlePerPage)
        .skip(skip);
    } catch (e) {
      console.error(`Não foi possivel realizar o comando find: ${e}`);
      return { articleList: [], totalNumArticle: 0 };
    }

    try {
      const articleList = await cursor.toArray();
      const totalNumArticle =
        pagination === 0 ? await articles.countDocuments(query) : 0;

      return { articleList, totalNumArticle };
    } catch (e) {
      console.error('Não foi possivel converter os dados ');
      return { articleList: [], totalNumArticle: 0 };
    }
  }

  /**metodo para adicionar um artigo */
  static async addArticle(articleData) {
    try {
      const resultInsertDb = await articles.insertOne(articleData);

      if (!resultInsertDb.insertedCount) {
        return {
          error: `Ocorreu um erro para Cadastrar o Artigo`,
          description: `Não foi possivel inserir o artigo no banco de dados`
        };
      }

      console.log(resultInsertDb);

      return { sucess: true, article_id: resultInsertDb.insertedId };
    } catch (e) {
      return {
        error: `Ocorreu um erro para Cadastrar o Artigo`,
        description: `${e} `
      };
    }
  }
}

module.exports = ArticleModels;

// {
//   "user_id": "123456",
//   "site_id": "987654321",
//   "post_id": "827004614453058652",
//   "post_title": "Feeling the Burn",
//   "post_body": "Stayed in the sun too long<\/div>",
//   "post_author": "123456",
//   "allow_comments": "yes",
//   "post_link": "my-new-blog-post.html",
//   "require_approval": false,
//   "post_url": "http:\/\/mysite.weebly.com\/blog\/my-new-blog-post.html",
//   "share_message": "Read my latest blog post!",
//   "seo_title": null,
//   "seo_description": null,
//   "tags":  {
//       "health": "health",
//       "food": "food"
//   },
//   "commenting_system": "default",
//   "created_date": 1402964756,
//   "updated_date": 1402964756,
//   "date_format": "j/n/y"
// }
