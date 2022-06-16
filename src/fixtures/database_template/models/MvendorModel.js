"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mvendor",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },
        vendorkey: {
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
            defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendornumber: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},
		isfeatured: {
			type: Sequelize.TINYINT,//whether the client is paid for preference
			allowNull: false,
		},
		firstname: {
			type: Sequelize.STRING(150),
			allowNull: false,
		},
		lastname: {
			type: Sequelize.STRING(150),
			allowNull: false,
		},
		username: {
			type: Sequelize.STRING(150),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(200),
            allowNull: true,
		},
		password: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		latitude: {
			type: Sequelize.DECIMAL(12, 9),
            allowNull: true,
		},
		longitude: {
			type: Sequelize.DECIMAL(12, 9),
            allowNull: true,
		},
		countryid: {
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		cityid: {
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		areaid: {
			type: Sequelize.SMALLINT,
            allowNull: true,
		},
		commissiontype: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		prefix: {
			type: Sequelize.STRING(10),
			allowNull: true,
		},
		contactnumber: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		mobilenumber: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		sortorder: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		vat: {
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		categoryid:{
			type: Sequelize.TEXT('long'),
            allowNull: true,
		},
		vendorstatus: {
			type: Sequelize.BOOLEAN,
            allowNull: true,
		},
		servicelocation: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		service_available:{
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		vatnumber: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		gender: {
			type: Sequelize.TEXT('long'),
			allowNull: true,
		},
		paymentoption: {
			type: Sequelize.TEXT('long'),
			allowNull: true,
		},
		usertypeid: {
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		socialtypeid: {
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		socialkey: {
			type: Sequelize.STRING(256),
			allowNull: true,
		},
		devicetype: {
			type: Sequelize.STRING(45),
            allowNull: true,
		},
		devicetoken: {
			type: Sequelize.STRING(45),
            allowNull: true,
		},
		image_url:{
			type: Sequelize.STRING(250),
			allowNull: true
		},
		photopath: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		vatdocument_url: {
			type: Sequelize.STRING(250),
			allowNull: true
		},
		crdocument_url: {
			type: Sequelize.STRING(250),
			allowNull: true
		},
		ratingavg: {
			type: Sequelize.DECIMAL(12, 2),
			allowNull: true,
		},
		ratingcount: {
			type: Sequelize.INTEGER,
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
		saloonemail: {
			type: Sequelize.STRING(256),
			allowNull: true
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
		bankidbic: {
			type: Sequelize.STRING(256),
			allowNull: true
		},
		status: {
			type: Sequelize.TINYINT,
            allowNull: true,
            defaultValue: 1
		},
		isstaffaccepted: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		isprofileaccepted: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		isserviceaccepted: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		otp: {
			type: Sequelize.STRING(256),
			allowNull: true,
		},
		isotpverified: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		isverifiedemail: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 1
		},
		emailverificationkey: {
			type: Sequelize.STRING(256),
			allowNull: true,
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
        tableName: 'mvendor'
	}
};
