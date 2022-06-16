"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const SocialMediaValidator = require("../app/admin/validators/SocialMediaValidator");
const SocialMediaController = require("../app/admin/controllers/SocialMediaController");
const img_path = __dirname;

module.exports = {
	name: "socialmedia",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: SocialMediaValidator.create,
			handler: SocialMediaController.create,
        },

		getall: {
			params: SocialMediaValidator.getall,
			handler: SocialMediaController.getall,
		},
		
		update: {
			params: SocialMediaValidator.update,
			handler: SocialMediaController.update,
		},
		remove: {
			params: SocialMediaValidator.remove,
			handler: SocialMediaController.remove,
		},	
	},

	methods: {

	},

	created() {	}
};
