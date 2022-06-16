"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mpermission",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        permissionkey: {
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
            defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		roleid: {
			type: Sequelize.INTEGER,
            allowNull: true,
		},
		moduleid: {
			type: Sequelize.INTEGER,
            allowNull: true,
		},
		access: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		read: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		create: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		update: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		delete: {
			type: Sequelize.STRING(100),
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
		},
		version: {
			type: Sequelize.DATE,
			allowNull: true
		}

	},
	options: {
        timestamps: false,
        tableName: 'mpermission'
	}
};
