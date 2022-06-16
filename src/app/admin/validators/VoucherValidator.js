"use strict";

module.exports = {
    create: {
        vouchername: {type: "string", min: 5, max: 30, required: true},
        vouchercode: {type: "string", min: 8, max: 12, required: true},
        maxredeem_amt: {type: "number", min: 2, required: true},
        vouchervalue: {type: "number", min: 2, required: true},
        mincartvalue: {type: "number", min: 2, required: true},
        startdate: {type: "string", min: 5, max: 12, required: true},
        enddate: {type: "string", min: 5, max: 12, required: true},     
        isallvendor: {type: "number", required: true},
        isalluser: {type: "number", required: true},  
        usertype: {type: "number", required: true},
        vouchertype: {type: "number", required: true},
        vendors: "array",
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
        vouchername: {type: "string", min: 5, max: 30, required: true},
        vouchercode: {type: "string", min: 8, max: 12, required: true},
        maxredeem_amt: {type: "number", min: 2, required: true},
        vouchervalue: {type: "number", min: 2, required: true},
        mincartvalue: {type: "number", min: 2, required: true},
        startdate: {type: "string", min: 5, max: 12, required: true},
        enddate: {type: "string", min: 5, max: 12, required: true},     
        isallvendor: {type: "number", required: true},
        isalluser: {type: "number", required: true},  
        usertype: {type: "number", required: true},
        vouchertype: {type: "number", required: true},
        vendors: "array",
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
    },
    validate_voucher:{
        vouchercode: {type: "string", min: 1, required: true},
        totalamount: {type: "string", min: 1, required: true},
        userid: {type: "string", min:1, required: true}
    }
}
