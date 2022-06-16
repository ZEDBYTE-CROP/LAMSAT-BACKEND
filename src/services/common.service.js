"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const CommonValidator = require("../app/common/validators/CommonValidator");
const CommonController = require("../app/common/controllers/CommonController");
const img_path = __dirname;

module.exports = {
	name: "common",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: CommonValidator.create,
			handler: CommonController.create,
        },

		getAll: {
			params: CommonValidator.getAll,
			handler: CommonController.getAll,
		},
		getAll_discount: {
			params: CommonValidator.getAll_discount,
			handler: CommonController.getAll_discount,
		},

		getAll_paymentmethod: {
			params: CommonValidator.getAll_paymentmethod,
			handler: CommonController.getAll_paymentmethod,
		},

		upload_img:{
			handler: CommonController.upload_img,
		},
		upload_pdf: {
			handler: CommonController.upload_pdf,
		},
		get: {
			params: CommonValidator.get,
			handler: CommonController.get,
		},

		get_discounttype: {
			params: CommonValidator.get_discounttype,
			handler: CommonController.get_discounttype,
		},

		get_paymentmethod: {
			params: CommonValidator.get_paymentmethod,
			handler: CommonController.get_paymentmethod,
		},
		getAll_aboutus: {
			params: CommonValidator.getAll_aboutus,
			handler: CommonController.getAll_aboutus,
		},
		add_newsletter: {
			params: CommonValidator.add_newsletter,
			handler: CommonController.add_newsletter,
		},
		remove: {
			params: CommonValidator.remove,
			handler: CommonController.remove,
		},

		social_getall: {
			params: CommonValidator.social_getall,
			handler: CommonController.social_getall,
		},

		sms_getall: {
			params: CommonValidator.sms_getall,
			handler: CommonController.sms_getall,
		},

		smtp_getall: {
			params: CommonValidator.smtp_getall,
			handler: CommonController.smtp_getall,
		},

		getall_apptype:{
			handler: CommonController.getall_apptype,
		},
		getall_vouchertype:{
			handler: CommonController.getall_vouchertype,
		},

		cms_getall: {
			handler: CommonController.cms_getall,
		},

		cms_get: {
			params: CommonValidator.cms_get,
			handler: CommonController.cms_get,
		},

		faq_getall: {
			handler: CommonController.faq_getall,
		},

		faq_get: {
			params: CommonValidator.faq_get,
			handler: CommonController.faq_get,
		},
		saloon_getall:{
			handler: CommonController.saloon_getall
		},
		dashboard_count: {
			handler: CommonController.dashboard_counts
		},
		vendordashboard: {
			handler: CommonController.vendordashboard
		},
		service_available:{
			handler: CommonController.service_available
		},
		getvendornumber:{
			handler: CommonController.generatevendornumber
		}
	},

	methods: {
		randomName(meta) {
			return Date.now() + "_" + meta.filename;
		}
	},

	created() {	}
};
