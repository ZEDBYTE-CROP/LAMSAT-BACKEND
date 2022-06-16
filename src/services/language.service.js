"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const passwordHash = require('password-hash');
const LanguageValidator = require("../app/common/validators/LanguageValidator");
const LanguageController = require("../app/common/controllers/LanguageController");
module.exports = {
	name: "language",

	mixins: [
		Request
	 ],

	actions: {  
        create: {
			params: LanguageValidator.create,
			handler: LanguageController.create,
		},
        update: {
			params: LanguageValidator.update,
			handler: LanguageController.update,
		},

		getall: {
			params: LanguageValidator.getall,
			handler: LanguageController.getall,
		},

		getone: {
			handler: LanguageController.getone,
		},

		remove: {
			params: LanguageValidator.remove,
			handler: LanguageController.remove,
		},
	},

	created() {	}
};
