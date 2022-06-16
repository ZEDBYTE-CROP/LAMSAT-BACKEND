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
const Op = require("sequelize").Op;
const request = require("request");



//Models
const Settings = new Database("Msettings");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation settings
 * @permission update
 * @whitelist getall
 */
module.exports = {
	getall: async function(ctx) {
		return Settings.find(ctx, { })
			.then( (res) => {
				let arr = res.data;
				return this.requestSuccess("Requested Settings", arr);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},

	update: async function(ctx) {
		return Settings.find(ctx, {settingskey:ctx.params.settingskey})
		.then( (res) => {
			if(res.data.length) {
				return Settings.updateBy(ctx, 1, {
					settingsvalue: ctx.params.settingsvalue,
					settingsname: ctx.params.settingsname
				}, { query: {
					settingskey: ctx.params.settingskey,
				}
				})
				.then ((res) => {
					ctx.meta.log = "Activity log Updated.";
					activity.setLog(ctx);
					return this.requestSuccess("Settings Updated", res.data);

				})
				.catch( (err) => {
					if (err.name === "Database Error" && Array.isArray(err.data)){
						if (err.data[0].type === "unique" && err.data[0].field === "first")
							return this.requestError(CodeTypes.T1_FIRST_CONSTRAINT);
					}
					else if (err instanceof MoleculerError)
						return Promise.reject(err);
					else if (err.name === "Nothing Found")
						return this.requestError(CodeTypes.NOTHING_FOUND);
					else
						return this.requestError(err);
				});
			} else {
				return Settings.insert(ctx,{
					settingskey: ctx.params.settingskey,
					settingsvalue: ctx.params.settingsvalue,
					settingsname: ctx.params.settingsname
				})
				.then( (res) => {
                    return this.requestSuccess("Row Created", res.data);
                })
                .catch( (err) => {
                    if (err.name === 'Database Error' && Array.isArray(err.data)){
                        if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                            return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                    }
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                });

			}
		})
		.catch( (err) => {
			if (err.name === "Nothing Found")
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		});

	},

};
