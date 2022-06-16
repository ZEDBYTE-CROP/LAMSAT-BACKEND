"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const RoleValidator = require("../app/admin/validators/RoleValidator");
const RoleController = require("../app/admin/controllers/RoleController");

module.exports = {
	name: "role",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: RoleValidator.create,
			handler: RoleController.create,
		},

		getall: {
			params: RoleValidator.getall,
			handler: RoleController.getall,
		},
		getactive: {
			handler: RoleController.getactive,
		},

		get: {
			params: RoleValidator.get,
			handler: RoleController.get,
		},

		getone: {
			params: RoleValidator.getone,
			handler: RoleController.getone,
		},

		update: {
			params: RoleValidator.update,
			handler: RoleController.update,
		},

		status: {
			params: RoleValidator.status,
			handler: RoleController.status,
		},
		getone: {
			params: RoleValidator.getone,
			handler: RoleController.getone,
		},
		remove: {
			params: RoleValidator.remove,
			handler: RoleController.remove,
		},
	},

	created() {	}
};