"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mcontactus",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
        },
        
        contactuskey: { // Default Unique Key for Country 
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,	
			allowNull: true,
		},	
			
		firstname: {
			type: Sequelize.STRING(150),
            allowNull: true            
		},	
		lastname: {
			type: Sequelize.STRING(150),
            allowNull: true            
		},
		email: {
			type: Sequelize.STRING(150),
            allowNull: true            
		},
		phone: {
			type: Sequelize.STRING(50),
            allowNull: true            
		},
		message: {
			type: Sequelize.TEXT,
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
		}
	},
	options: {
        timestamps: false,
        tableName: 'mcontactus'
	}
};
