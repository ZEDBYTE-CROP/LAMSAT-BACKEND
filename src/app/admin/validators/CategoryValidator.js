"use strict";

module.exports = {
    create: {
        photopath: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        color: {type: "string", optional: true},
        status: {type: "number", required: true},
        language: "array",
    },
    getall: {
        status: {type: "string", optional: true},
    },
    getall_mob: {
        status: {type: "string", required: true},
	},
	getalladmincat: {
		status: {type: "string", optional: true},
	},
    get: {
        id: {type: "string", min: 1, required: true},
        status: {type: "string", required: true},
    },
    update: {
        id: {type: "number", min: 1, required: true},
        photopath:{type: "string", optional: true},
        image_url: {type: "string", optional: true},
        language: "array",
        status: {type: "number", required: true},
        color: {type: "string", optional: true},
    },
    status: {
        id: {type: "number", min: 1, required: true},
        status: {type: "number", required: true},
    },
    remove: {
        id: {type: "string", required: true},
    },
    categoryApprovalReject: {
        id: {type: "number", min: 1,required: true},
        field: {type: "string", required: true},
    },
    getadmincats: {
    }

}
