"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "tbookingsublist",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        bookingsublistkey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		bookingid: {
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		serviceid: {
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		servicename: {
			type: Sequelize.STRING(250),
            allowNull: false,
		},
		servicecost: {
			type: Sequelize.DECIMAL(12, 3),
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
        tableName: 'tbookingsublist'
	}
};
