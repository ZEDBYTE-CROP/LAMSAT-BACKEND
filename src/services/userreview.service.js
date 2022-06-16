"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const ReviewValidator = require("../app/user/validators/ReviewValidator");
const ReviewController = require("../app/user/controllers/ReviewController");
const img_path = __dirname;

module.exports = {
	name: "userreview",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: ReviewValidator.create,
			handler: ReviewController.create,
        },
		update:{
			params: ReviewValidator.update,
			handler: ReviewController.update,			
		},
		getall: {
			params: ReviewValidator.getall,
			handler: ReviewController.getall,
		},

		get: {
			params: ReviewValidator.get,
			handler: ReviewController.get,
		},
		getbycount: {
			params: ReviewValidator.getbycount,
			handler: ReviewController.getbycount,
		},
		getbyrating: {
			params: ReviewValidator.getbyrating,
			handler: ReviewController.getbyrating,
		}
	},

	methods: {

	},

	created() {	}
};
