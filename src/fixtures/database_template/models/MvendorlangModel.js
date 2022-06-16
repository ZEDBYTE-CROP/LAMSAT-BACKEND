"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mvendorlang",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        vendorlangkey: {
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
            defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		languageid: {
			type: Sequelize.TINYINT,
            allowNull: true
		},
		languageshortname: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		vendorname: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		vendordescription: {
			type: Sequelize.TEXT,
            allowNull: true,
		},
		vendoraddress: {
			type: Sequelize.TEXT,
            allowNull: true,
		},
		status: {
			type: Sequelize.TINYINT,
            allowNull: true,
            defaultValue: 1
        },
		created_by: {
			type: Sequelize.INTEGER,
            allowNull: true,
        },

		created_at: {
			type: Sequelize.DATE,
			allowNull: true,
        },

		updated_by: {
			type: Sequelize.INTEGER,
            allowNull: true,
        },

		updated_at: {
			type: Sequelize.DATE,
			allowNull: true
		}

	},
	options: {
        timestamps: false,
        tableName: 'mvendorlang'
	}
};
