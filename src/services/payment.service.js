"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const PaymentController = require("../app/common/controllers/PaymentController");
const PaymentValidator = require("../app/common/validators/PaymentValidator");

module.exports = {
	name: "payment",

	mixins: [
		Request
	 ],

	actions: {
        create: {
			params: PaymentValidator.create,
			handler: PaymentController.create,
		},
		createtnxkey: {
			params: PaymentValidator.createtnxkey,
			handler: PaymentController.createtnxkey
		},
		completetnx: {
			params: PaymentValidator.completetnx,
			handler: PaymentController.completetnx
		},
		splitpaylogin: {
			handler: PaymentController.splitpaylogin
		},
		completepayment: {
			params: PaymentValidator.completepayment,
			handler: PaymentController.completepayment
		},
		completesplitpay: {
			handler: PaymentController.completesplitpay
		},
		splitpaynotification: {
			handler: PaymentController.splitpaynotification
		}
	},

	methods: {

	},

	created() {	}
};
