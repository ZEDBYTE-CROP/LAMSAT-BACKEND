"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const NewsletterValidator = require("../app/common/validators/NewsletterValidator");
const NewsletterController = require("../app/common/controllers/NewsletterController");
const img_path = __dirname;

module.exports = {
	name: "newsletter",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: NewsletterValidator.create,
			handler: NewsletterController.create,
        },

		getAll: {
			params: NewsletterValidator.getAll,
			handler: NewsletterController.getAll,
		},
		
		get: {
			params: NewsletterValidator.get,
			handler: NewsletterController.get,
		},

		update: {
			params: NewsletterValidator.update,
			handler: NewsletterController.update,
		},

		status: {
			params: NewsletterValidator.status,
			handler: NewsletterController.status,
		},

		remove: {
			params: NewsletterValidator.remove,
			handler: NewsletterController.remove,
		},

		subscriber_getall: {
			handler: NewsletterController.subscriber_getall,
		},

		subscriber_remove: {
			params: NewsletterValidator.subscriber_remove,
			handler: NewsletterController.subscriber_remove,
		},

		subcribers_mail: {
			params: NewsletterValidator.subcribers_mail,
			handler: NewsletterController.subcribers_mail,
		}
	},

	methods: {
	},

	created() {	}
};
