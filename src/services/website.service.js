"use strict";

const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const Database = require("../adapters/Database");
const CodeTypes = require("../fixtures/error.codes");
const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const JWT_SECRET = "TOP SECRET!!!";
const WebsiteValidator = require("../app/user/validators/WebsiteValidator");
const WebsiteController = require("../app/user/controllers/WebsiteController");

module.exports = {
	name: "website",

	mixins: [
		Request
	 ],

	actions: {
		instant_sallon:{
			params: WebsiteValidator.instant_sallon,
			handler: WebsiteController.instant_sallon,
		},
		near_vendor: {
			params: WebsiteValidator.near_vendor,
			handler: WebsiteController.near_vendor,
		},
		getvendorbyname: {
			params: WebsiteValidator.getvendorbyname,
			handler: WebsiteController.getvendorbyname,
		},
		getvendors:{
			params: WebsiteValidator.getvendors,
			handler: WebsiteController.getvendors,
		},
        category_getall: {
			params: WebsiteValidator.category_getall,
			handler: WebsiteController.category_getall,
		},
		//featured saloon only
		saloon_getall: {
			params: WebsiteValidator.saloon_getall,
			handler: WebsiteController.saloon_getall
		},

		toprating_getall: {
			params: WebsiteValidator.toprating_getall,
			handler: WebsiteController.toprating_getall
		},

		staff_getall: {
			params: WebsiteValidator.staff_getall,
			handler: WebsiteController.staff_getall
		},

		service_getall:{
			params: WebsiteValidator.service_getall,
			handler: WebsiteController.service_getall
		},

		vendor_get:{
			params: WebsiteValidator.vendor_get,
			handler: WebsiteController.vendor_get
		},

		vendor_dates:{
			params: WebsiteValidator.vendor_dates,
			handler: WebsiteController.vendor_dates
		},

		category_saloons:{
			params: WebsiteValidator.category_saloons,
			handler: WebsiteController.category_saloons
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
