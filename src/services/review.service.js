"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ReviewValidator = require("../app/admin/validators/ReviewValidator");
const ReviewController = require("../app/admin/controllers/ReviewController");
const UserReviewController = require("../app/user/controllers/ReviewController");
const UserReviewValidator = require("../app/user/validators/ReviewValidator");

const img_path = __dirname;

module.exports = {
	name: "review",

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

		remove: {
			params: ReviewValidator.remove,
			handler: ReviewController.remove,
		},

		review_approval: {
			params: ReviewValidator.review_approval,
			handler: ReviewController.review_approval,
		},

		admin_list: {
			//params: ReviewValidator.admin_list,
			handler: ReviewController.admin_list,
		},

		review_count: {
			params: ReviewValidator.review_count,
			handler: ReviewController.review_count,
		},

		user_reviews: {
			params: ReviewValidator.user_reviews,
			handler: ReviewController.user_reviews,
		},

		vendor_reviews: {
			params: ReviewValidator.vendor_reviews,
			handler: ReviewController.vendor_reviews,
		},

		getbycount: {
			params: UserReviewValidator.getbycount,
			handler: UserReviewController.getbycount,
		},
		getbyrating: {
			params: UserReviewValidator.getbyrating,
			handler: UserReviewController.getbyrating,
		}
	},

	methods: {

	},

	created() {	}
};
