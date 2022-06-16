"use strict";

module.exports = {
    create: {
        firstname:{type:"string", min:1, required: true},
        lastname: {type:"string", min:1, optional: true},
        email: {type:"string", min:1, required: true},
        phone: {type:"string", min:1, required: true},
        message: {type:"string", min:1, required: true},
    },
    getall: {
        status: {type:"string", min:1, required: true},
    },
    get: {
        id: {type:"string", min:1, required: true},
    },
    status: {
        id: {type:"number", min:1, required: true},
        status: {type:"number", min:1, required: true},
    },
    remove: {
        id: {type:"string", min:1, required: true},
    }
}
