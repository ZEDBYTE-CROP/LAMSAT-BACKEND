"use strict";

const Request = require("../mixins/request.mixin");
const SettingsValidator = require("../app/admin/validators/SettingsValidator");
const SettingsController = require("../app/admin/controllers/SettingsController");

module.exports = {
	name: "settings",

	mixins: [
		Request
	 ],

	actions: {
		getall: {
			params: SettingsValidator.getall,
			handler: SettingsController.getall,
		},
		update: {
			params: SettingsValidator.update,
			handler: SettingsController.update,
		},
	},

	methods: {
	},

	created() {	}
};
