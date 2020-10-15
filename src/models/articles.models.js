const logger = require('../../utils/winston');
const ObjectId = require('mongodb').ObjectID;

let articles;

class ArticleModels {
  /**Metodo para conecatar na coleção usuario */
  static async conectCollection(conn) {
    if (articles) return;

    try {
      articles = await conn.collection('articles');
      logger.info(`Conectado na coleção articles`, { label: 'MongoDB' });
    } catch (e) {
      logger.error(`Falha para conectar com a coleção articles: ${e} `, {
        label: 'MongoDB',
      });
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
        .skip(skip)
        .project({ title: 1, author: 1, createdDate: 1, card: 1 });
    } catch (e) {
      logger.error(`Não foi possivel realizar o comando find: ${e}`);
      return { articleList: [], totalNumArticle: 0 };
    }

    try {
      const articleList = await cursor.toArray();
      const totalNumArticle = await articles.countDocuments(query);
      const count = await articleList.length;

      return { articleList, totalNumArticle, count };
    } catch (e) {
      logger.error('Não foi possivel converter os dados ');
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
          description: `Não foi possivel inserir o artigo no banco de dados`,
        };
      }

      return { sucess: true, articleId: resultInsertDb.insertedId };
    } catch (e) {
      return {
        error: `Ocorreu um erro para Cadastrar o Artigo`,
        description: `${e} `,
      };
    }
  }

  static async getArticle(articleId) {
    try {
      const resultFind = await articles.findOne(ObjectId(articleId));

      return resultFind || { message: 'Artigo não localizado' };
    } catch (e) {
      logger.error(e, { label: 'MongoDb' });
      return {
        error: `Ocorreu um erro para Localizar o Artigo`,
        description: `${e}`,
      };
    }
  }

  static async alterArticle(articleId, updateUser, articleData) {
    try {
      articleData.updatedDate = new Date();
      articleData.updatedUser = updateUser;

      const resultUpdate = await articles.findOneAndUpdate(
        { _id: ObjectId(articleId) },
        { $set: articleData },
        { returnOriginal: false }
      );

      return resultUpdate.value;
    } catch (e) {
      logger.error(e, { label: 'MongoDb' });
      return {
        error: `Ocorreu um erro para Localizar o Artigo`,
        description: `${e}`,
      };
    }
  }

  static async deleteArticle(articleId) {
    try {
      const resultDelete = await articles.deleteOne({
        _id: ObjectId(articleId),
      });

      if (resultDelete.deletedCount > 0) {
        return { sucess: true };
      } else {
        return {
          error: `Não foi Possivel Deletar o Artigo`,
          description: `Talves o recurso não exista ou ja foi deletado`,
        };
      }
    } catch (e) {
      logger.error(`Não foi possivel deletar o article: ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para Deletar o Artigo`,
        description: `${e}`,
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
