"use strict";

const jwt	= require("jsonwebtoken");
const Promise = require("bluebird");
const Database = require("../adapters/Database");
const CodeTypes = require("../fixtures/error.codes");
const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const JWT_SECRET = "TOP SECRET!!!";
const VatController = require("../app/admin/controllers/VatController");

module.exports = {
	name: "vat",

	mixins: [
		Request
	 ],

	actions: {
        get:{
			handler:VatController.get
		},
		update: {
			handler:VatController.update
		}

	},

	methods: {

	},

	created() {
		// Create Promisify encode & verify methods
		this.encode = Promise.promisify(jwt.sign);

		this.Users = new Database("Muser");
	}
};
