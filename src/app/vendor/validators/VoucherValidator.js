"use strict";

module.exports = {
    create: {
        vouchername: {type: "string",  required: true},
        vouchercode: {type: "string",  required: true},
        maxredeem_amt: {type: "number", min: 2, required: true},
        vouchervalue: {type: "number", min: 2, required: true},
        mincartvalue: {type: "number", min: 2, required: true},
        startdate: {type: "string", required: true},
        enddate: {type: "string", required: true},     
        isalluser: {type: "number", required: true},  
        usertype: {type: "number", required: true},
        vouchertype: {type: "number", required: true},
        users: "array",
        status: {type: "number", required: true}
    },
    getAll: {
        status: {type: "string", min: 1, required: true},
    },
    get: {
        id: {type: "string", min: 1, required: true},
    },
    coupon_get: {
        couponcode: "string"
    },
    update: {
        id: {type: "number", min: 1, required: true},
        vouchername: {type: "string", required: true},
        vouchercode: {type: "string",  required: true},
        maxredeem_amt: {type: "number", min: 2, required: true},
        vouchervalue: {type: "number", min: 2, required: true},
        mincartvalue: {type: "number", min: 2, required: true},
        startdate: {type: "string", required: true},
        enddate: {type: "string", required: true},     
        isalluser: {type: "number", required: true},  
        usertype: {type: "number", required: true},
        vouchertype: {type: "number", required: true},
        users: "array",
        status: {type: "number", required: true}
    },
    status: {
        id: {type: "number", min: 1, required: true},
        startdate: {type: "string", min: 5, max: 12, required: true},
        enddate: {type: "string", min: 5, max: 12, required: true},  
        status: {type: "number", required: true}
    },
    remove: {
        id: {type: "string", min: 1, required: true},
    }
}
