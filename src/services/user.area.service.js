"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const AreaController = require("../app/user/controllers/AreaController");
const AreaValidator = require("../app/user/validators/AreaValidator");
const img_path = __dirname;

module.exports = {
	name: "userarea",

	mixins: [ 
		Request
	 ],

	actions: {
        
		getall: {
			params: AreaValidator.getall,
			handler: AreaController.getall,
		},

		// get: {
		// 	handler: AreaController.get,
		// },
	},

	methods: { 
	},

	created() {	}
};
