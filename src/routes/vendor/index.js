"use strict";

const Constants = require("../../../plugin/constants");

const Database = require("../../adapters/Database");
const Op = require('sequelize').Op;
const Sequ = require("sequelize");
var annotations = require('annotations');
//const fs = require('fs');
var Path = require('path');
module.exports = {
    bodyParsers: {
        json: true,
    },
path: "/vendor/",
onBeforeCall(ctx, route, req, res) {
		// Set request headers to context meta
		ctx.meta.userAgent = req.headers["user-agent"];
		ctx.meta.platform = req.headers["host"];
		ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    },
   /*onAfterCall(ctx, route, req, res) {
        console.log('------------------------------------');
        console.log( 'ctxxxxxxxxx22222222',ctx.params.req.originalUrl);
        console.log('------------------------------------');
    },*/
    roles: [Constants.ADMIN_ROLE],
    authorization: true,
    whitelist: [
        "hotelstatus.*",
        "category.*",
        "vendorcategory.*",
        "service.*",
        "vendor.*",
        "vendorbooking.*",
        "vendorbookingreport.*",
        "module*",
        "upload.create",
        "vendorvoucher.*",
        "vendorservice.*",
        "vendorstaff.*",
        "vendorreview.*",
        "vendorpackage.*"
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
        // vendor api's
        "GET vendor/get": "vendor.get",
        "PUT vendor/update": "vendor.update",
        "GET vendor/images": "vendor.images",
        "DELETE vendor/imageremove": "vendor.imageremove",
        "PUT vendor/changepassword": "vendor.changepassword",
        "GET vendor/timeget": "vendor.timeget",
        "PUT vendor/timeupdate": "vendor.timeupdate",
        "DELETE vendor/logout": "vendor.logout",
        "GET vendor/vendorTimeget": "vendor.vendorTimeget",
        "PUT vendor/timeupdates": "vendor.timeupdates",
        "GET vendor/vendortimeGetall": "vendor.vendortimeGetall",



        //vendor voucher creation's
        "POST vendorvoucher/create": "vendorvoucher.create",
        "GET vendorvoucher/getall": "vendorvoucher.getall",
        "PUT vendorvoucher/update": "vendorvoucher.update",
        "DELETE vendorvoucher/remove": "vendorvoucher.remove",
        "GET vendorvoucher/voucher_code": "vendorvoucher.voucher_code",
        "PUT vendorvoucher/status": "vendorvoucher.status",
        "GET vendorvoucher/get": "vendorvoucher.get",

        // Category: Category creation api's only
        "POST category/create": "vendorcategory.create",
        "PUT category/update": "vendorcategory.update",
        "GET category/getall": "vendorcategory.getall",
        "POST category/getallVendor": "vendorcategory.getallVendor",
		"GET category/getCatServiceByVendor": "vendorcategory.getCatServiceByVendor",
		"GET category/getCatServiceByVendorId": "vendorcategory.getCatServiceByVendorId",
		"GET category/getCatServiceAllByVendor": "vendorcategory.getCatServiceAllByVendor",

        //voucher: voucher api's only
        "POST voucher/create": "voucher.create",
        "GET voucher/getAll": "voucher.getAll",
        "GET voucher/voucher_code": "voucher.voucher_code",
        "GET voucher/get": "voucher.get",
        "GET voucher/coupon_get": "voucher.coupon_get",
        "PUT voucher/update": "voucher.update",
        "DELETE voucher/delete": "voucher.remove",
        "GET getall_apptype": "voucher.getall_apptype",
        "GET get_apptype": "voucher.get_apptype",
        "GET getall_vouchertype": "voucher.getall_vouchertype",
        "GET get_vouchertype": "voucher.get_vouchertype",

         //Booking: vendorbooking api's only
         "GET vendorbooking/getall": "vendorbooking.getall",
         "GET vendorbooking/get": "vendorbooking.get",
         "PUT vendorbooking/update": "vendorbooking.update",
         "GET vendorbooking/booking_status": "vendorbooking.booking_status",
         "GET vendorbooking/booking_count": "vendorbooking.booking_count",
         "DELETE vendorbooking/remove": "vendorbooking.remove",
		 "PUT vendorbooking/updateBookingStatus": "vendorbooking.updateBookingStatus",
		 "PUT vendorbooking/updatePaymentStatus": "vendorbooking.updatePaymentStatus",

		//vendor booking report api's
        "GET vendorreport/getall": "vendorbookingreport.getAll",
        "GET vendorreport/getFilterDate": "vendorbookingreport.getFilterDate",
        //vendor service api's
        "POST vendorservice/create": "vendorservice.create",
        "PUT vendorservice/status": "vendorservice.status",
        "PUT vendorservice/update": "vendorservice.update",
        "DELETE vendorservice/delete": "vendorservice.remove",
        "GET vendorservice/getall": "vendorservice.getall",
        "GET vendorservice/get": "vendorservice.get",
        "GET vendorservice/getbyid": "vendorservice.getbyid",
        "GET vendorservice/getall_mob": "vendorservice.getall_mob",
        "GET vendorservice/getvendorservice": "vendorservice.getvendorservice",
        "GET vendorservice/getVendorStaffService": "vendorservice.getVendorStaffService",
        //Activity log
        "GET activitylog/getall": "activitylog.getAll",
        "DELETE activitylog/delete": "activitylog.remove",

        //staff creation api's
        "POST vendorstaff/create": "vendorstaff.create",
        "PUT vendorstaff/status": "vendorstaff.status",
        "PUT vendorstaff/update": "vendorstaff.update",
        "DELETE vendorstaff/remove": "vendorstaff.remove",
        "GET vendorstaff/getall": "vendorstaff.getall",
        "GET vendorstaff/getall_mob": "vendorstaff.getall_mob",
        "GET vendorstaff/get": "vendorstaff.get",

        //review api's
        "POST vendorreview/create": "vendorreview.create",
        "GET vendorreview/getall": "vendorreview.getall",
        "GET vendorreview/get": "vendorreview.get",
        "PUT vendorreview/review_approval": "vendorreview.review_approval",
        "GET vendorreview/review_count": "vendorreview.review_count",
        "DELETE vendorreview/remove": "vendorreview.remove",

        //package api's
        "POST vendorpackage/create": "vendorpackage.create",
        "GET vendorpackage/getall": "vendorpackage.getall",
        "GET vendorpackage/get": "vendorpackage.get",
        "PUT vendorpackage/update": "vendorpackage.update",
        "PUT vendorpackage/status": "vendorpackage.status",
        "DELETE vendorpackage/remove": "vendorpackage.remove",
    }

}
