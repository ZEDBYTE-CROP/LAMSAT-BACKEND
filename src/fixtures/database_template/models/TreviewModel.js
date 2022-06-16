"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "treview",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        reviewkey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		userid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		name: {
			type: Sequelize.STRING(150),
            allowNull: true
		},
		email: {
			type: Sequelize.STRING(150),
            allowNull: true
		},
		contactnumber: {
			type: Sequelize.STRING(150),
            allowNull: true
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		serviceid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		rating: {
			type: Sequelize.DECIMAL(12,3),
            allowNull: true
		},
		review: {
			type: Sequelize.TEXT,
            allowNull: true
		},
		isreview: {
			type: Sequelize.SMALLINT,
			allowNull: true,
			defaultValue: 0
		},
		bookingid: {
			type: Sequelize.INTEGER,
            allowNull: true
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
        tableName: 'treview'
	}
};
