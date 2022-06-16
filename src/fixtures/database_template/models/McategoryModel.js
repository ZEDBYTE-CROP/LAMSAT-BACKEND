"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mcategory",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        categorykey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		image_url:{
			type: Sequelize.STRING(250),
			allowNull: true
		},
		photopath:{
			type: Sequelize.STRING(250),
            allowNull: true
		},
		color:{
			type: Sequelize.STRING(12),
            allowNull: true
		},
		vendorid: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0
        },
		is_admin: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0
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
		},
		permission:{
			type: Sequelize.STRING(250),
            allowNull: true
		},
	},
	options: {
        timestamps: false,
        tableName: 'mcategory'
	}
};
