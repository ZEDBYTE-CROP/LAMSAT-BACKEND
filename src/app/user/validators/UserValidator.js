"use strict";

module.exports = {
	login: {
		email: {type: "string", min: 4,required: true},
		password: {type: "string", min: 5,required: true}
	},

	create: {
		firstname: {type: "string", min: 1, required: true},
		lastname: {type: "string", min: 1, required: true},
		email: {type: "string", min: 4,required: true},
		password: {type: "string", min: 6,required: true},
		confirmpassword: {type: "string", min: 6,required: true},
		cityid: {type: "number", min: 1,required: true},
		countryid: {type: "number", min: 1,required: true},
		countrycode: {type: "string", min: 1, required: true},
		contactnumber: {type: "string", min:6, max:15, required: true},
		photopath: {type: "string", optional: true},
		image_url: {type: "string", optional: true}
	},

	verifyPassword: {
		username: {type: "string", min: 4,required: true},
		password: {type: "string", min: 5,required: true}
	},
	update: {
		id: {type: "number", min: 1,required: true},
		firstname: {type: "string", min: 1, required: true},
		lastname: {type: "string", min: 1, required: true},
		email: {type: "string", min: 4, required: true},
		contactnumber: {type: "string", min:6, max:15, required: true},
		photopath: {type: "string", min: 5, optional: true},
		image_url: {type: "string", optional: true}
	},

	changepassword: {
		id: {type: "number", min: 1,required: true},
		oldpassword: {type: "string", min: 5, required: true},
		newpassword: {type: "string", min: 6, required: true},
		confirmpassword: {type: "string", min:6, required: true},
	},

	adminchangepassword: {
		id: {type: "number", min: 1,required: true},
		newpassword: {type: "string", min: 6, required: true},
		confirmpassword: {type: "string", min:6, required: true},
	},	

	forgetpassword: {
		email: {type: "string", min: 4, required: true},
	},

	changeforgetpassword: {
		userkey: {type: "string", required: true},
		password: {type: "string", required: true},
	},

	timeupdate: {
		id: {type: "number", min: 1,required: true},
		starttime: {type: "string", min: 5, required: true},
		endtime: {type: "string", min: 5, required: true},
		vendorstatus: {type: "number", min: 1, required: true},
	},

	timestatus: {
		id: {type: "number", min: 1, required: true},
		vendorstatus: {type: "number", min: 1, required: true},
	},

	timeget: {
		vendorid: {type: "number", min: 1, required: true},
	},

	favvendor: {
		vendorid: {type: "number", min: 1, required: true},
		userid: {type: "number", min: 1, required: true},
		favourite: {type: "number", required: true}
	},

	favhotels: {
		userid: {type: "string", min: 1, required: true},
	},

	verifyMailId: {
		emailverificationkey: {type: "string", required: true},
	},
    
	validate_voucher:{
		vouchercode: {type: "string", min: 1, required: true},
		totalamount: {type: "string", min: 1, required: true},
		userid: {type: "string", min:1, required: true}
	}
};
