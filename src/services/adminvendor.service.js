"use strict";


const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const Database = require("../adapters/Database");
const CodeTypes = require("../fixtures/error.codes");
const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const VendorValidator = require("../app/admin/validators/VendorValidator");
const VendorController = require("../app/admin/controllers/VendorController");
const img_path = __dirname;


const JWT_SECRET = "TOP SECRET!!!";

module.exports = {
	name: "adminvendor",

	mixins: [
		Request
	 ],

	actions: {
		create: {
			params: VendorValidator.create,
			handler: VendorController.create,
		},

		get: {
			params: VendorValidator.get,
			handler: VendorController.get
		},

		getall: {
			params: VendorValidator.getall,
			handler: VendorController.getall
		},

		getallsalon: {
			params: VendorValidator.getallsalon,
			handler: VendorController.getallsalon
		},

		update: {
			params: VendorValidator.update,
			handler: VendorController.update
		},
		status: {
			params: VendorValidator.status,
			handler: VendorController.status
		},
		remove: {
			params: VendorValidator.remove,
			handler: VendorController.remove
		},
		images: {
			params: VendorValidator.images,
			handler: VendorController.images
		},

		imageremove: {
			params: VendorValidator.imageremove,
			handler: VendorController.imageremove
		},

		timeupdate: {
			params: VendorValidator.timeupdate,
			handler: VendorController.timeupdate
		},

		timeget: {
			params: VendorValidator.timeget,
			handler: VendorController.timeget
		},


		adminvendortimeGetall: {
			params: VendorValidator.adminvendortimeGetall,
			handler: VendorController.adminvendortimeGetall
		},
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
