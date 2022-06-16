"use strict";

const Constants = require("../../../plugin/constants");

const Database = require("../../adapters/Database");
const Op = require("sequelize").Op;
const Sequ = require("sequelize");

//Models
const Role = new Database("Mrole");
const Permission = new Database("Mpermission");

const Permissionfilt = new Database("Mpermission",[
	"id",
	"permissionkey",
	"roleid",
	"moduleid",
	"access",
	"status"
]);
let annotations = require("annotations");
//const fs = require('fs');
let Path = require("path");
module.exports = {
	bodyParsers: {
		json: true,
	},
	path: "/admin/",
	onBeforeCall(ctx, route, req, res) {
		// Set request headers to context meta
		ctx.meta.userAgent = req.headers["user-agent"];
		ctx.meta.platform = req.headers["host"];
		ctx.meta.clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	},
	/*onAfterCall(ctx, route, req, res) {
        console.log('------------------------------------');
        console.log( 'ctxxxxxxxxx22222222',ctx.params.req.originalUrl);
        console.log('------------------------------------');
    },*/
	roles: [Constants.ADMIN_ROLE],
	authorization: true,
	whitelist: [
		"user.*",
		"country.*",
		"city.*",
		"area.*",
		"category.*",
		"service.*",
		"review.*",
		"activitylog.*",
		"adminstaff.*",
		"adminshift.*",
		"voucher.*",
		"langauge.*",
		"adminvendor.*",
		"appconfig.*",
		"socialmedia.*",
		"sms.*",
		"smtp.*",
		"pagemanage.*",
		"faqmanage.*",
		"auth.*",
		"administration.*",
		"role.*",
		"contactus.*",
		"adminuser.*",
		"adminbooking.*",
		"bookingreport.*",
		"adminpackage.*",
		"partneraccount.*",
		"settings.*",
		"vat.*"
	],
	aliases: {
		// File upload from HTML form and overwrite busboy config
		"POST upload": {
			type: "multipart",
			// Action level busboy config
			busboyConfig: {
				limits: {
					files: 1
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
			action: "upload.create"
		},
		//auth api's
		"DELETE logout": "auth.logout",
		"PUT auth/changepassword": "auth.changepassword",
		// User: User creation api's only
		"GET user/getall": "user.getall",
		"GET user/get": "user.get",
		"GET user/verifyUsername": "user.verifyUsername",
		"PUT user/update": "user.update",
		"PUT user/status": "user.status",
		"DELETE user/delete": "user.remove",
		"PUT user/vendorupdate": "user.vendorupdate",
		"POST user/orgcreate": "user.orgcreate",
		"PUT user/profile_update": "user.profile_update",

		//Vat api
		"GET vat/get" : "vat.get",
		"PUT vat/update" : "vat.update",

		// Category: Category creation api's only
		"POST category/create": "category.create",
		"PUT category/status": "category.status",
		"PUT category/update": "category.update",
		"DELETE category/remove": "category.remove",
		"PUT category/categoryApprovalReject": "category.categoryApprovalReject",
		"GET category/getadmincats": "category.getadmincats",

		// Country: country creation api's only
		"POST country/create": "country.create",
		"GET country/getall": "country.getall",
		"GET country/get": "country.get",
		"PUT country/status": "country.status",
		"PUT country/update": "country.update",
		"DELETE country/delete": "country.remove",

		// City: city creation api's only
		"POST city/create": "city.create",
		"GET city/getall": "city.getall",
		"GET city/get": "city.get",
		"PUT city/status": "city.status",
		"PUT city/update": "city.update",
		"DELETE city/delete": "city.remove",

		// Area: area creation api's only
		"POST area/create": "area.create",
		"GET area/getall": "area.getall",
		"GET area/get": "area.get",
		"PUT area/status": "area.status",
		"PUT area/update": "area.update",
		"DELETE area/delete": "area.remove",

		// service: Service api's only
		"POST service/create": "service.create",
		"PUT service/status": "service.status",
		"PUT service/update": "service.update",
		"DELETE service/remove": "service.remove",
		"PUT service/serviceApprovalReject": "service.serviceApprovalReject",

		// review: review api's only
		"POST review/create": "review.create",
		"GET review/getall": "review.getall",
		"GET review/get": "review.get",
		"DELETE review/remove": "review.remove",
		"PUT review/review_approval": "review.review_approval",
		"GET review/user_review": "review.user_reviews",
		"GET review/vendor_reviews": "review.vendor_reviews",
		"GET review/admin": "review.admin_list",

		//staff creation api's
		"POST adminstaff/create": "adminstaff.create",
		"PUT adminstaff/status": "adminstaff.status",
		"PUT adminstaff/update": "adminstaff.update",
		"DELETE adminstaff/remove": "adminstaff.remove",
		"GET adminstaff/getalltime": "adminstaff.getalltime",

		//voucher api's
		"POST voucher/create": "voucher.create",
		"GET voucher/getall": "voucher.getall",
		"PUT voucher/update": "voucher.update",
		"DELETE voucher/remove": "voucher.remove",
		"GET voucher/voucher_code": "voucher.voucher_code",
		"PUT voucher/status": "voucher.status",
		"GET voucher/get": "voucher.get",
		"GET voucher/validate_voucher": "voucher.validate_voucher",
		//shift creation api's
		"POST adminshift/create": "adminshift.create",
		"GET adminshift/getall": "adminshift.getall",
		"PUT adminshift/update": "adminshift.update",
		"DELETE adminshift/remove": "adminshift.remove",

		//Voendor API's
		"POST adminvendor/create": "adminvendor.create",
		"GET adminvendor/get": "adminvendor.get",
		"GET adminvendor/getall": "adminvendor.getall",
		"PUT adminvendor/update": "adminvendor.update",
		"PUT adminvendor/status": "adminvendor.status",
		"DELETE adminvendor/remove": "adminvendor.remove",
		"PUT adminvendor/changepassword": "adminvendor.changepassword",
		"GET adminvendor/timeget": "adminvendor.timeget",
		"PUT adminvendor/timeupdate": "adminvendor.timeupdate",
		"GET adminvendor/images": "adminvendor.images",
		"DELETE adminvendor/imageremove": "adminvendor.imageremove",
		"GET adminvendor/adminvendortimeGetall": "adminvendor.adminvendortimeGetall",
		"GET adminvendor/getallsalon": "adminvendor.getallsalon",

		//Activity log
		"GET activitylog/getall": "activitylog.getall",
		"DELETE activitylog/remove": "activitylog.remove",

		//appconfig api's
		"POST appconfig/create": "appconfig.create",
		"GET appconfig/get": "appconfig.get",
		"PUT appconfig/update": "appconfig.update",

		//social media
		//"POST socialmedia/create": "socialmedia.create",
		"GET socialmedia/getall": "socialmedia.getall",
		"GET socialmedia/get": "socialmedia.get",
		"PUT socialmedia/update": "socialmedia.update",
		//"DELETE socialmedia/remove": "socialmedia.remove",

		//SMTP
		"GET smtp/getall": "smtp.getall",
		"PUT smtp/update": "smtp.update",

		//SMS
		"GET sms/getall": "sms.getall",
		"PUT sms/update": "sms.update",
		"GET sms/sendsms": "sms.sendsms",

		//cms (page mangaement api)
		"POST pagemanage/create": "pagemanage.create",
		"GET pagemanage/getall": "pagemanage.getall",
		"GET pagemanage/get": "pagemanage.get",
		"PUT pagemanage/status": "pagemanage.status",
		"PUT pagemanage/update": "pagemanage.update",
		"DELETE pagemanage/remove": "pagemanage.remove",

		//faq api
		"POST faqmanage/create": "faqmanage.create",
		"GET faqmanage/getall": "faqmanage.getall",
		"GET faqmanage/get": "faqmanage.get",
		"PUT faqmanage/status": "faqmanage.status",
		"PUT faqmanage/update": "faqmanage.update",
		"DELETE faqmanage/remove": "faqmanage.remove",


		// administration: administration creation api's only
		"POST administrator/create": "administration.create",
		"POST administrator/update": "administration.update",
		"POST administrator/getall": "administration.getall",
		"GET administrator/getone": "administration.getone",
		"DELETE administrator/remove": "administration.remove",
		"PUT administrator/admin_profile": "administration.admin_profile",

		//Dashboard Booking Count's
		"GET administration/booking_counts": "administration.booking_counts",

		//roleapi
		"POST role/create": "role.create",
		"GET role/getall": "role.getall",
		"GET role/status": "role.status",
		"GET role/getone": "role.getone",
		"GET role/getactive": "role.getactive",
		"GET role/get": "role.get",
		"PUT role/update": "role.update",
		"DELETE role/remove": "role.remove",

		//contact us api
		"POST contactus/create": "contactus.create",
		"GET contactus/getall": "contactus.getall",
		"PUT contactus/status": "contactus.status",
		"GET contactus/get": "contactus.get",
		"DELETE contactus/delete": "contactus.remove",

		//user api
		//cms (page mangaement api)
		"POST adminuser/create": "adminuser.create",
		"GET adminuser/getall": "adminuser.getall",
		"GET adminuser/get": "adminuser.get",
		"PUT adminuser/status": "adminuser.status",
		"PUT adminuser/update": "adminuser.update",
		"DELETE adminuser/remove": "adminuser.remove",

		//booking api's
		"POST adminbooking/create": "adminbooking.create",
		"GET adminbooking/get": "adminbooking.get",
		"GET adminbooking/getall": "adminbooking.getall",
		"GET adminbooking/booking_status": "adminbooking.booking_status",
		"PUT adminbooking/update": "adminbooking.update",
		"DELETE adminbooking/remove": "adminbooking.remove",

		//booking report api's
		"GET report/getall": "bookingreport.getAll",
		"GET report/getFilterDate": "bookingreport.getFilterDate",

		//package api's
		"POST adminpackage/create": "adminpackage.create",
		"GET adminpackage/getall": "adminpackage.getall",
		"GET adminpackage/get": "adminpackage.get",
		"PUT adminpackage/status": "adminpackage.status",
		"PUT adminpackage/update": "adminpackage.update",
		"DELETE adminpackage/remove": "adminpackage.remove",

		//partner api's
		"POST partneraccount/updateapplystatus": "partneraccount.updateapplystatus",
		"POST partneraccount/updatesalonapproval": "partneraccount.updatesalonapproval",

		//Settings
		"GET settings/getall": "settings.getall",
		"PUT settings/update": "settings.update"

	}

};
