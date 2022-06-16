"use strict";

module.exports = {
    create: {
        firstname: {type:"string", min:1, required: true},
        lastname: {type:"string", min:1, required: true},
        email_address: {type:"string", min:1, required: true},
        cityid: {type: "number", required: true},
        countryid: {type: "number", required: true},
        privacy_policy: {type: "number", min:1, required: true},
        mobile: {type:"string", min:1, required: true},
        saloonname: {type:"string", min:1, required: true},
        services: {type:"array", min:1, required: true},
        hearAboutFresha: {type:"string", min:1, required: true},
        partnerAddress: {type:"string", min:1, required: true},
        partnerDistrict: {type:"string", min:1, required: true},
        partnerPostcode: {type:"string", min:1, required: true},
        partnerRegion: {type:"string", min:1, required: true},
        mobile_number: {type:"string", min:1, required: true},
		phonenumber: {type:"string", min:1, required: true},
		partnerconfirmpassword: {type:"string", min:1, required: false},
		partnerpassword: {type:"string", min:1, required: true},
		vatpercent: {type:"number",optional:true},
		teamsize: {type:"number",optional:true}
    },
    createnewsalon: {
        firstname: {type:"string", min:1, required: true},
        lastname: {type:"string", min:1, required: true},
        email: {type:"string", min:1, required: true},
        cityid: {type: "number", required: true},
        countryid: {type: "number", required: true},
        privacy_policy: {type: "number", min:1, required: true},
        partnerAddress: {type:"string", min:1, required: true},
        partnerDistrict: {type:"string", min:1, required: true},
        partnerPostcode: {type:"string", min:1, required: true},
        partnerRegion: {type:"string", min:1, required: true},
        mobile_number: {type:"string", min:1, required: true},
		contactnumber: {type:"string", min:1, required: true},
		confirmpassword: {type:"string", min:1, required: false},
		password: {type:"string", min:1, required: true},
    },
    getall: {
        status: {type:"string", optional: true},
    },
    get: {
        id: {type:"string", min:1, required: true},
        status: {type:"string",  optional: true},
    },
    update: {
        id: {type:"number", min:1, required: true},
        firstname: {type:"string", min:1, required: true},
        lastname: {type:"string", min:1, required: true},
        email_address: {type:"string", min:1, required: true},
        cityid: {type: "number", required: true},
        countryid: {type: "number", required: true},
        privacy_policy: {type: "number", min:1, required: true},
        mobile: {type:"string", min:1, required: true},
    },
    remove: {
        id: {type:"string",min:1,  required: true},
	},
	isemailexist: {
		email_address: {type:"string", min:1, required: true},
		mobile: {type:"string", min:1, required: true}
	},
	updateapplystatus: {
		id: {type:"number", min:1, required: true},
		isaccepted: {type:"number", min:1, required: true}
    },
    updatesalonapproval: {
		id: {type:"number", min:1, required: true},
		isaccepted: {type:"number", min:1, required: true}
    },
    partnerverifyMailId: {
		emailverificationkey: {type: "string", required: true},
  },
  getpartneremail: {
    id: {type: "string", required: true},
    email: {type: "string", required: true},
  },

  getpartnerotp: {
    id: {type: "string", required: true},
    contactnumber: {type: "string", required: true},
    countrycode: {type: "string", required: true},
  },

  partnerotp_verify: {
    contactnumber: {type: "string", required: true},
    email: {type: "string", required: true},
    otp: {type: "string", required: true},
	},
}
