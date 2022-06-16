"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const ContactusValidator = require("../app/admin/validators/ContactusValidator");
const ContactusController = require("../app/admin/controllers/ContactusController");

//user files
const ContactusValidatoruser = require("../app/user/validators/ContactusValidator");
const ContactusControlleruser = require("../app/user/controllers/ContactusController");

module.exports = {
	name: "contactus",

	mixins: [ 
		Request
	 ],

	actions: {
        create: {
			params: ContactusValidator.create,
			handler: ContactusController.create,
        },
        user_create: {
			params: ContactusValidatoruser.create,
			handler: ContactusControlleruser.create,
        },
		getall: {
			params: ContactusValidator.getall,
			handler: ContactusController.getall,
		},

		get: {
			params: ContactusValidator.get,
			handler: ContactusController.get,
		},

		status: {
			params: ContactusValidator.status,
			handler: ContactusController.status,
		},

		remove: {
			params: ContactusValidator.remove,
			handler: ContactusController.remove,
		},
	},

	methods: { 
		
	},

	created() {	}
};
