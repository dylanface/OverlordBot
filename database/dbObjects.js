const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('../models/Users')(sequelize, Sequelize.DataTypes);

<<<<<<< Updated upstream
module.exports =  Users;
=======
module.exports = Users;
>>>>>>> Stashed changes
