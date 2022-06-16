"use strict";

module.exports = {
    create: {
        vendorid: {type: "number", min: 1,required: true},
        email: {type: "string", required: true},
        contactnumber: {type: "string", min:6, max:15, required: true},
        employee_startdate: {type: "string", optional: true},
        employee_enddate: {type: "string", min: 3,optional: true},
        serviceid: 'array',
        photopath: {type: "string", min: 8,optional: true},
        image_url: {type: "string", min: 8,optional: true},
        firstname: {type: "string", min: 3,required: true},
        lastname: {type: "string", min: 3,required: true},
        staff_title: {type: "string", min: 3,required: true},
        notes: {type: "string", min: 6,required: true},
        status: {type: "number", required: true},
    },
    update: {
        id: {type: "number", min: 1,required: true},
        vendorid: {type: "number", min: 1,required: true},
        email: {type: "string", required: true},
        contactnumber: {type: "string", min:6, max:15, required: true},
        employee_startdate: {type: "string", optional: true},
        employee_enddate: {type: "string", min: 3,optional: true},
        serviceid: 'array',
        photopath: {type: "string", min: 8,optional: true},
        image_url: {type: "string", min: 8,optional: true},
        firstname: {type: "string", min: 3,required: true},
        lastname: {type: "string", min: 3,required: true},
        staff_title: {type: "string", min: 3,required: true},
        notes: {type: "string", min: 6,required: true},
        status: {type: "number", required: true},
    },
    status: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string", required: true},
    },
    remove: {
        id: {type: "string", min: 1,required: true},
    },

    getAll: {
        vendorid: {type: "string", min: 1, required: true},
        status: {type: "string", required: true},
    },
    getall_mob: {
        vendorid: {type: "string", min: 1, required: true},
        status: {type: "string", required: true},
    },
    get: {
        id: {type: "string", min: 1,required: true},
        status: {type: "string", required: true},
	},
	getAvailaleStaff: {
		vendorid: {type: "string", min: 1, required: true},
		service_id: {type: "string", min: 1, required: true},
	}
}
