"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const BookingValidator = require("../app/admin/validators/BookingValidator");
const BookingController = require("../app/admin/controllers/BookingController");

module.exports = {
	name: "adminbooking",

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

		update: {
			params: BookingValidator.update,
			handler: BookingController.update,
		},

		remove: {
			params: BookingValidator.remove,
			handler: BookingController.remove,
		},
		activity_log:{
			params: BookingValidator.activity_log,
			handler: BookingController.activity_log,
		},
		booking_status: {
			handler: BookingController.booking_status,
		},

		earnings: {
			params: BookingValidator.earnings,
			handler: BookingController.earnings,
		},

		earnings_list: {
			params: BookingValidator.earnings_list,
			handler: BookingController.earnings_list,
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
