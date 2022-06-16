"use strict";

module.exports = {
    create: {
        countrycode: {type:"string", min:1, required: true},
        countryiso: {type:"string", min:1, required: true},
        status: {type: "number", required: true},
        language: "array",
    },
    getall: {
        status: {type:"string", optional: true},
    },
    get: {
        id: {type:"string", min:1, required: true},
        status: {type:"string",  optional: true},
    },
    update: {
        id: {type:"number", min:1, required: true},
        countrycode: {type:"string", min:1, required: true},
        countryiso: {type:"string", min:1, required: true},    
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