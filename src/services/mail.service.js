"use strict";

const Request = require("../mixins/request.mixin");
const Config = require("../../config");


module.exports = {
	name: "mail",

	mixins: [
		require("moleculer-mail"),
		Request
	],

    settings: {
        from: Config.get('/mailer/mail_id'),
        transport: {
            service: 'Outlook365',          
            auth: {               
                user: Config.get('/mailer/mail_id'),
                pass: Config.get('/mailer/password')
            }
        }
    },

};
