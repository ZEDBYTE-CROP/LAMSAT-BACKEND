"use strict";

const { STRING } = require("sequelize");
const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mservice",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        sevicekey: { // Default Unique Key for Country
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
		admincategoryid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		availability: {
			type: Sequelize.SMALLINT,
			allowNull: true
		},
		tax: {
			type: Sequelize.DECIMAL(12, 3),
			allowNull: true
		},
		service_staff:{
			type: Sequelize.TEXT,
			allowNull: true,
		},
		image_url:{
			type: Sequelize.STRING(250),
			allowNull: true
		},
		photopath: {
			type: Sequelize.STRING(250),
			allowNull: true
		} ,
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
		},
		permission: {
			type: Sequelize.STRING(250),
			allowNull: true
		} ,
	},
	options: {
        timestamps: false,
        tableName: 'mservice'
	}
};
