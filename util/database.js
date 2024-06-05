const Sequelize = require('sequelize');
const sequelize = new Sequelize('node-complete', 'root', 'Panu@2003', {dialect: 'mysql', host: 'localhost'});

module.exports = sequelize;