"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "tbooking",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        bookingkey: { // Default Unique Key for Booking
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		bookingno: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		vendor_details:{
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		customerid: {
			type: Sequelize.INTEGER,
            allowNull: false,
		},
		customerdetails:{
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		categoryid: {
			type: Sequelize.STRING(100),
            allowNull: false,
		},
		category_details:{
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		service_date: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		service_time: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		subtotal: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		mincartvalue: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		voucher_code: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		voucher_type:{
			type: Sequelize.INTEGER,
            allowNull: true
		},
		discountvalue: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		actualrate: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		servicerate: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		vat_percent: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		vat_amount: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		totalcost: {
			type: Sequelize.DECIMAL(12, 3),
            allowNull: true
		},
		staffid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		staff_details: {
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		serviceid: {
			type: Sequelize.STRING(50),
            allowNull: true
		},
		service_details:{
			type: Sequelize.TEXT('long'),
            allowNull: true
		},
		booking_status: {
			type: Sequelize.INTEGER,
			allowNull: true ,
			defaultValue: 2
		},
		payment_method: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		payment_status: {
			type: Sequelize.TINYINT,
			allowNull: true ,
			defaultValue: 0
		},
		devicetype: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		devicetoken: {
			type: Sequelize.STRING(100),
            allowNull: true
		},
		location: {
			type: Sequelize.STRING(80),
            allowNull: true
		},
		status: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1
		},
		canceledbyadmin: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1
		},
		isreviewed: {
			type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
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
        tableName: 'tbooking'
	}
};
