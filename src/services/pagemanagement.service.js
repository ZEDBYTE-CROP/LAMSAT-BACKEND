"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const PagemanagementValidator = require("../app/admin/validators/PagemanagementValidator");
const PagemanagementController = require("../app/admin/controllers/PagemanagementController");
const img_path = __dirname;

module.exports = {
	name: "pagemanage",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: PagemanagementValidator.create,
			handler: PagemanagementController.create,
        },

		getall: {
			params: PagemanagementValidator.getall,
			handler: PagemanagementController.getall,
		},

		get: {
			params: PagemanagementValidator.get,
			handler: PagemanagementController.get,
		},

		update: {
			params: PagemanagementValidator.update,
			handler: PagemanagementController.update,
		},

		status: {
			params: PagemanagementValidator.status,
			handler: PagemanagementController.status,
		},

		remove: {
			params: PagemanagementValidator.remove,
			handler: PagemanagementController.remove,
		}
	},

	methods: {

	},

	created() {	}
};
