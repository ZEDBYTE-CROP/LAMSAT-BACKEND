"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ServiceValidator = require("../app/vendor/validators/ServiceValidator");
const ServiceController = require("../app/vendor/controllers/ServiceController");
const img_path = __dirname;

module.exports = {
	name: "vendorservice",

	mixins: [
		Request
	 ],
	 
	actions: {
        create: {
			params: ServiceValidator.create,
			handler: ServiceController.create,
        },

		update: {
			params: ServiceValidator.update,
			handler: ServiceController.update,
		},

		status: {
			params: ServiceValidator.status,
			handler: ServiceController.status,
		},

		remove: {
			params: ServiceValidator.remove,
			handler: ServiceController.remove,
		},

		getall: {
			params: ServiceValidator.getall,
			handler: ServiceController.getall,
		},
		getall_mob: {
			params: ServiceValidator.getall_mob,
			handler: ServiceController.getall_mob,
		},
		get: {
			params: ServiceValidator.get,
			handler: ServiceController.get,
		},
		getbyid: {
			params: ServiceValidator.getbyid,
			handler: ServiceController.getbyid,
		},
		getvendorservice: {
			params: ServiceValidator.getvendorservice,
			handler: ServiceController.getvendorservice,
		},
		getVendorStaffService : {
			params: ServiceValidator.getVendorStaffService,
			handler: ServiceController.getVendorStaffService,
		},
	},

	methods: {
		convetToMin(hr) {
			var a = hr.split(':'); // split it at the colons
			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var min = ((+a[0]) * 60) + (+a[1]);
			console.log(min);
			return min;
		}
	},

	created() {	}
};
