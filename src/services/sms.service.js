"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const SmsValidator = require("../app/admin/validators/SmsValidator");
const SmsController = require("../app/admin/controllers/SmsController");
const img_path = __dirname;

module.exports = {
	name: "sms",

	mixins: [
		Request
	 ],

	actions: {
		create: {
			params: SmsValidator.create,
			handler: SmsController.create,
		},
		getall: {
			params: SmsValidator.getall,
			handler: SmsController.getall,
		},
		update: {
			params: SmsValidator.update,
			handler: SmsController.update,
		},
		sendsms: {
			params: SmsValidator.sendsms,
			handler: SmsController.sendsms,
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
