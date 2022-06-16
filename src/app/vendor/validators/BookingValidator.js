"use strict";

module.exports = {
    create: {

    },
    getall: {
        customerid: {type: "string", min:1, optional:true},
        vendorid: {type: "string", min:1, required:true},
        booking_status: {type: "string", optional:true},
        status: {type: "string", min:1, optional:true},
    },
    get: {
        id: {type: "string", min:1, required:true},
        status: {type: "string", min:1, required:true},
    },
    update: {
        id: {type: "number", min:1, required:true},
        booking_status: {type: "number", min:1, required:true},
    },
    remove: {
        id: {type: "string", min:1, required:true},
    },
    booking_count: {
        booking_status: {type: "string", min:1, optional: true},
        customerid: {type: "string", min:1, optional: true},
        status: {type: "string", min:1, optional: true},
        vendorid: {type: "string", min:1, required: true}
    },
    updateBookingStatus:{

        id: {type: "number", min:1, required: true},
        status: {type: "string", min:1, required: true}

	},
	updatePaymentStatus: {
		id: {type: "number", min:1, required: true},
        payment_status: {type: "number", min:0, required: true}
	}
}
