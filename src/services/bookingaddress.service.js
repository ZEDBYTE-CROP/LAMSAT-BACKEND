"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const BookingaddressValidator = require("../app/user/validators/BookingaddressValidator");
const BookingaddressController = require("../app/user/controllers/BookingaddressController");
const img_path = __dirname;

module.exports = {
	name: "bookingaddress",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: BookingaddressValidator.create,
			handler: BookingaddressController.create,
        },
        
		getall: {
			params: BookingaddressValidator.getall,
			handler: BookingaddressController.getall,
		},

		get: {
			params: BookingaddressValidator.get,
			handler: BookingaddressController.get,
		},

		update: {
			params: BookingaddressValidator.update,
			handler: BookingaddressController.update,
		},

		remove: {
			params: BookingaddressValidator.remove,
			handler: BookingaddressController.remove,
		},
	},

	methods: { 
		
	},

	created() {	}
};
