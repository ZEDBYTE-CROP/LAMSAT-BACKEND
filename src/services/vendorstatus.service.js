"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const VendorstatusValidator = require("../app/admin/validators/VendorstatusValidator");
const VendorstatusController = require("../app/admin/controllers/VendorstatusController");
const img_path = __dirname;

module.exports = {
	name: "hotelstatus",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: VendorstatusValidator.create,
			handler: VendorstatusController.create,
        },

		getAll: {
			params: VendorstatusValidator.getAll,
			handler: VendorstatusController.getAll,
		},

		get: {
			params: VendorstatusValidator.get,
			handler: VendorstatusController.get,
		},

		update: {
			params: VendorstatusValidator.update,
			handler: VendorstatusController.update,
		},

		status: {
			params: VendorstatusValidator.status,
			handler: VendorstatusController.status,
		},

		remove: {
			params: VendorstatusValidator.remove,
			handler: VendorstatusController.remove,
		},
	},

	methods: {

	},

	created() {	}
};
