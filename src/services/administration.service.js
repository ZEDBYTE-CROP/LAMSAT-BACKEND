"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const AdministrationValidator = require("../app/admin/validators/AdministrationValidator");
const AdministrationController = require("../app/admin/controllers/AdministrationController");
module.exports = {
	name: "administration",

	mixins: [
		Request
	 ],

	actions: {  
        create: {
			params: AdministrationValidator.create,
			handler: AdministrationController.create,
		},
        update: {
			params: AdministrationValidator.update,
			handler: AdministrationController.update,
		},

		getall: {
			params: AdministrationValidator.getall,
			handler: AdministrationController.getall,
		},

		getone: {
			params: AdministrationValidator.getone,
			handler: AdministrationController.getone,
		},
		admin_profile: {
			params: AdministrationValidator.admin_profile,
			handler: AdministrationController.admin_profile
		},
/*
		update: {
			params: AdministrationValidator.update,
			handler: AdministrationController.update,
		},

		status: {
			params: AdministrationValidator.status,
			handler: AdministrationController.status,
		},*/

		remove: {
			params: AdministrationValidator.remove,
			handler: AdministrationController.remove,
		},

		booking_counts:{
			handler: AdministrationController.booking_counts
		}
	},

	created() {	}
};
