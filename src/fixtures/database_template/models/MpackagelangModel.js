"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mpackagelang",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        packagelangkey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		packageid: {
			type: Sequelize.SMALLINT,
            allowNull: true
		},
		languageid: {
			type: Sequelize.TINYINT,
            allowNull: true
		},
		langshortname: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		packagename: {
			type: Sequelize.STRING(256),
            allowNull: true
		},
		package_description:{
			type: Sequelize.TEXT('long'),
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
        tableName: 'mpackagelang'
	}
};
