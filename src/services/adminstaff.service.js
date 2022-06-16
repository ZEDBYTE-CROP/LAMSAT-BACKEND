"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const StaffValidator = require("../app/admin/validators/StaffValidator");
const StaffController = require("../app/admin/controllers/StaffController");
const img_path = __dirname;

module.exports = {
	name: "adminstaff",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: StaffValidator.create,
			handler: StaffController.create,
        },
		getalltime: {
			params: StaffValidator.getalltime,
			handler: StaffController.getalltime,
		},
		getall: {
			params: StaffValidator.getall,
			handler: StaffController.getall,
		},

		getall_service: {
			params: StaffValidator.getall_service,
			handler: StaffController.getall_service
		},

		getall_service_timeslot: {
			handler: StaffController.getall_service_timeslot
		},

		getall_mob:{
			params: StaffValidator.getall_mob,
			handler: StaffController.getall_mob,
		},
		get: {
			params: StaffValidator.get,
			handler: StaffController.get,
		},

		update: {
			params: StaffValidator.update,
			handler: StaffController.update,
		},

		status: {
			params: StaffValidator.status,
			handler: StaffController.status,
		},

		remove: {
			params: StaffValidator.remove,
			handler: StaffController.remove,
		},
	},

	methods: {
	},

	created() {	}
};
