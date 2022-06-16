"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CityController = require("../app/user/controllers/CityController");
const CityValidator = require("../app/user/validators/CityValidator");
const img_path = __dirname;

module.exports = {
	name: "usercity",

	mixins: [ 
		Request
	 ],

	actions: {
        
		getall: {
			params: CityValidator.getall,
			handler: CityController.getall,
		},

		// get: {
		// 	handler: CityController.get,
		// },

	},

	methods: { 
	},

	created() {	}
};
