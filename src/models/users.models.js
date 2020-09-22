const ObjectId = require('mongodb').ObjectID;
const logger = require('../../utils/winston');

const dataCleaning = require('../../utils/dataCleaning');

let users;
let sessions;

class UsersModels {
  /**
   * Metodo para conectar na coleção usuario
   **/
  static async conectCollection(conn) {
    if (users && sessions) {
      return;
    }

    try {
      users = await conn.collection('users');
      logger.info(`Conectado na coleção users`, { label: 'MongoDB' });

      // sessions = await conn.collection('sessions');
      // logger.info(`Conectado na coleção sessions`, { label: 'MongoDB' });
    } catch (e) {
      logger.error(
        `Falha para conectar com a coleção users ou sessions: ${e}`,
        { label: 'MongoDB' }
      );
    }
  }
  /**
   * Metodo para Listar todos os usuarios do banco
   */
  static async getAllUsers(page, limit, profile) {
    let query = {};
    let cursor;
    let pagination = page == 0 ? 0 : page - 1;
    let skips = limit * pagination;
    let project = {};
    let mysort = { name: 1 };

    console.log(profile);

    switch (profile) {
      case 'coletor':
        query = { isCollector: true };
        break;
      case 'gerador':
        query = { isCollector: false };
        break;
      case 'admin':
        query = { isAdmin: true };
        break;
      default:
        query = {};
        break;
    }

    try {
      //listar todos os usuarios
      cursor = await users.find(query).sort(mysort).skip(skips).limit(limit);
    } catch (e) {
      logger.error(`Não foi possivel realizar o comando find: ${e}`, {
        label: 'MongoDb',
      });
      return { userList: [], totalNumUser: 0, count: 0 };
    }

    try {
      const userList = await cursor.toArray();
      const totalNumUser = await users.countDocuments(query);
      const count = await userList.length;

      return { userList, totalNumUser, count };
    } catch (e) {
      logger.error(`Não foi possivel converter os dados: ${e}`, {
        label: 'MongoDb',
      });
      return { userList: [], totalNumUser: 0, count: 0 };
    }
  }

  /**
   * Metodo para inserir o usuario no banco
   **/
  static async addUser(infoUsers) {
    try {
      await users.insertOne(infoUsers);

      return { sucess: true };
    } catch (e) {
      logger.error(`Erro ao executar o comando insertOne, ${e}`, {
        label: 'MongoDb',
      });

      /** erro se o email ja existir */
      if (String(e).startsWith('MongoError: E11000 duplicate key error')) {
        return {
          error: 'Ja existe um usuario com o email informado.',
          description: 'O email utilizado ja esta cadastrado na base de dados',
        };
      }
      return {
        error: `Ocorreu um erro para Cadastrar o usuario`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para buscar um usuario pelo ID no banco
   **/
  static async getUser(userId) {
    try {
      const resultFind = await users
        .find({ _id: ObjectId(userId) })
        .project({ password: 0 })
        .toArray();

      return resultFind[0];
    } catch (e) {
      logger.error(`${e}`, { label: 'MongoDb' });
      return {
        error: `Ocorreu um erro para buscar o usuario`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo pala buscar um usuario pelo email no banco
   **/
  static async getUserFromEmail(email) {
    try {
      return users.findOne({ email: email });
    } catch (e) {
      logger.error(`Erro ao executar o comando findOne, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para buscar o usuario`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para alterar as informações so usuario no banco
   */
  static async alterUser(userId, userInfo) {
    try {
      const resultupdate = await users.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: userInfo },
        {
          returnNewDocument: true,
          returnOriginal: false,
          projection: { addresses: 0 },
        }
      );

      return resultupdate.value;
    } catch (e) {
      logger.error(`Erro ao executar o comando updateOne, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para alterar o usuario`,
        description: `${e}`,
      };
    }
  }

  /**metodo para inserir o token de acesso na tabela sessim */
  static async addSession(userId, jwt) {
    try {
      let infoSession = {
        user_id: userId,
        jwt: jwt,
        created_at: new Date(),
      };

      const resultUpdate = await sessions.updateOne(
        { user_id: userId },
        { $set: infoSession },
        { upsert: true }
      );
      // if (!resultUpdate.modifiedCount || resultUpdate.upsertedCount ) {
      //   return { error: 'Não foi possivel alterar os dados' };
      // }
      return { sucess: true };
    } catch (e) {
      logger.error(`Erro ao executar o comando updateOne, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para criar o Jwt`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para adicionar o endereço no banco
   */
  static async addUserAdress(userId, userAddress) {
    //gerar o codigo do endereço
    let newCodAddress = parseInt(Date.now().toString().substr(-6));

    try {
      const address = {
        codAddress: newCodAddress,
        ...userAddress,
      };

      const userAddressUpdate = await users.updateOne(
        { _id: ObjectId(userId) },
        { $push: { addresses: address } }
      );

      if (userAddressUpdate.modifiedCount || userAddressUpdate.upsertedCount) {
        return await this.getUserAdress(userId, newCodAddress);
      } else {
        return { error: 'Não foi possivel incluir o endereço do usuario' };
      }
    } catch (e) {
      logger.error(`Erro ao executar o comando updateOne, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para cadastrar o endereço`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para buscar os endereços cadastrados do usuario no banco
   */
  static async getUserAdress(userId, codAdress = 0) {
    let icodAdress = parseInt(codAdress);
    let resultQuery;
    try {
      if (codAdress == 0) {
        resultQuery = await users
          .find({ _id: ObjectId(userId) })
          .project({ _id: 0, addresses: 1 });
      } else {
        resultQuery = await users.aggregate([
          {
            $match: {
              _id: ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: '$addresses',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              'addresses.codAddress': icodAdress,
            },
          },
          {
            $project: {
              _id: 0,
              addresses: 1,
            },
          },
        ]);
      }

      var result = await resultQuery.toArray();

      return result[0];
    } catch (e) {
      logger.error(`Erro ao executar o comando aggregate, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para listar os endereços`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para alterar o endereço do usuario no banco
   */
  static async alterAddress(userId, codAdress, dataAdress) {
    let addresses = {};
    let icodAdress = parseInt(codAdress);

    try {
      addresses = {
        'addresses.$[address].street': dataAdress.street || undefined,
        'addresses.$[address].number': dataAdress.number || undefined,
        'addresses.$[address].neighborhood':
          dataAdress.neighborhood || undefined,
        'addresses.$[address].complement': dataAdress.complement || undefined,
        'addresses.$[address].city': dataAdress.city || undefined,
        'addresses.$[address].state': dataAdress.state || undefined,
        'addresses.$[address].zipCode': dataAdress.zipCode || undefined,
      };
      //remover os campos undefined para não ficar null
      addresses = await dataCleaning(addresses);
    } catch (e) {
      {
        logger.error(`Erro ao montar os dados, ${e}`, { label: 'MongoDb' });
        return {
          error: `Ocorreu um erro para normalizar os dados para alteração.`,
          description: `${e}`,
        };
      }
    }

    try {
      const resultUpdate = await users.updateOne(
        { _id: ObjectId(userId) },
        { $set: addresses },
        {
          arrayFilters: [{ 'address.codAddress': icodAdress }],
          upsert: true,
          projection: { addresses: 1 },
        }
      );

      //retornar o endereço alterado
      return await this.getUserAdress(userId, icodAdress);
    } catch (e) {
      logger.error(`Erro ao executar o comando aggregate, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para listar os endereços`,
        description: `${e}`,
      };
    }
  }

  /**
   * Metodo para deletar o endereço do banco
   */
  static async deleteUserAddress(userId, codAdress) {
    try {
      const icodAdress = parseInt(codAdress);

      const resultUpdate = await users.updateOne(
        { _id: ObjectId(userId) },
        { $pull: { addresses: { codAddress: icodAdress } } }
      );

      return resultUpdate.modifiedCount;
    } catch (e) {
      logger.error(`Erro ao executar o comando delete, ${e}`, {
        label: 'MongoDb',
      });
      return {
        error: `Ocorreu um erro para excluir o endereço`,
        description: `${e}`,
      };
    }
  }
}

module.exports = UsersModels;
