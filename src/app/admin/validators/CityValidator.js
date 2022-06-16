"use strict";

module.exports = {
    create: {
        countryid: {type:"number", min:1, required: true},
        status: {type: "number", required: true},
        language: "array",
    },
    getall: {
        countryid: {type:"string", min:1, optional: true},
        status: {type:"string", optional: true},
    },
    get: {
        id: {type:"string", min:1, required: true},
        status: {type:"string",  optional: true},
    },
    update: {
        id: {type:"number", min:1, required: true},
        countryid: {type:"number", min:1, required: true},
        status: {type: "number", required: true},
        language: "array",
    },
    status: {
        id: {type:"number", min:1, required: true},
        status: {type: "number", required: true},
    },
    remove: {
        id: {type:"string",min:1,  required: true},
    }
}