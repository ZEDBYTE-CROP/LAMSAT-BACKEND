"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
//category api's for vendor
const CategoryValidator = require("../app/vendor/validators/CategoryValidator");
const CategoryController = require("../app/vendor/controllers/CategoryController");
const img_path = __dirname;

module.exports = {
	name: "vendorcategory",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: CategoryValidator.create,
			handler: CategoryController.create,
		},

        update: {
			params: CategoryValidator.update,
			handler: CategoryController.update,
        },
        getall: {
			params: CategoryValidator.getall,
			handler: CategoryController.getall,
        },

        getall: {
			params: CategoryValidator.getall,
			handler: CategoryController.getall,
		},
		remove: {
			params: CategoryValidator.remove,
			handler: CategoryController.remove,
		},
		getallVendor: {
			params: CategoryValidator.getallVendor,
			handler: CategoryController.getallVendor,
		},
		getCatServiceByVendor: {
			params: CategoryValidator.getCatServiceByVendor,
			handler: CategoryController.getCatServiceByVendor,
		},
		getCatServiceByVendorId: {
			params: CategoryValidator.getCatServiceByVendorId,
			handler: CategoryController.getCatServiceByVendorId,
		},
		getCatServiceAllByVendor: {
			params: CategoryValidator.getCatServiceAllByVendor,
			handler: CategoryController.getCatServiceAllByVendor,
		}

	},

	methods: {

	},

	created() {	}
};
