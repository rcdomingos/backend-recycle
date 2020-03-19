let users;

class UsersModels {
  /**Metodo para conecatar na coleção usuario */
  static async conectCollection(conn) {
    if (users) {
      return;
    }

    try {
      users = await conn.collection('users');

      console.log(`Conectado na coleção Users`);
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
  /**Metodo para adicionar o usuario no banco */
  static async addUser(infoUsers) {
    try {
      await users.insertOne(infoUsers);

      return { sucess: true };
    } catch (e) {
      console.error(`Ocorreu para cadastrar o usuario, ${e} `);
      return e;
    }
  }
}

module.exports = UsersModels;
