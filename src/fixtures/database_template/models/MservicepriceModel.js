"use strict";

const { STRING, INTEGER } = require("sequelize");
const Sequelize = require("sequelize");

// For more information about Sequelize Data Types :
// http://docs.sequelizejs.com/manual/tutorial/models-definition.html#data-types


module.exports = {
	name: "mserviceprice",
	define: {
        id: { // id must always exist
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
        },

        sevicepricekey: { // Default Unique Key for Country
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			allowNull: true,
		},
		vendorid: {
			type: Sequelize.INTEGER,
            allowNull: true
		},
		serviceid: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		pricing_name: {
			type: Sequelize.STRING(100),
			allowNull: true
		},
		duration:{
			type: Sequelize.INTEGER,
			allowNull: false
		},
		pricetype: {
			type: Sequelize.SMALLINT,
			allowNull: false
		},
		price:{
			type: Sequelize.DECIMAL(12,3),
			allowNull: false
		},
		special_price:{
			type: Sequelize.DECIMAL(12,3),
			allowNull: false
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
        tableName: 'mserviceprice'
	}
};
