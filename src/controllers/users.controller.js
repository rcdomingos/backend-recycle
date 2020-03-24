const bcrypt = require('bcryptjs');
const UsersModels = require('../models/users.models');

const hashPassword = password => bcrypt.hash(password, 10);

class User {
  constructor({ _id, name, email, password } = {}) {
    this.user_id = _id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  toJsonRes() {
    return {
      user_id: this.user_id,
      name: this.name,
      email: this.email
    };
  }
}

class UsersController {
  static async apiGetAllUsers(req, res) {
    const { userList, totalNumUser } = await UsersModels.getAllUsers();

    let response = {
      users: userList,
      total_results: totalNumUser,
      page: 0
    };

    res.json(response);
  }

  static async apiAddUser(req, res) {
    try {
      let errors = {};
      const userFromBody = req.body;

      /**validações do form */
      if (userFromBody.password.length < 8) {
        (errors.status = 'Falha'),
          (errors.message = `A senha precisa ser maior que 8 digitos`);
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      const userInfo = {
        ...userFromBody,
        password: await hashPassword(userFromBody.password)
      };

      const insertResult = await UsersModels.addUser(userInfo);

      if (!insertResult.sucess) {
        (errors.status = 'Falha'),
          (errors.message = 'Erro interno, por favor tente mas tarde');
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json(errors);
        return;
      }

      res.status(201).json({
        status: 'Sucesso',
        auth_token: 'Hash Token'
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `${e}` });
    }
  }

  static async apiGetUsers(req, res) {
    let id_user = req.params.id;

    try {
      const userFromDb = await UsersModels.getUser(id_user);

      const user = new User(userFromDb);

      res.status(200).json({
        status: 'sucess',
        info: user.toJsonRes()
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `${e}` });
    }
  }

  static async apiAlterUser(req, res) {
    try {
      let id_user = req.params.id;
      const userFromBody = req.body;

      const alterResult = await UsersModels.alterUser(id_user, userFromBody);

      if (!alterResult.sucess) {
        (errors.status = 'Falha'),
          (errors.message = 'Erro interno, por favor tente mas tarde');
      }

      res.status(200).json({
        status: 'Sucesso'
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `${e}` });
    }
  }

  static async apiDeleteUser(req, res) {
    let id_user = req.params.id;
    let userInfoDelete = {};

    try {
      (userInfoDelete.status = 'inativa'),
        (userInfoDelete.dateDeleteTS = Date.now());

      const deleteResult = await UsersModels.alterUser(id_user, userInfoDelete);

      if (!deleteResult.sucess) {
        (errors.status = 'Falha'),
          (errors.message = 'Erro interno, por favor tente mas tarde');
      }

      res.status(200).json({
        status: 'Sucesso'
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: `${e}` });
    }
  }
}

module.exports = UsersController;

// db.reci.uses.updadetOne({id:crear},{$set:{ } })
