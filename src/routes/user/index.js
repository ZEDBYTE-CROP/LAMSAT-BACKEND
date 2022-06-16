"use strict";

const Constants = require("../../../plugin/constants");

const Database = require("../../adapters/Database");
const Op = require('sequelize').Op;
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
var annotations = require('annotations');
//const fs = require('fs');
var Path = require('path');
module.exports = {
    bodyParsers: {
        json: true,
    },
path: "/user/",
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
        "user.*",
        "vendor.*",
        "userreview.*",
        "userbooking.*",
        "bookingaddress.*"
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

        // User: User creation api's only
        "GET user/getAll": "user.getAll",
        "GET user/get": "user.get",
        "GET user/verifyUsername": "user.verifyUsername",
        "GET user/verifyMailId": "user.verifyMailId",
        "PUT user/update": "user.update",
        "PUT user/status": "user.status",
        "PUT user/vendorupdate": "user.vendorupdate",
        "PUT user/profile_update": "user.profile_update",
        "PUT user/changepassword": "user.changepassword",
        "PUT user/adminchangepassword": "user.adminchangepassword",
        "POST user/favvendor": "user.favvendor",
        "GET user/favhotels": "user.favhotels",
        "GET user/validate_voucher": "user.validate_voucher",

        //Activity log
        "GET activitylog/getall": "activitylog.getAll",
        "DELETE activitylog/delete": "activitylog.remove",

		//vendor getall api in listing page
		"GET vendor/getvendorbyname": "vendor.getvendorbyname",
        "GET vendor/getvendors": "vendor.getvendors",
        "GET vendor/vendor_detail": "vendor.vendor_detail",

        //review api's
        "POST userreview/create": "userreview.create",
        "PUT userreview/update": "userreview.update",
        "GET userreview/getall": "userreview.getall",
		"GET userreview/get": "userreview.get",
		"GET userreview/getbycount": "userreview.getbycount",
		"GET userreview/getbyrating": "userreview.getbyrating",

        //booking api's
        "POST userbooking/create": "userbooking.create",
        "GET userbooking/get": "userbooking.get",
        "GET userbooking/getall": "userbooking.getall",
        "DELETE userbooking/remove": "userbooking.remove",
        "GET userbooking/getservice_list": "userbooking.getservice_list",
        "GET userbooking/getcategory_list": "userbooking.getcategory_list",
        "GET userbooking/dashboard": "userbooking.dashboard",
		"GET userbooking/update": "userbooking.update",
		"GET userbooking/cancel": "userbooking.cancel",

        "POST bookingaddress/create": "bookingaddress.create",
        "GET bookingaddress/get": "bookingaddress.get",
        "GET bookingaddress/getall": "bookingaddress.getall",
        "PUT bookingaddress/update": "bookingaddress.update",
        "DELETE bookingaddress/remove": "bookingaddress.remove",

    }

}
