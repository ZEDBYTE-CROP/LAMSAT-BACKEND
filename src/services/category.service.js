"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CategoryValidator = require("../app/admin/validators/CategoryValidator");
const CategoryController = require("../app/admin/controllers/CategoryController");
const img_path = __dirname;

module.exports = {
	name: "category",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: CategoryValidator.create,
			handler: CategoryController.create,
        },

		getall: {
			params: CategoryValidator.getall,
			handler: CategoryController.getall,
		},

		getalladmincat: {
			params: CategoryValidator.getalladmincat,
			handler: CategoryController.getalladmincat
		},

		getall_mob: {
			params: CategoryValidator.getall_mob,
			handler: CategoryController.getall_mob,
		},

		get: {
			params: CategoryValidator.get,
			handler: CategoryController.get,
		},

		update: {
			params: CategoryValidator.update,
			handler: CategoryController.update,
		},

		status: {
			params: CategoryValidator.status,
			handler: CategoryController.status,
		},

		remove: {
			params: CategoryValidator.remove,
			handler: CategoryController.remove,
		},

		categoryApprovalReject: {
			params: CategoryValidator.categoryApprovalReject,
			handler: CategoryController.categoryApprovalReject,
		},

		getadmincats: {
			params: CategoryValidator.getadmincats,
			handler: CategoryController.getadmincats,
		},
	},

	methods: {

	},

	created() {	}
};
