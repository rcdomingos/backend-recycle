const UsersModels = require('../models/users.models');

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
      const userFromBody = req.body;

      const insertResult = await UsersModels.addUser(userFromBody);

      res.status(201).json({
        info: insertResult
      });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
}

module.exports = UsersController;
