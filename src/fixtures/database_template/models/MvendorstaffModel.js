"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mvendorstaff",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        vendorstaffkey: { // Default Unique Key for Staff
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendorid:{
			type: Sequelize.INTEGER,
            allowNull: false,
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
		email: {
			type: Sequelize.STRING(150),
            allowNull: true
		},
		contactnumber: {
			type: Sequelize.STRING(15),
            allowNull: true
		},
		employee_startdate: {
			type: Sequelize.STRING(100),
            allowNull: false
		},
		employee_enddate: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		serviceid: {
			type:Sequelize.TEXT,
			allowNull: true
		},
		image_url:{
			type: Sequelize.STRING(250),
			allowNull: true
		},
		photopath:{
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
		},
		isnopref: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0
        },
	},
	options: {
        timestamps: false,
        tableName: 'mvendorstaff'
	}
};
