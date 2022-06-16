"use strict";

module.exports = {
    create: {
        vendorid: {type: "number", min: 1,required: true},
        email: {type: "string", optional: true},
        contactnumber: {type: "string", optional: true},
        employee_startdate: {type: "string", optional: true},
        employee_enddate: {type: "string", optional: true},
        photopath: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        firstname: {type: "string", required: true},
        lastname: {type: "string", optional: true},
        staff_title: {type: "string", optional: true},
        notes: {type: "string", optional: true},
        status: {type: "number", required: true},
    },
    getAll: {
        vendorid: {type: "string", min: 1, optional: true},
        status: {type: "string", required: true},
	},
	getall_service: {
		vendorid: {type: "string", min: 1, optional: true},
		serviceid: {type: "string", min: 1, optional: true},
		status: {type: "string", required: true}
	},
    getall_mob: {
        vendorid: {type: "string", min: 1, optional: true},
        status: {type: "string", required: true},
    },
    get: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string", required: true},
    },
    update: {
        id: {type: "number", min: 1,required: true},
        vendorid: {type: "number", min: 1,required: true},
        email: {type: "string", required: true},
        contactnumber: {type: "string", min:6, max:15, required: true},
        employee_startdate: {type: "string", optional: true},
        employee_enddate: {type: "string", optional: true},
        photopath: {type: "string", optional: true},
        image_url: {type: "string", optional: true},
        firstname: {type: "string", required: true},
        lastname: {type: "string",required: true},
        staff_title: {type: "string", required: true},
        notes: {type: "string", required: true},
        status: {type: "number", required: true},
    },
    status: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string", required: true},
    },
    remove: {
        id: {type: "string", min: 1,required: true},
    }
}
