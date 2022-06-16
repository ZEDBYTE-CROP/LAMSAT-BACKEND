"use strict";

const { MoleculerError } 	= require("moleculer").Errors;
const Config = require("../../../../config");
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const request = require('request');



//Models
const Sms = new Database("Msms");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation sms
 * @permission create,update
 * @whitelist getall, sendsms
 */
module.exports = {
	create: async function(ctx) {

		return Sms.count(ctx,{
			status: 1
		})
        .then( (res) => {
            if (res.data === 0)
                return this.generateHash(Config.get('/sms/password'))
                    .then( (res) => Sms.insert(ctx, {
                        sms_username: Config.get('/sms/username'),
						sms_password: res.data,
						sms_from: Config.get('/sms/from'),
						sms_countrycode: Config.get('/sms/countrycode'),
                        is_sms: 1
					})
					);
            else
                return Promise.resolve(true);
        })
        .then( () => this.requestSuccess("SMS Exists", true) )
        .catch( (err) => {
            return this.requestError(err)
		} );

	},
	getall: async function(ctx) {
		let findsms = {};
        findsms['status'] = { [Op.ne]: DELETE };
        return Sms.find(ctx, { query: findsms })
        .then( (res) => {
			var arr = res.data;
			return this.requestSuccess("Requested SMS", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

	},
	update: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return Sms.updateBy(ctx, 1, {
			sms_username: ctx.params.sms_username,
			sms_password: ctx.params.sms_password,
			sms_from: ctx.params.sms_from,
			sms_countrycode: ctx.params.sms_countrycode,
			is_sms: ctx.params.is_sms
		}, { query: {
			id: 1,
			}
		})
        .then ((res) => {
			ctx.meta.log = "Activity log Updated.";
			activity.setLog(ctx);
			return this.requestSuccess("SMS Updated", res.data);

        })
        .catch( (err) => {
            if (err.name === 'Database Error' && Array.isArray(err.data)){
                if (err.data[0].type === 'unique' && err.data[0].field === 'first')
                    return this.requestError(CodeTypes.T1_FIRST_CONSTRAINT);
            }
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
	},


	sendsms: async function(ctx) {
		let findsms = {};
		findsms['status'] = { [Op.ne]: DELETE };
		//500337656
		var MobileNumber = '599226961';
		var Sender_Id = 'LAMSAT'
		var MsgContent = ' test message from dev';
		var CountryCode = '966';

		var urlSendSMS = 'http://mshastra.com/sendurlcomma.aspx?user=20099487&pwd=6xp4bu&senderid='+Sender_Id+'&CountryCode='+CountryCode+'&mobileno='+MobileNumber+'&msgtext='+MsgContent+'&smstype=0/4/3';
request({

    url: urlSendSMS, //'http://api.labsmobile.com/get/balance.php?username=[X]&password=[X]',
    method: 'GET',
}, function(error, response, body){
    if(error) {
        console.log( 'Errrrorrr' , error);
    } else {
        console.log('Response Status & body ' , response.statusCode, body);
    }
});
		/*return Sms.find(ctx, { query: findsms })
        .then( (res) => {
			var arr = res.data;
			return this.requestSuccess("Requested SMS", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });*/

	},
}
