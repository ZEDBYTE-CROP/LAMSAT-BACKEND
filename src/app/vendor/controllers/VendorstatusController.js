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


//Models

const vendorstatus = new Database("Mvendorstatus");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // vendorstatus creation for defining the status of vendor
    create: async function(ctx) {
        let findvendorstatus = {};
        findvendorstatus['vendorstatus'] = ctx.params.vendorstatus;
        findvendorstatus['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorstatus.find(ctx, { query: findvendorstatus })
        .then((res) => {
            if (res.data.length === 0) {
                return vendorstatus.insert(ctx, {
                    vendorstatus: ctx.params.vendorstatus
                })
                .catch( (err) => {
                    if (err.name === 'Database Error' && Array.isArray(err.data)){
                        if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                            return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                    }
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(err);
                });
            }
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })

    },
    // vendorstatus list
    getAll: function(ctx) {
        let findvendorstatus = {};
        findvendorstatus['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorstatus.find(ctx, { query: findvendorstatus })
        .then( (res) => {
            return this.requestSuccess("List of vendorstatus", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //status updation
    status: function(ctx) {

    },
    //Particular vendorstatus list
    get: function(ctx) {
        let findvendorstatus = {};
        findvendorstatus['id'] = ctx.params.id;
        findvendorstatus['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorstatus.find(ctx, { query: findvendorstatus })
        .then( (res) => {
            return this.requestSuccess("Requested vendorstatus", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //vendorstatus update (all fields are mandatory)
    update: function(ctx) {

        let findvendorstatus = {};
        findvendorstatus['id'] = { [Op.ne]: ctx.params.id }
        findvendorstatus['vendorstatus'] = ctx.params.vendorstatus;
        findvendorstatus['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorstatus.find(ctx, { query: findvendorstatus })
        .then ((res) => {
            if (res.data.length === 0)
            {
                vendorstatus.updateBy(ctx, 1, {
                    vendorstatus: ctx.params.vendorstatus,
                }, { query: {
                        id: ctx.params.id
                    }
                })
                return this.requestSuccess("vendorstatus Updated", ctx.params.vendorstatus);

            }
            else
            {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
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
                return err;
        });
    },

    //vendorstatus delete is used change the status and not complete delete
    remove: function(ctx) {
        return  vendorstatus.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            vendorstatus.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
        })
        .then((res)=>{
            return this.requestSuccess("vendorstatus Deleted", ctx.params.id);
        })
    }
}
