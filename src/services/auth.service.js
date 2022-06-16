"use strict";

const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const passwordHash = require('password-hash');
const Database = require("../adapters/Database");
const Request = require("../mixins/request.mixin");
const CodeTypes = require("../fixtures/error.codes");
const AuthValidator = require("../app/common/validators/AuthValidator");
const AuthController = require("../app/common/controllers/AuthController");

const JWT_SECRET = "TOP SECRET!!!";

module.exports = {
	name: "auth",

	mixins: [ Request ],

	actions: {

		login: {
			params: AuthValidator.login,
			handler: AuthController.login
		},

		forgetpassword: {
			params: AuthValidator.forgetpassword,
			handler: AuthController.forgetpassword
		},

		user_login: {
			params: AuthValidator.user_login,
			handler: AuthController.user_login
		},

		user_resetPassword: {
			params: AuthValidator.user_resetPassword,
			handler: AuthController.user_resetPassword
		},

		verifyPassword: {
			params: AuthValidator.verifyPassword,
			handler: AuthController.verifyPassword
		},

		changepassword: {
			params: AuthValidator.changepassword,
			handler: AuthController.changepassword
		},

		verify_change_Password: {
			params: AuthValidator.verify_change_Password,
			handler: AuthController.verify_change_Password
		},

		user_verifyPassword: {
			params: AuthValidator.user_verifyPassword,
			handler: AuthController.user_verifyPassword
		},

		verifyuser_change_Password: {
			params: AuthValidator.verifyuser_change_Password,
			handler: AuthController.verifyuser_change_Password
		},


		verifyToken: {
			//params: AuthValidator.verifyToken,
			handler: AuthController.verifyToken
		},

		countSessions: {
			//params: AuthValidator.countSessions,
			handler: AuthController.countSessions
		},

		closeAllSessions: {
			//params: AuthValidator.closeAllSessions,
			handler: AuthController.closeAllSessions
		},

		logout: {
			//params: AuthValidator.logout,
			handler: AuthController.logout
		},

		get_language: {
			handler: AuthController.get_language
		},

		vendor_login: {
			params: AuthValidator.vendor_login,
			handler: AuthController.vendor_login
		},

		vendor_verifyPassword: {
			params: AuthValidator.vendor_verifyPassword,
			handler: AuthController.vendor_verifyPassword
		},

		vendor_resetPassword: {
			params: AuthValidator.vendor_resetPassword,
			handler: AuthController.vendor_resetPassword
		},

		admin_resetPassword: {
			params: AuthValidator.admin_resetPassword,
			handler: AuthController.admin_resetPassword
		},

		verifyvendor_change_Password: {
			params: AuthValidator.verifyvendor_change_Password,
			handler: AuthController.verifyvendor_change_Password
		}
	},

	methods: {

		generateToken(user) {

			return this.encode(user, JWT_SECRET);
		},

		getUser(id) {

			return 1;
			return this.Users.findOne(ctx, {
				query: {
					id: id
				}
			}).then((res) => res);
		},

		verifyIfLogged(ctx){

			if (ctx.meta.user !== undefined)
				return this.requestSuccess("User Logged", true);
			else
				return this.requestSuccess("User Logged", true);
		},
		generateHash(value) {

			return Promise.resolve(passwordHash.generate(value, {algorithm: 'sha256'}))
				.then( (res) => this.requestSuccess("Password Encrypted", res) );
		}

	},

	created() {
		// Create Promisify encode & verify methods
		this.encode = Promise.promisify(jwt.sign);

		this.Users = new Database("Muser");

	}
};
