"use strict";

const passwordHash = require('password-hash');

const Database = require("../adapters/Database");
const Request = require("../mixins/request.mixin");
const LoginValidator = require("../app/common/validators/LoginValidator");
const LoginController = require("../app/common/controllers/LoginController");
module.exports = {
	name: "login",

	mixins: [ Request ],

	actions: {

		create: {
			params: LoginValidator.create,
			handler: LoginController.create,
		},

		getAll: {
			params: LoginValidator.getAll,
			handler: LoginController.getAll,
		},

		get: {
			params: LoginValidator.get,
			handler: LoginController.get,
		},

		count: {
			params: LoginValidator.count,
			handler: LoginController.count
		},

		changeInfo: {
			params: LoginValidator.changeInfo,
			handler: LoginController.changeInfo
		},

		user_changePassword: {
			params: LoginValidator.user_changePassword,
			handler: LoginController.user_changePassword
		},

		vendor_changePassword: {
			params: LoginValidator.vendor_changePassword,
			handler: LoginController.vendor_changePassword
		},

		changeRole: {
			params: LoginValidator.changeRole,
			handler: LoginController.changeRole
		},

		remove: {
			params: LoginValidator.remove,
			handler: LoginController.remove,
		},

		banish: {
			params: LoginValidator.banish,
			handler: LoginController.banish
		},

		removeAll: {
			params: LoginValidator.removeAll,
			handler: LoginController.removeAll
		},

		createAdminIfNotExists: {
			params: LoginValidator.createAdminIfNotExists,
			handler: LoginController.createAdminIfNotExists
		},
		insertModles: {
			params: LoginValidator.insertModles,
			handler: LoginController.insertModles
		},
		getAllModule: {
			params: LoginValidator.getAllModule,
			handler: LoginController.getAllModule
		},
		splitlogin: {
			handler: LoginController.splitpaylogin
		}

	},

	methods: {
		generateHash(value) {

			return Promise.resolve(passwordHash.generate(value, {algorithm: 'sha256'}))
				.then( (res) => this.requestSuccess("Password Encrypted", res) );
		},

		verifyIfLogged(ctx, CodeTypes){

			if (ctx.meta.user !== undefined)
				return this.requestSuccess("User Logged", true);
			else
				return this.requestError(CodeTypes.USERS_NOT_LOGGED_ERROR);
		},

		verifyIfAdmin(ctx){

			return this.verifyIfLogged(ctx)
				.then( () => {
					if (ctx.meta.login.is_admin === ADMIN_ROLE)
						return this.requestSuccess("User is ADMIN", true);
					else
						return this.requestError(CodeTypes.AUTH_ADMIN_RESTRICTION);
				});
		},

		verifyRole(role){

			if (Roles.indexOf(is_admin) !== -1)
				return this.requestSuccess("Role Exists", true);
			else
				return this.requestError(CodeTypes.USERS_INVALID_ROLE);
		},

		isLastAdmin(ctx){

			return this.verifyIfAdmin(ctx)
				.then( () => this.Madmin.count(ctx, {
					is_admin: ADMIN_ROLE
				}))
				.then( (res) => {
					if (res.data === 1)
						return this.requestSuccess("Last Admin", true);
					else
						return this.requestSuccess("Last Admin", false);
				})
				.catch( (err) => {
					if (err.message === CodeTypes.AUTH_ADMIN_RESTRICTION)
						return this.requestSuccess("Last Admin", false);
					else
						return Promise.reject(err);
				});
		}
	},

	created() {
		this.Madmin = new Database("Madmin");
	}
};
