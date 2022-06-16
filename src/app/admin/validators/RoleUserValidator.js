"use strict";

module.exports = {
    create: {
		roleid: "number",
		userid: "number"
    },
    getAll: {
        status: "string"
    },
    get: {
        id: "string",
        status: "string"
    },
    update: {
		id:"number",
        userid: "number",
        roleid: "number",
        status: 'number'
    },
    status: {
        id: "number",
        status: 'number'
    },
    remove: {
        id: "number"
    }
}
