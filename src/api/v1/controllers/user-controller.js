const userData = require('../queries/user-query');

class UserController {
  async getUsers(req, res, next) {
    try {
      const users = await userData.getAllUsers();

      return res.json(users);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
