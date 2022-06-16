"use strict";

const { STRING } = require("sequelize");
const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mpackage",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        packagekey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		categoryid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		package_available:{
			type: Sequelize.TINYINT,
            allowNull: true
		},
		service_id:{
			type: Sequelize.STRING(100),
            allowNull: false,
		},
		service_details:{
			type: Sequelize.TEXT('long'),
			allowNull: true
		},
		packagecost: {
			type: Sequelize.DECIMAL(12,3),
            allowNull: true
		},
		photopath: {
			type: Sequelize.TEXT('long'),
			allowNull: true
		},
		image_url:{
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
        tableName: 'mpackage'
	}
};
