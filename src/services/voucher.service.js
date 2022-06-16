"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const Busboy = require("busboy");
const pipe = require("pipe");
const fs = require("fs");
const passwordHash = require('password-hash');
const VoucherValidator = require("../app/admin/validators/VoucherValidator");
const VoucherController = require("../app/admin/controllers/VoucherController");
const img_path = __dirname;

module.exports = {
	name: "voucher",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: VoucherValidator.create,
			handler: VoucherController.create,
        },

		getall: {
			params: VoucherValidator.getall,
			handler: VoucherController.getall,
		},

		get: {
			params: VoucherValidator.get,
			handler: VoucherController.get,
		},

		coupon_get: {
			params: VoucherValidator.coupon_get,
			handler: VoucherController.coupon_get,
		},

		update: {
			params: VoucherValidator.update,
			handler: VoucherController.update,
		},

		status: {
			params: VoucherValidator.status,
			handler: VoucherController.status,
		},

		remove: {
			params: VoucherValidator.remove,
			handler: VoucherController.remove,
		},

		voucher_code: {
			handler: VoucherController.voucher_code,
		},

		validate_voucher: {
			params: VoucherValidator.validate_voucher,
			handler: VoucherController.validate_voucher
		}
	},

	methods: {

	},

	created() {	}
};
