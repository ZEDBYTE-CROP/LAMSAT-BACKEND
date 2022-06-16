"use strict";

module.exports = {
    createtnxkey: {
        customerid: {type: "number", required: true},
    },

    create: {
		transactionkey: {type: "string", min: 1,required: true},
		amount: {type: "string", required: true},
		eid: {type: "string", min: 1,required: true},
	},

	completetnx: {
		transactionid: {type: "number", required: true},
		transactionmode: {type: "string", min: 1,required: true},
		transactioncode: {type: "string", min: 1,required: true},
		bookingid: {type: "number", required: true},
	},

	completepayment: {
		transactionkey: {type: "string", required: true},
		eid: {type: "string", min: 1,required: true},
		checkoutid: {type: "string", min: 1,required: true},
		bookingid: {type: "number", required: true},
	}
}
