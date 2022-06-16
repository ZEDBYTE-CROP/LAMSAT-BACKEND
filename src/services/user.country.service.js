"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CountryController = require("../app/user/controllers/CountryController");
const img_path = __dirname;

module.exports = {
	name: "usercountry",

	mixins: [ 
		Request
	 ],

	actions: {
    
		getall: {
			handler: CountryController.getall,
		},

		// get: {
		// 	handler: CountryController.get,
		// },

	},

	methods: { 
		
	},

	created() {	}
};
