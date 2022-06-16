"use strict";

module.exports = {
    create: {
        photopath: {type: "string", optional: true},
        color: {type: "string", optional: true},
        status: {type: "number", required: true},
        language: "array",
        permission : {type: "string", required: true},
    },

    update: {
        id: {type: "number", min: 1, required: true},
        photopath:{type: "string", optional: true},
        color: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        language: "array",
        status: {type: "number", required: true},
    },
    remove: {
        id: {type: "string", required: true},
    },

    getall: {
        status: {type: "string", optional: true},
    },

    getallVendor : {
        categoryid: {type: "array", optional: true},
    },

    getCatServiceByVendor : {
        languageid: {type: "string", required: true},
        vendorid: {type: "string", required: true},
	},
	getCatServiceByVendorId: {
		languageid: {type: "string", required: true},
        vendorid: {type: "string", required: true},
	},
	getCatServiceAllByVendor: {
		vendorid: {type: "string", required: true}
	},
}
