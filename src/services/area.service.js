"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const AreaValidator = require("../app/admin/validators/AreaValidator");
const AreaController = require("../app/admin/controllers/AreaController");
const img_path = __dirname;

module.exports = {
	name: "area",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: AreaValidator.create,
			handler: AreaController.create,
        },
        
		getall: {
			params: AreaValidator.getall,
			handler: AreaController.getall,
		},

		get: {
			params: AreaValidator.get,
			handler: AreaController.get,
		},

		update: {
			params: AreaValidator.update,
			handler: AreaController.update,
		},

		status: {
			params: AreaValidator.status,
			handler: AreaController.status,
		},

		remove: {
			params: AreaValidator.remove,
			handler: AreaController.remove,
		},
	},

	methods: { 
	},

	created() {	}
};
