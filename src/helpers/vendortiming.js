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


const { Console } = require("console");

const {
	DELETE,
	ACTIVE,
    INACTIVE,
    ADMIN_ROLE,
    USER_ROLE
} = Constants;
const Roles = [ADMIN_ROLE, USER_ROLE];

module.exports = {
	timing: function(ctx) {
		let arr = [
			{
				days: "Sunday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Monday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Tuesday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Wednesday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Thursday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Friday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			},
			{
				days: "Saturday",
				starttime: "9:00",
				endtime: "22:00",
				vendorstatus: "0"
			}
		];
		return arr;
	}

}
