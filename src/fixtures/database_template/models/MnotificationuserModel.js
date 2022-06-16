"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mnotificationuser",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        notificationuserkey: { // Default Unique Key for Booking
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		notificationid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		userid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		customerid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		isdelivered: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
		},
		isviewed: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
		},
		usertype: {
			type: Sequelize.STRING(100),
			allowNull: true,
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
        tableName: 'mnotificationuser'
	}
};
