"use strict";

module.exports = {
    create: {
        vat: "number"
    },
    getAll_discount: {
        status: "string"
    },
    getAll_paymentmethod: {
        status: "string"
    },
    getAll: {
        status: "string"
    },
    get: {
        id: "string",
        status: "string"
    },
    get_discounttype: {
        id: "string",
        status: "string"
    },
    get_paymentmethod: {
        id: "string",
        status: "string"
	},
	getAll_aboutus: {
		status: "string"
	},
	add_newsletter: {
		email: "string"
	},
    remove: {
        id: "string"
    },
    
    smtp_getall: {
        status: "string"
    },
    sms_getall: {
        status: "string"
    },
    
    cms_get:{
        id: {type:"string", min:1, required: true}
    },

    faq_get:{
        id: {type:"string", min:1, required: true}
    }
    
}