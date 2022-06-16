"use strict";

module.exports = {
    create: {
        rolename: {type:"string", min:2, required: true},
        role_json: {type:"string", required: true},
        status: {type: "number", required: true}
    },
    getall: {
        status: {type: "string", optional: true}
    },
    get: {
        //id: {type: "string", min:1, required: true},
        status: {type: "string", optional: true}
    },
    getone:{
        id: {type: "string", min:1, required: true},
        status: {type: "string", optional: true}
    },
    update: {
        id: {type: "number", min:1, required: true},
        rolename: {type:"string", min:2, required: true},
        role_json: {type:"string", required: true},
        status: {type: "number", required: true}
    },
    status: {
        id: {type: "number", min:1, required: true},
        status: {type: "number", required: true}
    },
    remove: {
        id: {type: "string", required: true},
    }
}
