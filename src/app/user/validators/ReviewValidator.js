"use strict";

module.exports = {
    create: {
        userid: {type: "number", required: true},
        name: {type: "string", required: true},
        vendorid: {type: "number", required: true},
        rating: {type: "number", required: true},
        review: {type: "string", required: true},
    },
    update: {
        id: {type: "string", required: true},
        rating: {type: "number", required: true},
        review: {type: "string", required: true},
    },
    get: {
        id: {type: "string", min: 1,required: true},
	},

	getbycount: {
		vendorid: {type: "string", min: 1,required: true},
	},

	getbyrating :{
		vendorid: {type: "string", min: 1,required: true},
		rating: {type: "string", min: 1,required: true},
	},
}
