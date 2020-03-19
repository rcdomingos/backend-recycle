let users;

class UsersModels {
  static async conectCollection(conn) {
    if (users) {
      return;
    }

    try {
      users = await conn.collection('userss');

      console.log(`Conectado na coleção Users`);
    } catch (e) {
      console.error(`Falha para conectar com a coleção users: ${e} `);
    }
  }
}

module.exports = UsersModels;
