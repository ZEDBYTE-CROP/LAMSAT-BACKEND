"use strict";

module.exports = {
    update: {
      sms_username: {type: "string", min: 4,required: true},
      sms_password: {type: "string", min: 6,required: true},
      sms_from: {type: "string", min: 4,required: true},
      sms_countrycode: {type: "string", min: 4,required: true},
      is_sms: {type: "number", optional: true}
    },
    sendsms : {

    }
}
