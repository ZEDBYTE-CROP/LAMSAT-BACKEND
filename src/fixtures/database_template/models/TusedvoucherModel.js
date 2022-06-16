"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "tusedvoucher",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
        },
        
        usedvoucherkey: { // Default Unique Key for Used vouchers 
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,	
			allowNull: true,
		},
		bookingid: {
			type: Sequelize.INTEGER,
            allowNull: false,    
		},	
		userid: {
			type: Sequelize.INTEGER,
            allowNull: false,    
		},
		voucherid:{
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		vouchername: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},
		vochercode: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
		maxredeem_amt: {
			type: Sequelize.DECIMAL(12,3),
			allowNull: true,
		},
		vouchertype:{// flat fee based or percentage based
			type: Sequelize.SMALLINT,
			allowNull: true,
		},
		vouchervalue: {
			type: Sequelize.DECIMAL(12,3),
			allowNull: true,
		},
		mincartvalue: {
			type: Sequelize.DECIMAL(12,3),
			allowNull: true,
		},
		description: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		startdate: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},
		enddate: {
			type: Sequelize.STRING(250),
			allowNull: true,
		},
		usertype: {//alluser, web app user, mobile app user
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		isallvendor: { //0 ==>not all vendor , 1 ==> all vendor
			type: Sequelize.TINYINT,
			allowNull: true,
		},
		isalluser: { //0 ==>not all user , 1 ==> all user
			type: Sequelize.TINYINT,
			allowNull: true,
		},
		isused: { //0 ==> not used, 1 => used
			type: Sequelize.TINYINT,
			allowNull: true,
			defaultValue: 0
		},
		status: {// o => expired, 1 => active, 2 => deleted
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
        tableName: 'tusedvoucher'
	}
};
