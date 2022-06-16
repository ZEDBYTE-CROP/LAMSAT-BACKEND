"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const BookingreportValidator = require("../app/vendor/validators/BookingreportValidator");
const BookingreportController = require("../app/vendor/controllers/BookingreportController");
const img_path = __dirname;

module.exports = {
	name: "vendorbookingreport",

	mixins: [
		Request
	 ],

	actions: {

		getAll: {
			params: BookingreportValidator.getAll,
			handler: BookingreportController.getAll,
		},
		getFilterDate: {
			params: BookingreportValidator.getFilterDate,
			handler: BookingreportController.getFilterDate,
		},
		remove: {
			params: BookingreportValidator.remove,
			handler: BookingreportController.remove,
		},
		getCounts:{
			handler: BookingreportController.getCounts,
		}
	},

	methods: {
	},

	created() {	}
};
