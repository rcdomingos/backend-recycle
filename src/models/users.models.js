const ObjectId = require('mongodb').ObjectID;

let users;
let sessions;

class UsersModels {
  /**Metodo para conecatar na coleção usuario */
  static async conectCollection(conn) {
    if (users && sessions) {
      return;
    }

    try {
      users = await conn.collection('users');
      sessions = await conn.collection('sessions');

      console.log(`Conectado na coleção Users e Sessions`);
    } catch (e) {
      console.error(`Falha para conectar com a coleção users: ${e} `);
    }
  }
  /**Metodo para Listar todos os usuarios do banco */
  static async getAllUsers({ page = 0, userPerPage = 20 } = {}) {
    let query = {};
    let cursor;

    try {
      cursor = await users.find({});
    } catch (e) {
      console.error(`Não foi possivel realizar o comando find: ${e}`);
      return { userList: [], totalNumUser: 0 };
    }

    try {
      const userList = await cursor.toArray();
      const totalNumUser = page === 0 ? await users.countDocuments(query) : 0;

      return { userList, totalNumUser };
    } catch (e) {
      console.error('Não foi possivel converter os dados ');
      return { userList: [], totalNumUser: 0 };
    }
  }

  /**Metodo para inserir o usuario no banco */
  static async addUser(infoUsers) {
    try {
      await users.insertOne(infoUsers);

      return { sucess: true };
    } catch (e) {
      console.error(`Ocorreu para cadastrar o usuario, ${e} `);
      return {
        error: `Ocorreu um erro para buscar o usuario`,
        description: `${e} `
      };
    }
  }

  /**metodo para buscar um usuario pelo ID no banco */
  static async getUser(idUser) {
    try {
      return await users.findOne({ _id: ObjectId(idUser) });
    } catch (e) {
      console.error(`Ocorreu um erro para buscar o usuario, ${e} `);
      return {
        error: `Ocorreu um erro para buscar o usuario`,
        description: `${e} `
      };
    }
  }

  /**Metodo pala buscar um usuario pelo email no banco */
  static async getUserFromEmail(email) {
    try {
      return users.findOne({ email: email });
    } catch (e) {
      console.error(`Ocorreu um erro para buscar o usuario, ${e} `);
      return e;
    }
  }

  /**metodo para alterar o usuario no banco */
  static async alterUser(idUser, infoUsers) {
    try {
      const resultupdate = await users.updateOne(
        { _id: ObjectId(idUser) },
        { $set: infoUsers }
      );
      // console.log(resultupdate);
      // return { sucess: true };

      return resultupdate;
    } catch (e) {
      console.error(`Ocorreu um erro para alterar o usuario , ${e} `);
      return e;
    }
  }

  /**metodo para inserir o token de acesso na tabela sessim */
  static async addSession(idUser, jwt) {
    try {
      let infoSession = {
        user_id: idUser,
        jwt: jwt,
        created_at: new Date()
      };

      const resultUpdate = await sessions.updateOne(
        { user_id: idUser },
        { $set: infoSession },
        { upsert: true }
      );
      // if (!resultUpdate.modifiedCount || resultUpdate.upsertedCount ) {
      //   return { error: 'Não foi possivel alterar os dados' };
      // }
      return { sucess: true };
    } catch (e) {
      console.error(`Ocorreu um erro para criar a session, ${e} `);
      return { error: `Ocorreu um erro para criar a session, ${e} ` };
    }
  }
}

module.exports = UsersModels;
