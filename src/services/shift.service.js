"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ShiftValidator = require("../app/admin/validators/ShiftValidator");
const ShiftController = require("../app/admin/controllers/ShiftController");
const img_path = __dirname;

module.exports = {
	name: "adminshift",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: ShiftValidator.create,
			handler: ShiftController.create,
        },

		getall: {
			params: ShiftValidator.getall,
			handler: ShiftController.getall,
		},
		// getall_mob: {
		// 	params: ServiceValidator.getall_mob,
		// 	handler: ServiceController.getall_mob,
		// },
		// get: {
		// 	params: ServiceValidator.get,
		// 	handler: ServiceController.get,
		// },

		update: {
			params: ShiftValidator.update,
			handler: ShiftController.update,
		},

		// status: {
		// 	params: ServiceValidator.status,
		// 	handler: ServiceController.status,
		// },

		remove: {
			params: ShiftValidator.remove,
			handler: ShiftController.remove,
		}
	},

	methods: {
	},

	created() {	}
};
