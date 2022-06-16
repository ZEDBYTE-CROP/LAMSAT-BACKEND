"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const FaqmanagementValidator = require("../app/admin/validators/FaqmanagementValidator");
const FaqmanagementController = require("../app/admin/controllers/FaqmanagementController");
const img_path = __dirname;

module.exports = {
	name: "faqmanage",

	mixins: [
		Request
	 ],

	actions: {

		create: {
			params: FaqmanagementValidator.create,
			handler: FaqmanagementController.create,
        },

		getall: {
			params: FaqmanagementValidator.getall,
			handler: FaqmanagementController.getall,
		},

		get: {
			params: FaqmanagementValidator.get,
			handler: FaqmanagementController.get,
		},

		update: {
			params: FaqmanagementValidator.update,
			handler: FaqmanagementController.update,
		},

		status: {
			params: FaqmanagementValidator.status,
			handler: FaqmanagementController.status,
		},

		remove: {
			params: FaqmanagementValidator.remove,
			handler: FaqmanagementController.remove,
		},
	},

	methods: {

	},

	created() {	}
};
