"use strict";

const ApiGateway = require("moleculer-web");
const Request = require("../mixins/request.mixin");
const NotificationController = require("../app/common/controllers/NotificationController");
const NotificationValidator = require("../app/common/validators/NotificationValidator");

module.exports = {
	name: "notification",

	mixins: [
		Request
	 ],

	actions: {

		getAll: {
			params: NotificationValidator.getAll,
			handler: NotificationController.getAll,
		},
		setviewed: {
			params: NotificationValidator.setviewed,
			handler: NotificationController.setviewed
		},
		setnotificationcount: {
			params: NotificationValidator.setnotificationcount,
			handler: NotificationController.setnotificationcount
		},
		get: {
			params: NotificationValidator.get,
			handler: NotificationController.get
		}
	},

	methods: {

	},

	created() {	}
};
