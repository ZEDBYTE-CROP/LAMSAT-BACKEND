"use strict";

module.exports = {
    create: {
		vendorid: {type: "number", min: 1,required: true},
        vendorstaffid: {type: "number", min: 1,required: true},
		starttime: {type: "string", min: 3,required: true},
		endtime: {type: "string", min: 3,required: true},
        startday: {type: "string", min: 8, required: true},
        endday: {type: "string", min: 8, required: true},
        status: {type: "number", required: true},
    },
    getAll: {
        vendorid: {type: "string", min: 1, optional: true},
		status: {type: "string", required: true},
		startdate: {type: "string"},
		enddate: {type: "string"},
    },
    // getall_mob: {
    //     vendorid: {type: "string", min: 1, optional: true},
    //     status: {type: "string", required: true},
    // },
    // get: {
    //     id: {type: "string", min: 1,required: true},
    //     status: {type: "string", required: true},
    // },
    update: {
        id: {type: "number", min: 1,required: true},
		starttime: {type: "string", min: 3,required: true},
		endtime: {type: "string", min: 3,required: true},
       	day: {type: "string", min: 8, required: true},
    },
    // status: {
    //     id: {type: "string", min: 1,required: true},
    //     status: {type: "string", required: true},
    // },
    remove: {
        id: {type: "string", min: 1,required: true},
    }
}
