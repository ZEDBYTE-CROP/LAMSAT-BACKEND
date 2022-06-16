"use strict";

module.exports = {
    create: {
        userid: {type: "number", min: 1,required: true},
        name: {type: "string", min: 3,required: true},
        vendorid: {type: "number", min: 1,required: true},
        rating: {type: "number", required: true},
        review: {type: "string", min: 5,required: true},
    },
    getall: {
        isreview: {type:"string", optional: true},
        status: {type: "string", optional: true},
    },
    get: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string",optional: true},
    },
    status: {
        id: {type: "number", min: 1,required: true},
        status: {type: "number", required: true},
    },
    remove: {
        id: {type: "string", min: 1,required: true},
    },
    review_approval: {
        id: {type: "number", min: 1,required: true},
        approval: {type: "number", required: true},
    },
    review_count: {
        id: {type: "string", min: 1,required: true},
    },

    user_reviews: {
        userid: {type: "string", min: 1,required: true},
        status: {type: "string", optional: true},
    },

    vendor_reviews: {
        vendorid: {type: "string", min: 1,required: true},
        status: {type: "string", optional: true},
    }
}
