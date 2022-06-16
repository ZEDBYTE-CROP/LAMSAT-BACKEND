"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const PackageValidator = require("../app/admin/validators/PackageValidator");
const PackageController = require("../app/admin/controllers/PackageController");
const img_path = __dirname;

module.exports = {
	name: "adminpackage",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: PackageValidator.create,
			handler: PackageController.create,
        },

		getall: {
			params: PackageValidator.getall,
			handler: PackageController.getall,
		},

		get: {
			params: PackageValidator.get,
			handler: PackageController.get,
		},

		update: {
			params: PackageValidator.update,
			handler: PackageController.update,
		},

		status: {
			params: PackageValidator.status,
			handler: PackageController.status,
		},

		remove: {
			params: PackageValidator.remove,
			handler: PackageController.remove,
		}
	},

	methods: {
	},

	created() {	}
};
