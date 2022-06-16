"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ActivitylogValidator = require("../app/admin/validators/ActivitylogValidator");
const ActivitylogController = require("../app/admin/controllers/ActivitylogController");
const img_path = __dirname;

module.exports = {
	name: "activitylog",

	mixins: [
		Request
	 ],

	actions: {

		getall: {
			params: ActivitylogValidator.getall,
			handler: ActivitylogController.getall,
		},
		remove: {
			params: ActivitylogValidator.remove,
			handler: ActivitylogController.remove,
		},
	},

	methods: {
	},

	created() {	}
};
