"use strict";

module.exports = {
    bodyParsers: {
        json: true,
    },
	path: "/public/",
	onBeforeCall(ctx, route, req, res) {
		// Set request headers to context meta
		ctx.meta.userAgent = req.headers["user-agent"];
		ctx.meta.platform = req.headers["host"];
		ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	},
    authorization: false,
    whitelist: [
		"auth.login",
		"auth.logout",
        "auth.get_language",
        "user.create",
        "user.login",
        "user.verifyUsername",
        "user.verifyMailId",
        "user.forgetpassword",
        "user.changeforgetpassword",
        "user.otp_verify",
        "user.otp_resend",
        "auth.forgetpassword",
        "auth.user_resetPassword",
        "auth.hotel_resetPassword",
        "auth.admin_resetPassword",
        "country.getall",
        "city.getall",
        "area.getall",
        "appconfig.*",
        "upload.create",
        "category.*",
        "service.ourservice",
        "review.create",
        "review.getall",
        "review.get",
		"review.review_count",
		"review.getbycount",
		"review.getbyrating",
        "voucher.getall",
        "voucher.get",
		"service.*",
        "common.*",
		"common.getAll_aboutus",
        "common.add_newsletter",
        "contactus*",
        "city.getAll_Web",
        "pagemanage*",
        "cms.*",
        "vendor.login",
		"vendor.forgetpassword",
		"vendor.changeforgetpassword",
        "vendorauth.*",
        "website.*",
        "vendor.*",
        "adminstaff.*",
        "language.*",
        "common.*",
        "vendorcountry.*",
        "vendorcity.*",
        "vendorarea.*",
        "usercountry.*",
        "usercity.*",
        "userarea.*",
        "contactus.*",
		"partneraccount.*",
		"userbooking.checkStaff",
		"vendorstaff.getAvailaleStaff",
		"payment.splitpaynotification",
		"city.importcity"
    ],
    aliases: {
        // Auth: login only
        "POST login": "auth.login",
        "PUT auth/forgetpassword": "auth.forgetpassword",
        //User: login only
        "POST user/login": "user.login",
        "PUT user/forgetpassword": "user.forgetpassword",
		"PUT user/changeforgetpassword": "user.changeforgetpassword",
		"PUT vendor/changeforgetpassword": "vendor.changeforgetpassword",

		"GET userbooking/checkStaff": "userbooking.checkStaff",

		//splitpay webhook
		"GET payment/splitpay/notify": "payment.splitpaynotification",

        //Hotel: login only
		"POST vendor/login": "vendor.login",
		"POST vendor/signup": "vendor.create",
        "PUT vendor/forgetpassword": "vendor.forgetpassword",

        //vendor
        "POST vendor/create": "vendor.create",

        //category api
        "GET category/getall": "category.getall",
        "GET category/getall_mob": "category.getall_mob",
		"GET category/get": "category.get",

		//import city list
		"GET city/import": "city.importcity",
        //service api
        "GET service/getall": "service.getall",
        "GET service/get": "service.get",
		"GET service/getall_mob": "service.getall_mob",
		"GET service/getall_web": "service.getall_web",

        //Review api's only
        "POST review/create": "review.create",
        "GET review/getall": "review.getall",
        "GET review/review_count": "review.review_count",
		"GET review/get": "review.get",
		"GET review/getbyrating": "review.getbyrating",
		"GET review/getbycount": "review.getbycount",

        //website home page
        "GET website/category_getall": "website.category_getall",
        "GET website/saloon_getall": "website.saloon_getall",
        "GET website/toprating_getall": "website.toprating_getall",
        "GET website/instant_sallon": "website.instant_sallon",
		"GET website/getvendors": "website.getvendors",
		"GET website/getvendorbyname": "website.getvendorbyname",
        "GET website/staff_getall": "website.staff_getall",
        "GET website/service_getall": "website.service_getall",
        "GET website/vendor_get": "website.vendor_get",
        "GET website/vendor_dates": "website.vendor_dates",
        "GET website/category_saloons": "website.category_saloons",
        "GET website/near_vendor": "website.near_vendor",


        // Users: create account only
        "POST user/create": "user.create",
        "PUT auth/reset/admin_reset": "auth.admin_resetPassword",
        "PUT auth/reset/user_reset": "auth.user_resetPassword",
        "POST user/verifyUsername": "user.verifyUsername",
        "GET user/verifymailid": "user.verifyMailId",
        "PUT user/otp_verify": "user.otp_verify",
        "PUT user/otp_resend": "user.otp_resend",
        "PUT auth/reset/hotel_reset": "auth.hotel_resetPassword",

        //staff api's
		"GET adminstaff/getall": "adminstaff.getall",
		"GET adminstaff/getall_service": "adminstaff.getall_service",
        "GET adminstaff/getall_mob": "adminstaff.getall_mob",
        "GET adminstaff/get": "adminstaff.get",
        "GET adminstaff/getall_service_timeslot": "adminstaff.getall_service_timeslot",

        //Category list is shown as public
		"GET category/getall": "category.getall",
		"DELETE logout": "auth.logout",
		"GET admincategory": "category.getalladmincat",

		"GET slot/getavailable":"vendorstaff.getAvailaleStaff",

        //Mutiple File upload
        "POST general/upload": {
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
            //action: "upload.create"
            action: "common.upload_img"

		},
		"POST general/upload_pdf": {
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
			action: "common.upload_pdf"
        },

        //Contactus api's
        "GET auth/get_language": "auth.get_language",
        "GET appconfig/getactive": "appconfig.getactive",
        "GET appconfig/getCMS": "appconfig.getCMS",

        //country Getall api
        "GET country/getall": "country.getall",

        //country Getall api
        "GET city/getall": "city.getall",

        //area Getall api
        "GET area/getall": "area.getall",

        //Cms Getall api
        "GET cms/getall": "pagemanage.getall",

        //ourservice GetAll api
        "GET ourservice/getall": "service.ourservice",

        //voucher api's
        "GET voucher/getall": "voucher.getall",
        "GET voucher/get": "voucher.get",

        //category based hotel
        "GET service/getall": "service.getall",

        "GET aboutus/get": "common.getAll_aboutus",

        //faq getall
        "GET faq/getall": "pagemanage.faqgetAll",

		//news letter subscribtion
        "POST newsletter/subscribe": "common.add_newsletter",

        //contact us (enquiry)
        "POST contactus/user_create": "contactus.user_create",

        "GET language/getall": "language.getall",
        "GET language/getone": "language.getone",

        //Service Available Category api

        "GET common/service_available": "common.service_available",

        //APP and VOUCHER TYPE
        "GET common/getall_vouchertype": "common.getall_vouchertype",
        "GET common/getall_apptype": "common.getall_apptype",

        //cms api's
        "GET common/cms_getall": "common.cms_getall",
        "GET common/cms_get": "common.cms_get",

        //faq api's
        "GET common/faq_getall": "common.faq_getall",
        "GET common/faq_get": "common.faq_get",

        //vendor country
        "GET vendorcountry/getall": "vendorcountry.getall",
        //vendor city
        "GET vendorcity/getall": "vendorcity.getall",
        //vendor area
        "GET vendorarea/getall": "vendorarea.getall",

         //user country
        "GET usercountry/getall": "usercountry.getall",
        //user city
        "GET usercity/getall": "usercity.getall",
        //user area
        "GET userarea/getall": "userarea.getall",

         //partneraccount
         "POST partneraccount/create": "partneraccount.create",
         "POST partneraccount/createnewsalon": "partneraccount.createnewsalon",
         "GET partneraccount/getall": "partneraccount.getall",
         "GET partneraccount/get": "partneraccount.get",
         "PUT partneraccount/status": "partneraccount.status",
         "PUT partneraccount/update": "partneraccount.update",
         "DELETE partneraccount/remove": "partneraccount.remove",
        "POST partneraccount/isemailexist": "partneraccount.isemailexist",
        "GET partneraccount/getvendornumber": "partneraccount.publicgetvendornumber",
        "GET partner/partnerverifyMailId": "partneraccount.partnerverifyMailId",
        "GET partner/getpartneremail": "partneraccount.getpartneremail",
        "GET partner/getpartnerotp": "partneraccount.getpartnerotp",
        "PUT partner/partnerotp_verify": "partneraccount.partnerotp_verify",
    }
}
