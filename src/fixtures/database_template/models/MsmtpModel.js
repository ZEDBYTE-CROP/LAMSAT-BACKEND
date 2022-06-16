"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "msmtp",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
        },
        
        smtpkey: { // Default Unique Key for Country 
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,	
			allowNull: true,
		},			
		smtp_host: {
			type: Sequelize.STRING(200),
            allowNull: true            
		},	
		smtp_encryption: {
			type: Sequelize.TEXT,
            allowNull: true            
		},	
		smtp_port: {
			type: Sequelize.STRING(100),
            allowNull: true
		},	
		smtp_username: {
			type: Sequelize.STRING(200),
            allowNull: true
		},
		smtp_password: {
			type: Sequelize.STRING(250),
            allowNull: true
		},
		is_smtp: {
			type: Sequelize.INTEGER,
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
        tableName: 'msmtp'
	}
};
