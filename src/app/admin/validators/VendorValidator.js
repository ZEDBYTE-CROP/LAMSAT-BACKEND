"use strict";

module.exports = {
    create: {
        isfeatured: {type: "number", required: true},
        firstname: {type: "string",  required: true},
        lastname: {type: "string",  required: true},
        username: {type: "string", required: true},
        email: {type: "string", required: true},
        password: {type: "string",  required: true},
        confirmpassword: {type: "string", required: true},
        latitude: {type: "number", required: true},
        longitude: {type: "number",required: true},
        areaid: {type: "number", required: true},
        cityid: {type: "number", required: true},
        countryid: {type: "number", required: true},
        //commissiontype: {type: "number", required: true},
        vat: {type: "number", optional: true},
        servicelocation: {type: "string",  required: true},
        //service_available: {type: "number", min:1,required: true},
        paymentoption: {type: "array",  required: true},
        contactnumber: {type: "string", min:6, max:16, optional: true},
        language: {type: "array",required: true},
        category: {type: "array", required: true},
        images:  {type: "array", optional: true},
        image_url: {type: "string",  optional: true},
        prefix: {type: "string", min: 1, required: true}
	},
	signup: {
        isfeatured: {type: "number", optional	: true},
        firstname: {type: "string",  required: true},
        lastname: {type: "string",  required: true},
        username: {type: "string", optional: true},
        email: {type: "string", required: true},
        password: {type: "string",  required: true},
        confirmpassword: {type: "string", required: true},
        latitude: {type: "number", required: true},
        longitude: {type: "number",required: true},
        areaid: {type: "number", min: 1,optional: true},
        cityid: {type: "number", min: 1,optional: true},
        countryid: {type: "number", min: 1,optional: true},
        vat: {type: "number", optional: true},
        servicelocation: {type: "string", optional: true},
        service_available: {type: "number",optional: true},
        paymentoption: {type: "array",  optional: true},
        contactnumber: {type: "string", min:6, max:16, optional: true},
        language: {type: "array",required: true},
        category: {type: "array", optional: true},
        images:  {type: "array", optional: true},
        image_url: {type: "string",  optional: true},
        prefix: {type: "string", min: 1, optional: true}
    },
    getall: {
        isfeatured: {type:"string", optional: true},
        status: {type:"string", optional: true}
    },
    getallsalon: {
        isaccepted: {type:"string", optional: true},
        status: {type:"string", optional: true}
    },
    get: {
        id: {type:"string", min:1, required: true},
        status: {type:"string", optional: true},
    },
    update: {
		id: {type: "string", min: 1,required: true},
        isfeatured: {type: "number", required: true},
        firstname: {type: "string", min: 3, required: true},
        lastname: {type: "string", min: 1, required: true},
        email: {type: "string", required: true},
        latitude: {type: "number", required: true},
        longitude: {type: "number",required: true},
        areaid: {type: "number", min: 1,optional: true},
        cityid: {type: "number", min: 1,optional: true},
        countryid: {type: "number", min: 1,optional: true},
        vat: {type: "number", optional: true},
        servicelocation: {type: "string", optional: true},
        service_available: {type: "number",optional: true},
        paymentoption: {type: "array",  required: true},
        contactnumber: {type: "string", min:6, max:16, optional: true},
        language: {type: "array", min: 2,required: true},
        category: {type: "array", required: true},
        images:  {type: "array", optional: true},
        image_url: {type: "string", optional: true},
        prefix: {type: "string", min: 1, required: true}
    },
    status: {
        id: {type:"string", min:1, required: true},
        status: {type:"string", required: true},
    },
    remove: {
        id: {type:"string", min:1, required: true},
    },
   timeupdate: {
        id: {type: "number", min: 1,required: true},
        starttime: {type: "string", optional: true},
        endtime: {type: "string", optional: true},
        vendorstatus: {type: "number", optional: true},
    },

    timeget: {
        vendorid: {type: "string", min: 1, required: true},
        status: {type:"string", optional: true},
    },

    images: {
        vendorid: { type: "string", min: 1, required: true},
        status: {type:"string", optional: true},
    },
    adminvendortimeGetall: {
        vendorid: { type: "string", min: 1, required: true}
    },
    imageremove: {
        id: {type: "string", min:1, required: true}
    }
}
