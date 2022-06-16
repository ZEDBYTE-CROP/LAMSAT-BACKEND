"use strict";

const Constants = require("../../../plugin/constants");
module.exports = {
    bodyParsers: {
        json: true,
        urlencoded: false

    },
	path: "/common/",
	onBeforeCall(ctx, route, req, res) {
		// Set request headers to context meta
		ctx.meta.userAgent = req.headers["user-agent"];
		ctx.meta.platform = req.headers["host"];
		ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	},
    roles: [Constants.ADMIN_ROLE, Constants.USER_ROLE],
    authorization: true,
    whitelist: [
        "auth.countSessions",
        "auth.admin_profile",
        "auth.vendor_list",
        "auth.vendor_pending_list",
        "auth.vendor_request",
        "auth.closeAllSessions",
        "auth.logout",
        "users.getAll",
        "users.get",
        "users.changeInfo",
        "login.user_changePassword",
        // "login.hotel_changePassword",
        "users.remove",
		"upload.create",
		"upload.upload",
		"upload.upload",
        "common.*",
		"auth.*",
        "package.*",
        "newsletter.*",
		"language.*",
        "payment.*",
        "notification.*"
    ],
    aliases: {
		//payment API
		"POST createtnxkey": "payment.createtnxkey",
		"POST checkoutinit": "payment.create",
		"POST completetnx": "payment.completetnx",
		"POST splitpay":"payment.splitpaylogin",
		"POST completepayment":"payment.completepayment",
		"GET completesplitpay": "payment.completesplitpay",
        //Admin profile update
        "PUT admin_profile": "auth.admin_profile",

        // Auth: Session Controls only
        "GET sessions": "auth.countSessions",

        "DELETE sessions": "auth.closeAllSessions",

        // APP configurations api only
        "POST app_config": "auth.app_configcreate",
        "PUT app_configupdate": "auth.app_configupdate",
        "GET app_configget": "auth.app_configget",
        "DELETE logout": "auth.logout",


        // Users: Actions on Users that does not need priviledges
        "GET users": "users.getAll",
        "GET user/:username": "users.get",
        "PUT user/change/infos": "users.changeInfo",
        "PUT admin/change/password": "login.changePassword",
        "PUT user/change/password": "login.user_changePassword",
        // "PUT hotel/change/password": "login.hotel_changePassword",
        "DELETE user": "users.remove",
        "GET vendor_list": "auth.vendor_list",
        "GET vendor_pending_list": "auth.vendor_pending_list",
        "PUT vendor_request": "auth.vendor_request",

		"PUT upload": "upload.create",
		"PUT pdfupload": "upload.upload",

        //list of common api's
        "POST vat/create": "common.create",
        "GET vat/get": "common.get",
        "GET vat/getAll": "common.getAll",
        "GET discounttype/getAll": "common.getAll_discount",
        "GET paymentmethod/getAll": "common.getAll_paymentmethod",
        "GET discounttype/get": "common.get_discounttype",
		"GET paymentmethod/get": "common.get_paymentmethod",
		"DELETE vat/remove": "common.remove",
        "GET common/dashboard_count": "common.dashboard_count",

        //Dashboard Counts
        "GET common/dashboard": "common.dashboard_counts",
        "GET common/vendordashboard": "common.vendordashboard",
        //SMTP
        "GET common/smtp_getall": "common.smtp_getall",

        //SMS
        "GET common/sms_getall": "common.sms_getall",

        //SOCIAL MEDIA
        "GET common/social_getall": "common.social_getall",
		//Package
		"POST package/create": "package.create",
		"GET package/getall": "package.getAll",
		"DELETE package/remove":"package.remove",
		"PUT package/update": "package.update",
		"GET package/get": "package.get",
        "GET package/admingetall": "package.admin_getAll",

        //Newsletter
		"POST newsletter/create": "newsletter.create",
		"GET newsletter/getall": "newsletter.getAll",
		"DELETE newsletter/remove":"newsletter.remove",
		"PUT newsletter/update": "newsletter.update",
        "GET newsletter/get": "newsletter.get",
        "GET newsletter/subscribers": "newsletter.subscriber_getall",
        "DELETE newsletter/subscriber_remove": "newsletter.subscriber_remove",
        "GET newsletter/subcribers_mail": "newsletter.subcribers_mail",

        //Notification API
		"GET notifications": "notification.getAll",
        "GET notifications/setview": "notification.setviewed",
        "GET notifications/setnotificationcount": "notification.setnotificationcount",
		"GET notifications/get": "notification.get",

        //language create
        "POST language/create": "language.create",
        "PUT language/update": "language.update",
        "GET language/getall": "language.getall",
        "GET language/getone": "language.getone",
        "DELETE language/remove": "language.remove",
		"GET getnumber": "common.getvendornumber",
        //APP and VOUCHER TYPE
        "GET common/getall_vouchertype": "common.getall_vouchertype",
        "GET common/getall_apptype": "common.getall_apptype",
        //Mutiple File upload
        "POST common/upload_img": {
			type: "multipart",
			// Action level busboy config
			busboyConfig: {
				limits: {
					files: 10
				},
				onPartsLimit(busboy, alias, svc) {
					this.logger.info("Busboy parts limit!", busboy);
				},
				onFilesLimit(busboy, alias, svc) {
					this.logger.info("Busboy file limit!", busboy);
				},
				onFieldsLimit(busboy, alias, svc) {
					this.logger.info("Busboy fields limit!", busboy);
				}
			},
			action: "common.upload_img",
            passReqResToParams: true
		},
		"POST common/upload_pdf": {
			type: "multipart",
			// Action level busboy config
			busboyConfig: {
				limits: {
					files: 10
				},
				onPartsLimit(busboy, alias, svc) {
					this.logger.info("Busboy parts limit!", busboy);
				},
				onFilesLimit(busboy, alias, svc) {
					this.logger.info("Busboy file limit!", busboy);
				},
				onFieldsLimit(busboy, alias, svc) {
					this.logger.info("Busboy fields limit!", busboy);
				}
			},
			action: "common.upload_pdf",
            passReqResToParams: true
        },
		"GET common/saloon_getall": "common.saloon_getall",
    }
}
