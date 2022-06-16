"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mpartnerhours",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

    	partnerhourskey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		partnerid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		days: {
			type: Sequelize.STRING(20),
			allowNull: false,
		},
		starttime: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		endtime: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		partnerstatus: {
			type: Sequelize.TINYINT,
			allowNull: false,
		},
		status: {
			type: Sequelize.INTEGER,
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
			type: Sequelize.DATE(4),
			allowNull: true
		},
		version: {
			type: Sequelize.DATE,
			allowNull: true
		}
	},
	options: {
        timestamps: false,
        tableName: 'mpartnerhours'
	}
};
