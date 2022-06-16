"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mpartneraccount",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		partneraccountkey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		firstname: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		lastname: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		email_address: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		cityid: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		countryid: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		privacy_policy:{
			type: Sequelize.SMALLINT,
			allowNull: true
		},
		mobile: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		mobile_number: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		phonenumber: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		latitude: {
			type: Sequelize.DECIMAL(12, 9),
            allowNull: true,
		},
		longitude: {
			type: Sequelize.DECIMAL(12, 9),
            allowNull: true,
		},
		teamsize: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		saloonname: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		prefix: {
			type: Sequelize.STRING(10),
			allowNull: true,
		},
		categoryid:{
			type: Sequelize.TEXT('long'),
            allowNull: true,
		},
		language:{
			type: Sequelize.TEXT('long'),
            allowNull: true,
		},
		services: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		hearAboutFresha: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerDistrict: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerAddress: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerPostcode: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerRegion: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		crdocument_url: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		vatdocument_url: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		vatnumber: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerpassword: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		partnerconfirmpassword: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		vatpercent: {
			type: Sequelize.DECIMAL(5,4),
			allowNull: true
		},
		isaccepted: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0
		},
		saloonphone: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		serviceavilable:{
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		saloonemail: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		status: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		bankdocument_url: {
			type: Sequelize.STRING(250),
			allowNull: true
		},
		bankaccountnumber: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		bankaccountname: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		bankname: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		bankiban: {
			type: Sequelize.STRING(256),
			allowNull: true
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
		description: {
			type: Sequelize.STRING(2048),
			allowNull: true
		},
		logo_path: {
			type: Sequelize.STRING(2048),
			allowNull: true
		},
		isVAT: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
	},
	options: {
		timestamps: false,
		tableName: "mpartneraccount"
	}
};
