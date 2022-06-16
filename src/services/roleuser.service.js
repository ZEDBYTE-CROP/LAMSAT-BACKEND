"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const RoleuserValidator = require("../app/admin/validators/RoleUserValidator");
const RoleuserController = require("../app/admin/controllers/RoleuserController");

module.exports = {
	name: "roleuser",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: RoleuserValidator.create,
			handler: RoleuserController.create,
		},

		// getAll: {
		// 	params: RoleValidator.getAll,
		// 	handler: RoleController.getAll,
		// },

		// get: {
		// 	params: RoleValidator.get,
		// 	handler: RoleController.get,
		// },

		update: {
			params: RoleuserValidator.update,
			handler: RoleuserController.update,
		},

		status: {
			params: RoleuserValidator.status,
			handler: RoleuserController.status,
		},

		// remove: {
		// 	params: RoleValidator.remove,
		// 	handler: RoleController.remove,
		// },
	},

	created() {	}
};
