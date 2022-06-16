"use strict";

module.exports = {
    getAll: {
		userid: {type: "string", required: true},
		usertype: {type: "string", optional: true},
    },
    remove: {
        id: {type: "string", required: true}
	},
	setviewed: {
		id: {type: "string", required: true}
	},
	setnotificationcount: {
		userid: {type: "string", required: true},
		usertype: {type: "string", optional: true},
    },
	get: {
		id: {type: "string", required: true}
	}
}
