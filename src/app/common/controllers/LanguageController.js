"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const passwordHash = require('password-hash');
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const Sequ = require("sequelize");

//Models

const Language = new Database("Mlanguage");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation Language
 * @permission create,update,remove
 * @whitelist getall,getone
 */
module.exports = {

    // Language creation
    create: async function(ctx) {
        let findcond = {};
        findcond['languagename'] = ctx.params.languagename;
        findcond['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Language.find(ctx, { query: findcond }).then((res) => {
            if(res.data.length == 0 ){
               return Language.insert(ctx,{
                    languagename: ctx.params.languagename,
                    languageshortname: ctx.params.languagecode,
                    status:ctx.params.status,
                    created_at : new Date()
                }); 
            }else{
                return this.requestError("Language name is already exists!" , res );
            }
        }).then((res) => {
            return this.requestSuccess("Language details inserted successfully!",res.data);
        });
       

    },

    // Language update
    update: async function(ctx) {
        let find = {};
        find['languagename'] = ctx.params.languagename;
        find['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        find['id'] = { [Op.ne]: ctx.params.id };
        return Language.find(ctx, { query: find }).then((res) => {
            if(res.data.length == 0 ){
                return Language.updateBy(ctx,1,{
                    languagename: ctx.params.languagename,
                    languageshortname: ctx.params.languagecode,
                    status:ctx.params.status,
                    updated_at : new Date()
                },{ query: {
                        id: ctx.params.id
                    }
                }); 
            }else{
                return this.requestError("Language name is already exists!" , res );
            }
        }).then((res) => {
            return this.requestSuccess("Language Updated",res);
        });
       

    },

    remove: function(ctx) {

        return Language.updateBy(ctx, 1, {
            status:2
        }, { query: {
                id: ctx.params.id
            }
        })
        .then((res)=>{
            return this.requestSuccess("Language Deleted successfully", res.data);
        })
        .catch( (err) => {
            return err;
        });
    },


    // Language getall
    getall: function(ctx) {
        let condition = {'status' :1};
        return Language.find(ctx , {query : condition, sort: "id" }).then((res) => {
            return this.requestSuccess("List OF Language details!",res.data);
    })
        .catch((err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    // Language get
    getone: function(ctx) {
        let condition = {'id' : ctx.params.id};
        return Language.find(ctx , {query : condition }).then((res) => {
                return this.requestSuccess("Language details updated successfully!",res.data);
            })
            .catch( (err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
    }
    
  
}
