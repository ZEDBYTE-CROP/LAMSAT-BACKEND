"use strict";

module.exports = {
    create: {
        userid: {type: "number", min:1, required: true},
        fullname: {type: "string", required: true},
        country: {type: "number", required: true},
        city: {type: "number", required: true},
        flatno: {type: "string", min: 1, required: true},
        address: { type: "string", required: true},
        mobile: {type: "string", required: true},
        postal: {type: "string", required: true},
    },
    getall: {
        cityid: {type: "string", optional: true}
    },
    update: {
        id: {type: "number", required: true},
        userid: {type: "number", min:1, required: true},
        fullname: {type: "string", required: true},
        country: {type: "number", required: true},
        city: {type: "number", required: true},
        flatno: {type: "string",  required: true},
        address: { type: "string", required: true},
        mobile: {type: "string", required: true},
        postal: {type: "string", required: true},
    },
}