"use strict";

module.exports = {
    create: {
        vendorid: {type: "number", min: 1,required: true},
        categoryid: {type: "number", min: 1,required: true},
        availability: {type: "number", required: true},
        //tax: {type: "number", min: 0,required: true},
        photopath: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        service_staff: "array",
        status: {type: "number", required: true},
        language: "array",
        price: "array"
    },
    update: {
        id: {type: "number", min: 1,required: true},
        vendorid: {type: "number", min: 1,required: true},
        categoryid: {type: "number", min: 1,required: true},
        availability: {type: "number",required: true},
        //tax: {type: "number", min: 0,required: true},
        photopath: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        service_staff: "array",
        status: {type: "number", required: true},
        language: "array",
        price: "array"
    },
    status: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string", required: true},
    },
    remove: {
        id: {type: "string", required: true},
    },
    getAll: {
        vendorid: {type: "string", min: 1, required: true},
        categoryid: {type: "string", min: 1, optional: true},
	},
	getall_mob: {
		vendorid: {type: "string", min: 1, required: true},
        categoryid: {type: "string", min: 1, optional: true},
	},
    get: {
        id: {type: "string", min: 1,required: true},
    },
    getbyid: {
        id: {type: "string", min: 1,required: true},
    },
    getvendorservice: {
        vendorid: {type: "string", min: 1,required: true},
    },
    getVendorStaffService: {
        vendorid: {type: "string", min: 1,required: true},
    },
}
