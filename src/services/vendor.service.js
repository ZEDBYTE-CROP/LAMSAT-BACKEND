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
const VendorValidator = require("../app/vendor/validators/VendorValidator");
const VendorController = require("../app/vendor/controllers/VendorController");
//added for user to access vendor related api's
const VendorValidatoruser = require("../app/user/validators/VendorValidator");
const VendorControlleruser = require("../app/user/controllers/VendorController");

const AdminVendorController = require("../app/admin/controllers/VendorController");
const AdminVendorValidator =  require("../app/admin/validators/VendorValidator");
const img_path = __dirname;


const JWT_SECRET = "TOP SECRET!!!";

module.exports = {
	name: "vendor",

	mixins: [
		Request
	 ],

	actions: {

        login: {
			params: VendorValidator.login,
			handler: VendorController.login,
		},

		create: {
			params: AdminVendorValidator.signup,
			handler: AdminVendorController.create,
		},

		verifypassword: {
			params: VendorValidator.verifypassword,
			handler: VendorController.verifypassword
		},

		changepassword: {
			params: VendorValidator.changepassword,
			handler: VendorController.changepassword
		},

		changeforgetpassword: {
			params: VendorValidator.changeforgetpassword,
			handler: VendorController.changeforgetpassword
		},

		forgetpassword: {
			params: VendorValidator.forgetpassword,
			handler: VendorController.forgetpassword
		},

		verify_changepassword: {
			params: VendorValidator.verify_changepassword,
			handler: VendorController.verify_changepassword
		},

		count_sessions: {
			params: VendorValidator.count_sessions,
			handler: VendorController.count_sessions
		},

		close_allsessions: {
			params: VendorValidator.close_allsessions,
			handler: VendorController.close_allsessions
		},

		logout: {
			handler: VendorController.logout
		},

		get: {
			params: VendorValidator.get,
			handler: VendorController.get
		},

		update: {
			params: VendorValidator.update,
			handler: VendorController.update
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
		getvendors: {
			params: VendorValidatoruser.getvendors,
			handler: VendorControlleruser.getvendors
		},
		vendor_detail: {
			params: VendorValidatoruser.vendor_detail,
			handler: VendorControlleruser.vendor_detail
		},
		vendorTimeget: {
			params: VendorValidator.vendorTimeget,
			handler: VendorController.vendorTimeget
		},

		timeupdates: {
			params: VendorValidator.timeupdates,
			handler: VendorController.timeupdates
		},

		vendortimeGetall: {
			params: VendorValidator.vendortimeGetall,
			handler: VendorController.vendortimeGetall
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
