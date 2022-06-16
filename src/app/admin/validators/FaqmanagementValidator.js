"use strict";

module.exports = {
    create: {
        status: {type: "number", required: true},
        language: "array",
    },
    getall: {
        status: {type: "string", optional: true},
    },
    get: {
        id: {type: "string", min: 1, required: true},
        status: {type: "string", optional: true},
    },
    update: {
        id: "string",   
        status: {type: "number", required: true},
        language: "array",
    },
    status: {
        id: {type: "string", min: 1, required: true},
        status: {type: "string", required: true},
    },
    remove: {
        id: {type: "string", min: 1, required: true},
    },
}
