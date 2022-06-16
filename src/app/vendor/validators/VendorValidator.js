"use strict";

module.exports = {
    login: {
        username: {type: "string", min: 4,required: true},
        password: {type: "string", min: 6,required: true}
    },
    verifyPassword: {
        username: {type: "string", min: 4,required: true},
        password: {type: "string", min: 6,required: true}
    },
    update: {
        id: {type: "string", min: 1,required: true},
        firstname: {type: "string",  required: true},
        lastname: {type: "string",  required: true},
        latitude: {type: "number", min: 6,required: true},
        longitude: {type: "number", min: 6,required: true},
        areaid: {type: "number", min: 1,optional: true},
        cityid: {type: "number", min: 1,optional: true},
        countryid: {type: "number", min: 1,optional: true},
        vat: {type: "number", optional: true},
        servicelocation: {type: "string", optional: true},
        service_available: {type: "number",optional: true},
        contactnumber: {type: "string", min:6, max:12, optional: true},
        photopath: {type: "string", min: 8, optional: true},
        image_url: {type: "string", min: 8, optional: true},
        language: {type: "array", min: 2,required: true},
        images: { type: "array", min: 1, optional: true },
        category: {type: "array", min: 1, required: true},
        prefix: {type: "string", min: 1, required: true}
    },

    changepassword: {
        id: {type: "number", min: 1,required: true},
        oldpassword: {type: "string", min: 6, required: true},
        newpassword: {type: "string", min: 6, required: true},
        confirmpassword: {type: "string", min: 6, required: true},
    },

    forgetpassword: {
        email: {type: "string", min: 7, required: true},
	},

	changeforgetpassword: {
		vendorkey: {type: "string", required: true},
		password: {type: "string", required: true},
	},

    timeupdate: {
        id: {type: "number", min: 1,required: true},
        starttime: {type: "string", min: 4, required: true},
        endtime: {type: "string", min: 4, required: true},
        vendorstatus: {type: "number", min: 1, required: true},
    },

    timeget: {
        vendorid: {type: "string", min: 1, required: true},
    },

    get: {
        vendorid: { type: "string", min: 1, required: true}
    },

    images: {
        vendorid: { type: "string", min: 1, required: true}
    },

    imageremove: {
        id: {type: "string", min:1, required: true}
    },

    vendorTimeget: {
        vendorid: { type: "string", min: 1, required: true}
    },
    timeupdates: {

        vendorid: { type: "number", required: true},
        timevalue: { type: "string", optional: true},
        field: { type: "string", required: true},
        timeslotid: { type: "number", required: true}
    },

    adminvendortimeGetall: {
        vendorid: { type: "string", min: 1, required: true}
    },




}
