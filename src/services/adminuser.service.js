"use strict";

const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const Database = require("../adapters/Database");
const CodeTypes = require("../fixtures/error.codes");
const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const JWT_SECRET = "TOP SECRET!!!";
const UserValidator = require("../app/admin/validators/UserValidator");
const UserController = require("../app/admin/controllers/UserController");

module.exports = {
	name: "adminuser",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: UserValidator.create,
			handler: UserController.create,
		},
		
		// update: {
		// 	params: UserValidator.update,
		// 	handler: UserController.update,
		// },

		getall:{ 
			params: UserValidator.getall,
			handler: UserController.getall,
		},

		get: {
			params: UserValidator.get,
			handler: UserController.get
		},

		status: {
			params: UserValidator.status,
			handler: UserController.status
		},

		remove: {
			params: UserValidator.remove,
			handler: UserController.remove
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
