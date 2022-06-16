"use strict";

const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const Database = require("../adapters/Database");
const CodeTypes = require("../fixtures/error.codes");
const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require("password-hash");
const JWT_SECRET = "TOP SECRET!!!";
const UserValidator = require("../app/user/validators/UserValidator");
const UserController = require("../app/user/controllers/UserController");

module.exports = {
	name: "user",

	mixins: [
		Request
	 ],

	actions: {
		create: {
			params: UserValidator.create,
			handler: UserController.create,
		},

		login: {
			params: UserValidator.login,
			handler: UserController.login
		},

		verifypassword: {
			params: UserValidator.verifypassword,
			handler: UserController.verifypassword
		},

		changepassword: {
			params: UserValidator.changepassword,
			handler: UserController.changepassword,
		},

		adminchangepassword: {
			params: UserValidator.adminchangepassword,
			handler: UserController.adminchangepassword,
		},

		verify_changepassword: {
			params: UserValidator.verify_changepassword,
			handler: UserController.verify_changepassword
		},

		verifyMailId: {
			params: UserValidator.verifyMailId,
			handler: UserController.verifyMailId
		},

		forgetpassword: {
			params: UserValidator.forgetpassword,
			handler: UserController.forgetpassword
		},

		changeforgetpassword: {
			params: UserValidator.changeforgetpassword,
			handler: UserController.changeforgetpassword
		},

		close_allsessions: {
			params: UserValidator.close_allsessions,
			handler: UserController.close_allsessions
		},

		otp_resend: {
			params: UserValidator.otp_resend,
			handler: UserController.otp_resend,
		},

		otp_verify: {
			params: UserValidator.otp_verify,
			handler: UserController.otp_verify,
		},

		favvendor: {
			params: UserValidator.favvendor,
			handler: UserController.favvendor,
		},
		favhotels:{
			params: UserValidator.favhotels,
			handler: UserController.favhotels,
		},

		update: {
			params: UserValidator.update,
			handler: UserController.update,
		},

		validate_voucher:{
			params: UserValidator.validate_voucher,
			handler: UserController.validate_voucher,
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
				return this.requestError(CodeTypes.USERS_NOT_LOGGED_ERROR);
		},
		generateHash(value) {
			return Promise.resolve(passwordHash.generate(value, {algorithm: "sha256"}))
				.then( (res) => this.requestSuccess("Password Encrypted", res) );
		}

	},

	created() {
		// Create Promisify encode & verify methods
		this.encode = Promise.promisify(jwt.sign);

		this.Users = new Database("Muser");
	}
};
