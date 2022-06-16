"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mbookingaddress",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
        },
        
		bookingaddresskey: { // Default Unique Key for Country 
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,	
			allowNull: true,
		},						
		userid: {
			type: Sequelize.INTEGER,
            allowNull: true      
		},	
		fullname:{
			type: Sequelize.STRING(100),
			allowNull: true
		},
		bcountry:{
			type: Sequelize.INTEGER,
            allowNull: true  
		},
		bcity:{
			type: Sequelize.INTEGER,
			allowNull: true
		},
		bflatno:{
			type: Sequelize.STRING(50),
			allowNull: true
		},
		blandmark:{
			type: Sequelize.STRING(100),
			allowNull: true
		},
		baddress:{
			type: Sequelize.TEXT,
			allowNull: true
		},
		bmobile:{
			type: Sequelize.STRING(20),
			allowNull: true
		},
		bpincode:{
			type: Sequelize.STRING(20),
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
        tableName: 'mbookingaddress'
	}
};
