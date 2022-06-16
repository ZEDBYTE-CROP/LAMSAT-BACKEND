"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
//const CrudValidator = require("../app/admin/validators/CrudValidator");
const UploadController = require("../app/admin/controllers/UploadController");
const img_path = __dirname;

module.exports = {
	name: "upload",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			handler: UploadController.create,
		},
		upload: {
			handler: UploadController.upload,
		}
	},

	methods: {
		randomName(meta) {
			console.log(meta);
			return Date.now() + "_" + meta.filename;
		}
	},

	created() {	}
};
