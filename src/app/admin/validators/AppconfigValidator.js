"use strict";

module.exports = {
  create: {
        appname: {type: "string", min: 4, max: 100, required: true},
        appdescription: {type: "string", min: 4,required: true},
        metakeyword: {type: "string", min: 4,required: true},
        metadescription: {type: "string", min: 4,required: true},
        email: {type: "string", min: 4,required: true},
        contactnumber: {type: "string", min:6, max:15, required: true},
        contactaddress: {type: "string", min: 4,required: true},
        mapkey: {type: "string", min: 4,required: true},
        site_copyright: {type: "string", min: 4,required: true},
        hour_format: {type: "string", min: 2,required: true},
        currency_code: {type: "string", min: 3,required: true},
        currency_decimalplace:  {type: "string", required: true},
        time_zone: {type: "string", min: 2,required: true},
        vouchercode_digit: {type: "number", min: 1,required: true},
        payment_mode: {type: "string", min: 3,required: true},
        devicetype: {type: "string", min: 1,required: true},
        devicetoken: {type: "string", min: 4,required: true},
        site_logo: {type: "string", min: 8, required: true}
  },
  update: {
        appname: {type: "string", min: 4,required: true},
        appdescription: {type: "string", min: 4,required: true},
        metakeyword: {type: "string", min: 4,required: true},
        metadescription: {type: "string", min: 4,required: true},
        email: {type: "string", min: 4,required: true},
        contactnumber: {type: "string", min:6, max:15, required: true},
        contactaddress: {type: "string", min: 4,required: true},
        mapkey: {type: "string", min: 4,required: true},
        site_copyright: {type: "string", min: 4,required: true},
        hour_format: {type: "string", min: 2,required: true},
        currency_code: {type: "string", min: 3,required: true},
        currency_decimalplace:  {type: "number",optional: true},
        time_zone: {type: "string", min: 2,required: true},
        vouchercode_digit: {type: "number", optional: true},
        payment_mode: {type: "string", min: 3,required: true},
        devicetype: {type: "string", optional: true},
        devicetoken: {type: "string",optional: true},
        site_logo: {type: "string", min: 8, required: true}
  },
  get: {
  }
}
