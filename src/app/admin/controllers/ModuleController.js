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
const activity = require("../../../helpers/activitylog");

//Models

const Module = new Database("Mrolemodule");
const Modulelang = new Database("Mrolemodulelang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;
/**
 *
 * @annotation ModuleController
 * @permission create,update,remove,status
 * @whitelist getall,get
*/
module.exports = {

    // Module creation with multiple language
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        let findmodule = {};
        findmodule['modulename'] = ctx.params.language[0].modulename ? ctx.params.language[0].modulename : { [Op.ne]: DELETE };
        findmodule['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Modulelang.find(ctx, { query: findmodule })
        .then((res) => {
            if (res.data.length === 0) {
                return Module.insert(ctx, {
                    status: 1
                })
                .then( (res) => {
                    ctx.params.language.map((lan_item)=>{
                        lan_item['moduleid'] = res.data.id;
                        Modulelang.insert(ctx, lan_item)
                    })
                    ctx.meta.log = "Module added successfully by admin";
                    activity.setLog(ctx);
                    return this.requestSuccess("Module Created", ctx.params.language[0].modulename);
                })
                .catch( (err) => {
                    ctx.meta.log = "Attempt to add module failed by Admin";
                    activity.setLog(ctx);
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
                ctx.meta.log = "Attempt to add module failed by Admin";
                activity.setLog(ctx);
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })

    },
    // Module list with multiple language
    getall: function(ctx) {
        let findmodule = {};
        findmodule['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Module.find(ctx, { query: findmodule })
        .then( (res) => {
            var arr = res.data;
            async function get_module(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await Modulelang.find(ctx, { query: {moduleid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["modulename"] = lan_res.data[0].modulename;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_module(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of Modules", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //status updation for Module in both language
    status: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Module.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Module.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })

            let update = {};
                update["status"] = ctx.params.status;
            let des = {};
				des["moduleid"] = ctx.params.id;
            Modulelang.updateMany(ctx,des,update)
            ctx.meta.log = "Module updated by admin";
            activity.setLog(ctx);
            return this.requestSuccess("Requested Module Updated");
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to add city failed by Admin";
            activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });

    },
    //Particular module list in multiple language
    get: function(ctx) {
        let findmodule = {};
        findmodule['id'] = ctx.params.id ;
        findmodule['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Module.find(ctx, { query: findmodule })
        .then( (res) => {
            var arr = res.data;
            async function get_module(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await Modulelang.find(ctx, { query: {moduleid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["modulename"] = lan_res.data[0].modulename;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_module(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Module", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Module update for mutiple language (all fields are mandatory)
    update: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        let findmodule = {};
        findmodule['moduleid'] = { [Op.ne]: ctx.params.id }
        findmodule['modulename'] = ctx.params.language[0].modulename ? ctx.params.language[0].modulename : { [Op.ne]: DELETE };
        findmodule['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Modulelang.find(ctx, { query: findmodule })
        .then ((res) => {
            if (res.data.length === 0)
            {
                Module.updateBy(ctx, 1, {
                    status: 1
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{

                    ctx.params.language.map((lan_item)=>{
                        Modulelang.updateBy(ctx, 1, {
                            languageid: lan_item.languageid,
                            langshortname: lan_item.langshort_name,
                            modulename: lan_item.modulename,
                        }, { query: {
                            languageid: lan_item.languageid,
                            moduleid: ctx.params.id
                            }
                            })
                    })
                })
                ctx.meta.log = "Module updated by Admin";
                activity.setLog(ctx);
                return this.requestSuccess("Module Updated", ctx.params.language[0].modulename);

            }
            else
            {
                ctx.meta.log = "Attempt to update module failed by Admin";
                activity.setLog(ctx);
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update module failed by Admin";
            activity.setLog(ctx);
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

    //Module delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Module.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Module.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })

            let update = {};
                update["status"] = 2;
            let des = {};
				des["moduleid"] = ctx.params.id;
            Modulelang.updateMany(ctx,des,update)
            ctx.meta.log = "module updated by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("Module Deleted")
    })

    }
}
