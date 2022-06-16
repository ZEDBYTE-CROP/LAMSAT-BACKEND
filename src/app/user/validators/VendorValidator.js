"use strict";

module.exports = {
   

    getvendors: {
        latitude: {type: "string", min: 1,required: true},
        longitude: {type: "string", min: 1,required: true},
        status: {type: "string", min: 1, required: true},
    },
    vendor_detail:{
        id: { type: "string", min:1, required: true},
        status: {type: "string",required: true}
    }
}
