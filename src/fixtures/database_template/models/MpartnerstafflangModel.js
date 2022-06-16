"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mpartnerstafflang",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        partnerstafflangkey: {
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
            defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		languageid: {
			type: Sequelize.TINYINT,
            allowNull: true
		},
		langshortname: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		partnerid:{
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		partnerstaffid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		firstname: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		lastname: {
			type: Sequelize.TEXT,
            allowNull: true,
		},
		staff_title:{
			type: Sequelize.STRING(100),
			allowNull: true
		},
		notes: {
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
        tableName: 'mpartnerstafflang'
	}
};
