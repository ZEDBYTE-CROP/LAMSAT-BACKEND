"use strict";

module.exports = {
    create: {
        firstname:{type:"string", min:1, required: true},
        lastname: {type:"string", min:1, optional: true},
        email: {type:"string", min:1, required: true},
        phone: {type:"string", min:1, required: true},
        message: {type:"string", min:1, required: true},
    },
}
