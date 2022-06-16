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


//Models
const Smtp = new Database("Msmtp");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;
/**
 *
 * @annotation smtp
 * @permission create,update
 * @whitelist  getall
 */
module.exports = {
	create: async function(ctx) {

		return Smtp.count(ctx,{
			status: 1
		})
        .then( (res) => {
            if (res.data === 0)
                return this.generateHash(Config.get('/smtp/password'))
                    .then( (res) => Smtp.insert(ctx, {
                        smtp_username: Config.get('/smtp/username'),
						smtp_password: res.data,
						smtp_host: Config.get('/smtp/host'),
						smtp_encryption: Config.get('/smtp/encryption'),
						smtp_port: Config.get('/smtp/port'),
                        is_smtp: 1
					})
					);
            else
                return Promise.resolve(true);
        })
        .then( () => this.requestSuccess("SMTP Exists", true) )
        .catch( (err) => {
            return this.requestError(err)
		} );

	},
	getall: function(ctx) {
        let findsmtp = {};
        findsmtp['status'] = { [Op.ne]: DELETE };
        return Smtp.find(ctx, { query: findsmtp })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of SMTPS", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    //SMTP update (all fields are mandatory)
    update: function(ctx) {
		return Smtp.updateBy(ctx, 1, {
			smtp_host: ctx.params.smtp_host,
			smtp_encryption: ctx.params.smtp_encryption,
			smtp_port: ctx.params.smtp_port,
			smtp_username: ctx.params.smtp_username,
			smtp_password: ctx.params.smtp_password,
			is_smtp: ctx.params.is_smtp,
		}, { query: {
				id: 1
			}
		})
		.then((res)=>{
			return this.requestSuccess("SMTP Updated", res.data);
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
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },
}
