"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mtransaction",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        transactionkey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		customerid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		bookingid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		checkoutid: {
			type: Sequelize.STRING(250),
			allowNull: true
		},
		transactioncode: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		transactionmode: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		transactionstatus: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1
		},
		content: {
			type: Sequelize.STRING(250),
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
        tableName: 'mtransaction'
	}
};
