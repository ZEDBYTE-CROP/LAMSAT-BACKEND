"use strict";

const { MoleculerError } 	= require("moleculer").Errors;
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
const Vat = new Database("Mvat");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation vat
 * @permission get,update
 * @whitelist get,update
 */


module.exports = {
	get: async function(ctx) {
		return Vat.find(ctx,{}).then((res) => {
			return res;
		})
		.catch((err) => {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		})
	},
	update: async function(ctx) {
		return Vat.find(ctx,{}).then((res) => {
			console.log(res);
			var udata = {
				commision: ctx.params.commission,
				commisiontype: ctx.params.commissiontype,
			}
			if(ctx.params.vat) {
				udata['vat'] = ctx.params.vat,
				udata['vattype']= ctx.params.vattype ? ctx.params.vattype : 1
			}
			if(res.data.length ) {
				return Vat.updateById(ctx,1,udata,{ query: {id:1}
				}).then((res) => {
					return res;
				})
				.catch((err) => {
					console.log(err);
				});
			} else {
				return Vat.insert(ctx,udata).then((res) => {
					return res;
				})
				.catch((err) => {
					console.log(err);
				})
			}
		})
		.catch((err) => {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		})
    },
}
