"use strict";

module.exports = {
    create: {
        vendorid: {type: "number", min: 1, required: true},
        categoryid: {type: "number", min: 1, required: true},
        package_available: {type: "number", min: 1, required: true},
        service_id: "array",
		packagecost: {type: "number", min: 1, required: true},
        status: {type: "number", min: 1, required: true},
		language: "array",
		image_url: {type: "string", min: 8, required: true},
        photopath: {type: "string", min: 8, required: true},
    },
    getall: {
        vendorid: {type: "string", min:1, optional: true},
        status: {type: "string", optional: true},
    },
    get: {
        id: {type: "string", min:1, required: true},
        status: {type: "string", optional: true},
    },
    update: {
        id: {type: "number", min:1, required: true},
        vendorid: {type: "number", min: 1, required: true},
        categoryid: {type: "number", min: 1, required: true},
        package_available: {type: "number", min: 1, required: true},
        service_id: "array",
		packagecost: {type: "number", min: 1, required: true},
        status: {type: "number", min: 1, required: true},
		language: "array",
		image_url: {type: "string", min: 8, required: true},
        photopath: {type: "string", min: 8, required: true},
	},
	
    status: {
        id: {type: "string", min:1, required: true},
        status: {type: "string", required: true},
    },
    remove: {
        id: {type: "string", min:1, required: true},
    }
}
