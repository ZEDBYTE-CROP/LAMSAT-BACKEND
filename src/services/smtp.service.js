"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const SmtpValidator = require("../app/admin/validators/SmtpValidator");
const SmtpController = require("../app/admin/controllers/SmtpController");
const img_path = __dirname;

module.exports = {
	name: "smtp",

	mixins: [
		Request
	 ],

	actions: {

		create: {
			params: SmtpValidator.create,
			handler: SmtpController.create,
		},
		getall: {
			params: SmtpValidator.getall,
			handler: SmtpController.getall,
		},
		update: {
			params: SmtpValidator.update,
			handler: SmtpController.update,
		},
	},

	methods: {
		generateHash(value) {        
			return Promise.resolve(passwordHash.generate(value, {algorithm: 'sha256'}))
				.then( (res) => this.requestSuccess("Password Encrypted", res) );
		}
	},

	created() {	}
};
