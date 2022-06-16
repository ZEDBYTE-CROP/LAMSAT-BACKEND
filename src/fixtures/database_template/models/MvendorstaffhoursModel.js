"use strict";

const Sequelize = require("sequelize");
// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mvendorstaffhours",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

    	vendorstaffhourskey: { // Default Unique Key for Staff
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendorid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		vendorstaffid: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		slotday: {
			type: Sequelize.STRING(250),
			allowNull: false,
		},
		slotstarttime: {
			type: Sequelize.TIME,
			allowNull: false
		},
		slotendtime: {
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
		slotrepeat: {
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
        tableName: 'mvendorstaffhours'
	}
};
