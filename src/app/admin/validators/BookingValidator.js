"use strict";

module.exports = {
    create: {
        vendorid: {type: "number", min:1, required: true},
        customerid: {type: "number", min:1, required: true},
        service_date: {type: "string", required: true},
        subtotal: {type: "number", min:1, required: true},
        actualrate: {type: "number", min:1, required: true},
        vat_percent: {type: "number", optional: true},
        vat_amount: {type: "number",  optional: true},
        totalcost: {type: "number", min:1, required: true},
        payment_method: {type: "string", min:1, required: true},
        devicetype: {type: "string", optional: true},
        devicetoken: {type: "string", optional: true},
    },
    getall: {
        customerid: {type: "string", min:1, optional:true},
        vendorid: {type: "string", min:1, optional:true},
        booking_status: {type: "string", optional:true},
        status: {type: "string", min:1, optional:true},

    },
    get: {
        id: {type: "string", min:1, required:true},
    },
    update: {
        id: {type: "number", min:1, required:true},
        booking_status: {type: "number", min:1, required:true},
        status: {type: "number", min:1, required:true},
    },
    remove: {
        id: {type: "string", min:1, required:true},
    },
    activity_log: {
        name: "string"
    },
}
