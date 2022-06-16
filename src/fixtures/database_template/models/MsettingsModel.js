"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "msettings",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
		},
        
		settingskey: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		settingsname: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		settingsvalue: {
			type: Sequelize.STRING(255),
			allowNull: true
		},
		version: {
			type: Sequelize.DATE,
			allowNull: true
		}
	},
	options: {
		timestamps: false,
		tableName: "msettings"
	}
};
