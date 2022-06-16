"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types



module.exports = {
	name: "mtoken",
	define: {
		id: { // id must always exist
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},

		token: {
			type: Sequelize.TEXT,
			allowNull: false
		},

		userId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},

		login_type: {
			type: Sequelize.STRING(100),
			allowNull: false
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: true,
        },
	},
	options: {
		timestamps: false
	}
};
