"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ModuleValidator = require("../app/admin/validators/ModuleValidator");
const ModuleController = require("../app/admin/controllers/ModuleController");
const img_path = __dirname;

module.exports = {
	name: "module",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: ModuleValidator.create,
			handler: ModuleController.create,
        },
        
		getall: {
			params: ModuleValidator.getall,
			handler: ModuleController.getall,
		},

		get: {
			params: ModuleValidator.get,
			handler: ModuleController.get,
		},

		update: {
			params: ModuleValidator.update,
			handler: ModuleController.update,
		},

		// status: {
		// 	params: ModuleValidator.status,
		// 	handler: ModuleController.status,
		// },

		// remove: {
		// 	params: ModuleValidator.remove,
		// 	handler: ModuleController.remove,
		// },
	},

	methods: { 
		
	},

	created() {	}
};
