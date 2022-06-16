"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CountryValidator = require("../app/admin/validators/CountryValidator");
const CountryController = require("../app/admin/controllers/CountryController");
const img_path = __dirname;

module.exports = {
	name: "country",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: CountryValidator.create,
			handler: CountryController.create,
        },
        
		getall: {
			params: CountryValidator.getall,
			handler: CountryController.getall,
		},

		get: {
			params: CountryValidator.get,
			handler: CountryController.get,
		},

		update: {
			params: CountryValidator.update,
			handler: CountryController.update,
		},

		status: {
			params: CountryValidator.status,
			handler: CountryController.status,
		},

		remove: {
			params: CountryValidator.remove,
			handler: CountryController.remove,
		},
	},

	methods: { 
		
	},

	created() {	}
};
