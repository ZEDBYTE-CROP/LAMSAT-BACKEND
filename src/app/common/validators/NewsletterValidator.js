"use strict";

module.exports = {
    create: {
        newslettertitle: "string",
        newslettercontent: "string"
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
        newslettertitle: "string",
        newslettercontent: "string"
    },
    remove: {
        id: "string"
    },
    subscriber_remove: {
        id: "string"
    },
}
