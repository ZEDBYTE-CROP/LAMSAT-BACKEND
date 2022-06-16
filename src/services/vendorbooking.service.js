"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const BookingValidator = require("../app/vendor/validators/BookingValidator");
const BookingController = require("../app/vendor/controllers/BookingController");
const img_path = __dirname;

module.exports = {
	name: "vendorbooking",

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

		update:{
			params: BookingValidator.update,
			handler: BookingController.update,
		},

		remove: {
			params: BookingValidator.remove,
			handler: BookingController.remove,
		},

		booking_status:{
			handler: BookingController.booking_status,
		},

		booking_count:{
			params: BookingValidator.booking_count,
			handler: BookingController.booking_count
		},

		updateBookingStatus:{
			params: BookingValidator.updateBookingStatus,
			handler: BookingController.updateBookingStatus
		},

		updatePaymentStatus: {
			params: BookingValidator.updatePaymentStatus,
			handler: BookingController.updatePaymentStatus
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
