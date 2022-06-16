"use strict";

const jwt	= require("jsonwebtoken");
const passwordHash = require('password-hash');
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;

const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const Op = require('sequelize').Op;
const CodeTypes = require("../fixtures/error.codes");
const Config = require("../../config");
const Constants = require("../../plugin/constants");
const Database = require("../adapters/Database");
const mail_template = __dirname;

const Sniffr = require("sniffr");
const s = new Sniffr();

const { Console } = require("console");

const {
	DELETE,
	ACTIVE,
    INACTIVE,
    ADMIN_ROLE,
    USER_ROLE
} = Constants;
const Roles = [ADMIN_ROLE, USER_ROLE];

//Models
const Log = new Database("Mactivitylog");
const User = new Database("Muser");
const Admin = new Database("Madmin");
const vendor = new Database("Mvendor");

module.exports = {
	setLog: function(ctx) {
		//get user agent ip details
		var os = s.sniff(ctx.meta.userAgent);
		var activityData = {};
		activityData.clientagent = ctx.meta.userAgent;
		activityData.clientplatform = os.os.name;
		activityData.clientip = ctx.meta.clientIp;
		activityData.username = ctx.meta.username;
		activityData.log = ctx.meta.log;
		return Log.insert(ctx, activityData)
		.then( (res) => {
			console.log('Activity log updated');
		})
		.catch(function (err) {
			console.error(err);
		});
	},
	getAdmin: function (ctx,id) {
		return  Admin.findOne(ctx, { query: {
			id: id
		}
		})
		.then((res)=>{
			return res;
		})
	},
	getVendorUser: function (ctx,id) {
		return  User.findOne(ctx, { query: {
			id: id
			}
		})
		.then((res)=>{
			return res;
		});
	},
	getUser: function (ctx,id,usertype) {
		if(usertype === 1) {
			return  Admin.findOne(ctx, { query: {
				id: id
				}
			})
			.then((res)=>{
				return res;
			});
		} else{
			return  User.findOne(ctx, { query: {
					id: id
				}
			})
			.then((res)=>{
				return res;
			});
		}
	},
	getVendor: function (ctx,id) {
		return  vendor.findOne(ctx, { query: {
			id: id
		}
		})
		.then((res)=>{
			return res;
		})
	},
	getLogCount: async function(ctx) {
		return Log.count(ctx, {
				status: 1
		})
		.then((res)=>{
			return res.data;
		})
	},

}
