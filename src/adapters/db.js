var Sequelize = require("sequelize");
const Config = require("../../config");
const db = {}

let config = Config.get('/mssqlEnvironment');	
//DB CONNECTION
var sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  dialectOptions: {
    options: {
      instanceName: config.instancename,
      encrypt: false,
      useUTC: false,
          dateFirst: 1
    },
    requestTimeout: 30000
  }, 
  operatorsAliases: false,
  port: config.port,   
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000,
  }
});

sequelize.authenticate().then(function(err) {
    if (err) console.log('Unable to connect to the MSSQL database:', err);
    console.log('Connection has been established successfully.');
});


db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db

//module.exports.sequelize = sequelize;