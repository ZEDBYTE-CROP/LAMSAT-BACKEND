"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const BookingValidator = require("../app/user/validators/BookingValidator");
const BookingController = require("../app/user/controllers/BookingController");
const img_path = __dirname;

module.exports = {
	name: "userbooking",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: BookingValidator.create,
			handler: BookingController.create,
        },

		getall: {
			params: BookingValidator.getall,
			handler: BookingController.getall,
		},

		get: {
			params: BookingValidator.get,
			handler: BookingController.get,
		},
		cancel: {
			params: BookingValidator.cancel,
			handler: BookingController.cancel,
		},
		remove: {
			params: BookingValidator.remove,
			handler: BookingController.remove,
		},
		activity_log:{
			params: BookingValidator.activity_log,
			handler: BookingController.activity_log,
		},

		dashboard: {
			params: BookingValidator.dashboard,
			handler: BookingController.dashboard,
		},

		update: {
			params: BookingValidator.update,
			handler: BookingController.update,
		},

		checkStaff: {
			params: BookingValidator.checkStaff,
			handler: BookingController.checkStaff
		}


	},

	methods: {
		randombookingnum() {
			const str = Math.floor(100000 + Math.random() * 900000);
			const stmr = str.toString();
			return stmr;
		},
	},

	created() {	}
};
