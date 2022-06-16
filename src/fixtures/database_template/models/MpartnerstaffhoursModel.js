"use strict";

const Sequelize = require("sequelize");
const TusedvoucherModel = require("./TusedvoucherModel");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mpartnerstaffhours",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

    	partnerstaffhourskey: { // Default Unique Key for Staff
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		partnerid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		partnerstaffid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		partnerday: {
			type: Sequelize.STRING(250),
			allowNull: false,
		},
		partnerstarttime: {
			type: Sequelize.TIME,
			allowNull: false
		},
		partnerendtime: {
			type: Sequelize.TIME,
			allowNull: false
		},
		firstslot: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		secondslot: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		partnerrepeat: {
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
        tableName: 'mpartnerstaffhours'
	}
};
