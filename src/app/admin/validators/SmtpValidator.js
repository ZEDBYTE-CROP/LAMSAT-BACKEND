"use strict";

module.exports = {
    update: {
      smtp_host: {type: "string", min: 4,required: true}, 
      smtp_encryption: {type: "string", min: 4,required: true}, 
      smtp_port: {type: "string", required: true}, 
      smtp_username: {type: "string", min: 4,required: true}, 
      smtp_password: {type: "string", min: 4,required: true}, 
      is_smtp: {type: "number", min: 1,required: true}
    }
}
