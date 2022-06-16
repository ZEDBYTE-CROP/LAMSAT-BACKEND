"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
//database connections for store Procedures (dashboard counts api)
const Sequ = require("sequelize");

//Models

const Social = new Database("Msocialmedia");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation socialmedia
 * @permission create,update,remove
 * @whitelist  getall
 */
module.exports = {

    create: async function(ctx) {

        return Social.insert(ctx, ctx.params)
        .then( (res) => {
            return this.requestSuccess("Social Medias Added");
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
    },

    // Social Media list
    getall: function(ctx) {
        let findsocial = {};
        findsocial['status'] = { [Op.ne]: DELETE };
        return Social.find(ctx, { query: findsocial })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of Social Media Links", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    //SMS update (all fields are mandatory)
    update: function(ctx) {
		let findsocial = {};
        findsocial['status'] = { [Op.ne]: DELETE };
		return Social.find(ctx, { query: findsocial })
        .then( (res) => {
			if(res.data.length) {
				return Social.updateBy(ctx, 1, {
					facebook: ctx.params.facebook,
					twitter: ctx.params.twitter,
					instagram: ctx.params.instagram,
					google_plus: ctx.params.google_plus
				}, { query: {
						id: 1
					}
				})
				.then((res)=>{
					return this.requestSuccess("Social Media Links Updated",res.data);
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
			} else {
				return Social.insert(ctx, ctx.params)
				.then( (res) => {
					return this.requestSuccess("Social Medias Added",res.data);
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
		.catch((err) => {
			console.log('----',err);
		})
    },

    remove: function(ctx) {
        return  Social.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Social.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Requested Social Media Links Deleted");

        })
    },
}
