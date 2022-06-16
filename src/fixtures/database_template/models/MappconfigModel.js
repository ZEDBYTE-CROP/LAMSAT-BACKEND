"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types

module.exports = {
	name: "mappconfig",
	define: {
		id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,			
        },
        
        appconfigkey: {
			type: Sequelize.UUID, // Uses uuidv4 by default (default value is recommended)
            defaultValue: Sequelize.UUIDV4,		
			allowNull: true,
		},
		appname: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		appdescription: {
			type: Sequelize.TEXT,
            allowNull: true,
		},
        		
		metakeyword: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		metadescription: {
			type: Sequelize.TEXT,
            allowNull: true,
		},
		email: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		contactnumber: {
			type: Sequelize.STRING(50),
            allowNull: true,
		},
		playstore_link: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		appstore_link: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		contactaddress: {
			type: Sequelize.TEXT,
			allowNull: true,
		},		
		mapkey: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},		
		site_copyright: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},		
		hour_format: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		currency_code: {
			type: Sequelize.STRING(50),
            allowNull: true,
		},
		currency_decimalplace: {
			type: Sequelize.SMALLINT,
            allowNull: true,
		},
		site_logo: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		site_logo_url: {
			type: Sequelize.TEXT,
			allowNull: true,
		},	
		time_zone: {
			type: Sequelize.STRING(200),
            allowNull: true,
		},
		vouchercode_digit: {
			type: Sequelize.INTEGER,
            allowNull: true,
		},	
		payment_mode: {
			type: Sequelize.STRING(250),
            allowNull: true,
		},
		devicetype: {
			type: Sequelize.STRING(100),
            allowNull: true,
		},
		devicetoken: {
			type: Sequelize.STRING(100),
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
		},
		version: {
			type: Sequelize.DATE,
			allowNull: true
		}
		
	},
	options: {
        timestamps: false,
        tableName: 'mappconfig'
	}
};
