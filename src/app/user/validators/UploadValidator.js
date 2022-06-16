"use strict";

module.exports = {
    create: {
        status: "number",
        language: "array",
        cmsstatus: "number",
    },
    getAll: {
        status: "string"
    },
    get: {
        id: "string",
        status: "string"
    },
    update: {
        id: "number",   
        language: "array",
        status: 'number'
    },
    status: {
        id: "string",
        status: 'string'
    },
    remove: {
        id: "string"
    },
    faqcreate: {
        status: "number",
        language: "array",
        faqstatus: "number"
    },
    faqgetAll: {
        status: "string"
    },
    faqget: {
        id: "string",
        status: "string"
    },
    faqupdate: {
        id: "number",   
        language: "array",
        status: 'number'
    },
    faqstatus: {
        id: "string",
        status: 'string'
    },
    faqremove: {
        id: "string"
    },
    faqstatus: {
        faqstatus: "number",
        id: "number"
    },
    cmsstatus: {
        cmsstatus: "number",
        id: "number"
    }
}