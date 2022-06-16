"use strict";

const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mcmslang",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,	
        },
        
        cmslangkey: { // Default Unique Key for Country 
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,	
			allowNull: true,
		},		
		languageid: {
			type: Sequelize.TINYINT,
            allowNull: true      
		},			
		languageshortname: {
			type: Sequelize.STRING(50),
            allowNull: true            
		},
		cmsid: {
			type: Sequelize.INTEGER,
            allowNull: false            
		},
		pagetitle: {
			type: Sequelize.STRING(150),
            allowNull: true            
		},
		keywords: {
			type: Sequelize.STRING(250),
            allowNull: true            
		},
		description: {
			type: Sequelize.TEXT,
            allowNull: true            
		},
		pagecontent: {
			type: Sequelize.TEXT,
            allowNull: true
        },
		slug: {
			type: Sequelize.STRING(256),
            allowNull: true            
		},
		sortorder: {
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
        tableName: 'mcmslang'
	}
};
