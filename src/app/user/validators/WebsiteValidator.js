"use strict";

module.exports = {
    instant_sallon: {
        latitude: {type: "string", min: 1,required: true},
        longitude: {type: "string", min: 1,required: true}
    },
	getvendorbyname: {
		vendorname: {type: "string",min: 1, required: true}
	},
    getvendors: {
        latitude: {type: "string", min: 5, optional: true},
        longitude: {type: "string", min: 5, optional: true},
        service_available: {type: "string", min:1, optional: true}
    },

    near_vendor:{
        latitude: {type: "string", min: 5, optional: true},
        longitude: {type: "string", min: 5, optional: true},
    },

    saloon_getall: {
        isfeatured: {type: "string", min: 1,required: true},
    },

    category_saloons:{
        categoryid: {type: "string", min: 1,optional: true},
    }
}
