"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const PartneraccountValidator = require("../app/common/validators/PartneraccountValidator");
const PartneraccountController = require("../app/common/controllers/PartneraccountController");
const img_path = __dirname;

module.exports = {
	name: "partneraccount",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: PartneraccountValidator.create,
			handler: PartneraccountController.create,
		},
		
		createnewsalon: {
			params: PartneraccountValidator.createnewsalon,
			handler: PartneraccountController.createnewsalon,
        },

		getall: {
			params: PartneraccountValidator.getall,
			handler: PartneraccountController.getall,
		},

		get: {
			params: PartneraccountValidator.get,
			handler: PartneraccountController.get,
		},

		update: {
			params: PartneraccountValidator.update,
			handler: PartneraccountController.update,
		},

		status: {
			params: PartneraccountValidator.status,
			handler: PartneraccountController.status,
		},

		remove: {
			params: PartneraccountValidator.remove,
			handler: PartneraccountController.remove,
		},
		isemailexist: {
			params: PartneraccountValidator.isemailexist,
			handler: PartneraccountController.isemailexist
		},
		updateapplystatus: {
			params: PartneraccountValidator.updateapplystatus,
			handler: PartneraccountController.updateapplystatus
		},
		updatesalonapproval: {
			params: PartneraccountValidator.updatesalonapproval,
			handler: PartneraccountController.updatesalonapproval
		},
		publicgetvendornumber: {
			handler: PartneraccountController.publicgeneratevendornumber
		},

		partnerverifyMailId: {
			params: PartneraccountValidator.partnerverifyMailId,
			handler: PartneraccountController.partnerverifyMailId
		},

		getpartneremail: {
			params: PartneraccountValidator.getpartneremail,
			handler: PartneraccountController.getpartneremail
		},

		getpartnerotp: {
			params: PartneraccountValidator.getpartnerotp,
			handler: PartneraccountController.getpartnerotp
		},

		partnerotp_verify: {
			params: PartneraccountValidator.partnerotp_verify,
			handler: PartneraccountController.partnerotp_verify
		},
	},

	methods: {
		generateHash(value) {

			return Promise.resolve(passwordHash.generate(value, {algorithm: 'sha256'}))
				.then( (res) => this.requestSuccess("Password Encrypted", res) );
		}
	},

	created() {	}
};
