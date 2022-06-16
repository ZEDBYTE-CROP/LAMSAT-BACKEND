"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ReviewValidator = require("../app/vendor/validators/ReviewValidator");
const ReviewController = require("../app/vendor/controllers/ReviewController");
const img_path = __dirname;

module.exports = {
	name: "vendorreview",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: ReviewValidator.create,
			handler: ReviewController.create,
        },

		getall: {
			params: ReviewValidator.getall,
			handler: ReviewController.getall,
		},

		get: {
			params: ReviewValidator.get,
			handler: ReviewController.get,
		},

		review_approval: {
			params: ReviewValidator.review_approval,
			handler: ReviewController.review_approval,
		},

		review_count: {
			params: ReviewValidator.review_count,
			handler: ReviewController.review_count,
		},

		remove: {
			params: ReviewValidator.remove,
			handler: ReviewController.remove,
		}
	},

	methods: {

	},

	created() {	}
};
