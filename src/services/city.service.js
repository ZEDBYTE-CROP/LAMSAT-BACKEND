"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CityValidator = require("../app/admin/validators/CityValidator");
const CityController = require("../app/admin/controllers/CityController");
const img_path = __dirname;

module.exports = {
	name: "city",

	mixins: [
		Request
	 ],

	actions: {
		importcity:{
			handler: CityController.importcity
		},
        create: {
			params: CityValidator.create,
			handler: CityController.create,
        },

		getall: {
			params: CityValidator.getall,
			handler: CityController.getall,
		},

		get: {
			params: CityValidator.get,
			handler: CityController.get,
		},

		update: {
			params: CityValidator.update,
			handler: CityController.update,
		},

		status: {
			params: CityValidator.status,
			handler: CityController.status,
		},

		remove: {
			params: CityValidator.remove,
			handler: CityController.remove,
		},
	},

	methods: {
	},

	created() {	}
};
