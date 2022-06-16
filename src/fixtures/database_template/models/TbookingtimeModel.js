"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "tbookingtime",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        bookingid: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		service_date: {
			type: Sequelize.STRING(250),
            allowNull: true
		},
		service_time: {
			type: Sequelize.TIME,
            allowNull: true
		},
		staffid: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		service_id: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		service_details:{
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
		},
		staff_details:{
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		booking_status: {
			type: Sequelize.TINYINT,
			allowNull: true ,
			defaultValue: 2
		},
		payment_method: {
			type: Sequelize.TINYINT,
            allowNull: true
		},
		payment_status: {
			type: Sequelize.TINYINT,
			allowNull: true ,
			defaultValue: 0
		},
	},
	options: {
        timestamps: false,
        tableName: 'tbookingtime'
	}
};
