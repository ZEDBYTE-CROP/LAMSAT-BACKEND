"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const AppconfigValidator = require("../app/admin/validators/AppconfigValidator");
const AppconfigController = require("../app/admin/controllers/AppconfigController");
const img_path = __dirname;

module.exports = {
	name: "appconfig",

	mixins: [
		Request
	 ],

	actions: {
		// create: {
		// 	params: AppconfigValidator.create,
		// 	handler: AppconfigController.create,
		// },
		get: {
			params: AppconfigValidator.get,
			handler: AppconfigController.get,
		},
		update: {
			params: AppconfigValidator.update,
			handler: AppconfigController.update,
		},
		getactive: {
			handler: AppconfigController.getactive
		},
		getCMS: {
			handler: AppconfigController.getCMS
		}
	},

	methods: {
	},

	created() {	}
};
