"use strict";

module.exports = {
    create: {
        firstname: {type: "string", required: true},
        lastname:  {type: "string", min: 1, required: true},
        password: {type: "string", min: 6, required: true, unique: true},
        confirmpassword:  {type: "string", min: 6,required: true, unique: true},
        email: {type: "string", min: 4, required: true,unique: true},
        contactnumber: {type:"string", min:6, max:15, required: true},
        devicetype: "string",
        devicetoken: "string",
        photopath: {type:"string", min:8, optional: true},
        image_url: {type:"string", min:8, optional: true}
    },
    getAll: {
        status: {type: "string", optional: true},
    },
    get: {
        id: {type: "string", min:1, required: true}
    },
    update: {
        id: "number",
        firstname: {type: "string",required: true},
        lastname:  {type: "string", min: 4,required: true},
        email: {type: "string", min: 4, required: true,unique: true},
        contactnumber: {type:"string", min:6, max:15, required: true},
        devicetype: "string",
        devicetoken: "string",
        photopath: {type:"string", min:8, optional: true},
        image_url: {type:"string", min:8, optional: true}
    },
    status: {
        id: {type: "number", min:1, required: true},
        status: {type: "number", min:1, required: true}
    },
    remove: {
        id: {type: "string", min:1, required: true}
    }
}
