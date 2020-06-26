const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsersModels = require('../models/users.models');
const logger = require('../../utils/winston');

/**função para criptografar a senha do usuario */
const hashPassword = (password) => bcrypt.hash(password, 10);

class User {
  constructor({ _id, name, email, password } = {}) {
    this.userId = _id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  toJsonRes() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
    };
  }

  async comparePassword(passFromForm) {
    return await bcrypt.compare(passFromForm, this.password);
  }

  createJwsToken() {
    return jwt.sign({ ...this.toJsonRes() }, process.env.PRIVATE_KEY, {
      expiresIn: '365d',
    });
  }

  // decodedToken(jwtoken) {
  //   return jwt.verify(jwtoken, process.env.PRIVATE_KEY, (error, res) => {});
  // }
}
/**
 * Classe UserController com as chamadas para os models de usuario
 **/
class UsersController {
  /**
   * Metodo para listar todos os usuarios cadastrados
   */
  static async apiGetAllUsers(req, res) {
    try {
      let page = parseInt(req.query.page || 1);
      let limit = parseInt(req.query.limit || 10);

      const { userList, totalNumUser, count } = await UsersModels.getAllUsers(
        page,
        limit
      );

      let response = {
        results: userList,
        total_results: totalNumUser,
        page,
        count,
        limit,
      };

      res.json(response);
    } catch (e) {
      logger.error(`${e}`);
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo utilizado para adicionar um novo usuario
   **/
  static async apiAddUser(req, res) {
    try {
      let errors = {};
      let userFromBody = req.body;

      /**validações do form */
      if (userFromBody.password.length < 1) {
        errors.code = 400;
        errors.message = `Informações fora do padrão`;
        errors.description = `A senha precisa ser maior que 1 digito`;
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const userInfo = {
        ...userFromBody,
        password: await hashPassword(userFromBody.password),
        isCollector: false,
        isAdmin: false,
        createdDate: new Date(),
      };

      const insertResult = await UsersModels.addUser(userInfo);

      if (insertResult.error) {
        res.status(400).json({
          code: 400,
          message: `${insertResult.error}`,
          description: `${insertResult.description}`,
        });
        return;
      }

      res.status(201).json({
        code: 201,
        message: `Sucesso`,
        description: `Cadastro realizado com sucesso`,
      });
    } catch (e) {
      logger.error(`${e}`);
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**Metodo para listar um usuario especifico  */
  static async apiGetUser(req, res) {
    try {
      let userId = req.params.id;

      // console.log(req.userJwt.user_id);
      if (req.userJwt.userId != userId) {
        res.status(401).json({
          code: 401,
          message: 'Não Autorizada',
          description: `As informações de autenticação necessárias estão ausentes ou não são válidas para o recurso.`,
        });
        return;
      }

      const resultFindUser = await UsersModels.getUser(userId);

      if (resultFindUser == null) {
        res.status(404).json({
          code: 404,
          message: 'O recurso solicitado não existe',
          description:
            'O recurso solicitado não foi localizado em nossa base de dados',
        });
        return;
      }

      if (resultFindUser.error) {
        res.status(500).json({
          code: 500,
          message: resultFindUser.error,
          description: resultFindUser.description,
        });
        return;
      }

      res.status(200).json(resultFindUser);
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar um usuario especifico
   */
  static async apiAlterUser(req, res) {
    try {
      let userId = req.params.id;
      let userFromBody = req.body;

      const alterResult = await UsersModels.alterUser(userId, userFromBody);

      if (alterResult === null) {
        res.status(404).json({
          code: 404,
          message: 'O recurso solicitado não existe',
          description: 'O recurso solicitado não existe',
        });
        return;
      }

      if (alterResult.error) {
        res.status(400).json({
          code: 400,
          message: `${alterResult.error}`,
          description: `${alterResult.description}`,
        });
        return;
      }

      res.status(202).json(alterResult);
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para deletar um usuario
   */
  static async apiDeleteUser(req, res) {
    let userId = req.params.id;
    let userInfoDelete = {};
    let errors = {};

    try {
      userInfoDelete.status = 'inativa';
      userInfoDelete.deletedDateTS = Date.now();

      const deleteResult = await UsersModels.alterUser(userId, userInfoDelete);

      if (!deleteResult.sucess) {
        errors.status = 'Falha';
        errors.message = 'Erro interno, por favor tente mas tarde';
      }

      res.status(204).json({
        status: 'Sucesso',
      });
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }
  //TODO: incluir as regras e validações do email
  /**
   * Metodo para gerar um Token de autenticação para o client
   * */
  static async apiCreateAuth(req, res) {
    try {
      let errors = {};
      const { email, password } = req.body;

      /**validações do form */
      if (email.length < 1) {
        errors = [
          {
            code: 400,
            message: `Algumas informações enviadas estão fora do padrão`,
            description: `O email digitado não esta de acordo com os padrões`,
          },
        ];
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const userFromDb = await UsersModels.getUserFromEmail(email);

      if (!userFromDb) {
        res.status(401).json({
          code: 401001,
          message: `E-mail não locarizado`,
          description: `Verifique se o email digitado esta correto`,
        });
        return;
      }

      const user = new User(userFromDb);

      /**validar a senha digitada com a senha do banco */
      const login = await user.comparePassword(password); //return true or false

      if (!login) {
        res.status(401).json({
          code: 401002,
          message: `Senha não confere`,
          description: `Verifique se a senha digitada esta correta`,
        });
        return;
      }

      // const resultCreateJwsToken = await UsersModels.addSession(
      //   user.user_id,
      //   user.createJwsToken()
      // );

      // if (!resultCreateJwsToken.sucess) {
      //   errors.status = 'Falha';
      //   errors.message = resultCreateJwsToken.error;
      // }

      // if (Object.keys(errors).length > 0) {
      //   res.status(400).json(errors);
      //   return;
      // }

      res.status(201).json({
        code: 201,
        // user_info: user.toJsonRes(),
        auth_token: user.createJwsToken(),
      });
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: `Erro interno, por favor tente mas tarde`,
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para adicionar o endereço do usuario
   */
  static async apiAddUserAddress(req, res) {
    try {
      const userId = req.params.id;
      const userAddress = req.body;

      const addressResult = await UsersModels.addUserAdress(
        userId,
        userAddress
      );

      if (addressResult.error) {
        res.status(500).json({
          code: 500,
          message: 'Erro interno, por favor tente mas tarde',
          description: addressResult.error,
        });
        return;
      }

      res.status(201).json(addressResult.addresses);
    } catch (e) {
      res.status(500).json({
        code: 500,
        message: 'Erro interno, por favor tente mas tarde',
        description: `${e}`,
      });
    }
  }

  /**
   *  Metodo para listar todos os endereços dos usuario
   */
  static async apiGetAllUserAddress(req, res) {
    try {
      const userId = req.params.id;
      const codAddress = req.params.codAddress;

      const addresses = await UsersModels.getUserAdress(userId, codAddress);

      res.status(200).json(addresses);
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: 'Erro interno, por favor tente mas tarde',
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para alterar o endereço infomardo
   */
  static async apiAlterUserAddress(req, res) {
    try {
      if (req.params.codAddress == 0) {
        res.status(400).json({
          code: 400,
          message: 'URI incompleta',
          description:
            'É necessario informar o codigo do endereço diferente de 0',
        });
        return;
      }

      const userId = req.params.id;
      const codAddress = req.params.codAddress;
      const userData = req.body;

      const result = await UsersModels.alterAddress(
        userId,
        codAddress,
        userData
      );

      if (result.error) {
        res.status(404).json({
          code: 404,
          message: result.error,
          description: `${result.description}`,
        });
        return;
      }

      res.status(201).json(result.addresses);
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: 'Erro interno, por favor tente mas tarde',
        description: `${e}`,
      });
    }
  }

  /**
   * Metodo para deletar o endereço do usuario
   */
  static async apiDeleteUserAddress(req, res) {
    try {
      if (req.params.codAddress == 0) {
        res.status(400).json({
          code: 400,
          message: 'URI incompleta',
          description:
            'É necessario informar o codigo do endereço diferente de 0',
        });
        return;
      }

      const userId = req.params.id;
      const codAddress = req.params.codAddress;

      const resultDelete = await UsersModels.deleteUserAddress(
        userId,
        codAddress
      );

      if (resultDelete == 0) {
        res.status(404).json({
          code: 404,
          message: 'O recurso solicitado não existe',
          description: 'O recurso solicitado não existe',
        });
        return;
      }

      res.status(204).send();
    } catch (e) {
      logger.error(e, { label: 'Express' });
      res.status(500).json({
        code: 500,
        message: 'Erro interno, por favor tente mas tarde',
        description: `${e}`,
      });
    }
  }
}

module.exports = { UsersController, User };
