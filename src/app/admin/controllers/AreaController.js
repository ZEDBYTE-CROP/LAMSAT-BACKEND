"use strict";
// DEVELOPED ON 14-07-2020

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
const db = require('../../../adapters/db');


//Models

const Area = new Database("Marea");
const Arealang = new Database("Marealang");
const Citylang = new Database("Mcitylang");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation area
 * @permission create,update,status,remove
 * @whitelist get,getall
 */
module.exports = {

    // City creation with multiple language
    create: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.areaname);
        });
        let wherecond = {
            languageid: langid,
            areaname: langname,
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
        };

        return Arealang.find(ctx, { query: wherecond })
        .then((res) => {
            if (res.data.length === 0) {
                return Area.insert(ctx, {
					cityid: ctx.params.cityid,
					status: ctx.params.status
                })
                .then( (res) => {

                    ctx.params.language.map((lan_item)=>{
                        lan_item['areaid'] = res.data.id;
                        Arealang.insert(ctx, lan_item)
					});
					ctx.meta.log = "New area added by user";
					activity.setLog(ctx);
                    return this.requestSuccess("Area Created", ctx.params.language[0].areaname);
                })
                .catch( (err) => {
					ctx.meta.log = "Attempt to add new area failed";
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
               return this.requestError(`Area Name ${ res.data[0].areaname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })

    },
    // City list with multiple language
    getall: async function(ctx) {
        try {
            let lang = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language :1;
            let QUERY = `
            SELECT a.id,a.cityid,a.status,a.created_by,cl.cityname,al.languageid,al.areaname,al.areashortname
            from marea as a
            inner join marealang as al on al.areaid = a.id
            inner join mcitylang as cl on cl.cityid = a.cityid
            where a.status = 1 and al.languageid = ${lang} and cl.languageid = ${lang}
            order by a.id DESC
            `;
            let res = await db.sequelize.query(QUERY);
            return this.requestSuccess("Area list", res[0]);
        } catch (err) {
			ctx.meta.log = "Attempt to area status change failed.";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        }
    },
    
    //status updation for City in both language
    status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Area.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Area.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = ctx.params.status;
                let des = {};
                    des["areaid"] = ctx.params.id;
                return Arealang.updateMany(ctx,des,update)
                .then((res)=>{
                    ctx.meta.log = "Area status changed.";
			        activity.setLog(ctx);
                    return this.requestSuccess("Status Changed", ctx.params.id);
                })
            })
        })
        .catch( (err) => {
			ctx.meta.log = "Attempt to area status change failed.";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        });

    },
   //Particular City list in multiple language
    get: async function(ctx) {
        try {
            let lang = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language :1;
            let QUERY = `
            SELECT a.id,a.cityid,a.status,a.created_by,cl.cityname,al.languageid,al.areaname,al.areashortname
            from marea as a
            inner join marealang as al on al.areaid = a.id
            inner join mcitylang as cl on cl.cityid = a.cityid
            where a.id = ${ctx.params.id} and a.status = 1 and al.languageid = ${lang} and cl.languageid = ${lang}
            order by a.id DESC
            `;
            let res = await db.sequelize.query(QUERY);
            return this.requestSuccess("Requested Area", res[0]);
        } catch (err) {
			ctx.meta.log = "Attempt to area status change failed.";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        }
    },
   
    //City update for mutiple language (all fields are mandatory)
    update: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.areaname);
        });
        let wherecond = {
            languageid: langid,
            areaname: langname,
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
            areaid: { [Op.ne]: ctx.params.id }
        };
        return Arealang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                Area.updateBy(ctx, 1, {
					cityid: ctx.params.cityid,
					status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{

                    ctx.params.language.map((lan_item)=>{
                        Citylang.find(ctx, { query: {cityid: ctx.params.id,languageid: lan_item.languageid} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            {
                                Arealang.insert(ctx, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    areaname: lan_item.areaname,
                                    areashortname: lan_item.areashortname,
                                    areaid: ctx.params.id,
                                    status: ctx.params.status
                                })
                            }
                            else {
                                Arealang.updateBy(ctx, 1, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    areaname: lan_item.areaname,
                                    areashortname: lan_item.areashortname,
                                    status: ctx.params.status
                                }, { query: {
                                    languageid: lan_item.languageid,
                                    areaid: ctx.params.id
                                    }
                                    })
                            }
                        })
                    })
				});
				ctx.meta.log = `Area details of ${ctx.params.id} was updated`;
				activity.setLog(ctx);
                return this.requestSuccess("Area Updated", ctx.params.language[0].areaname);
            }
            else
            {
                return this.requestError(`Area Name ${ res.data[0].areaname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })
        .catch( (err) => {
			ctx.meta.log = `Attempt to update details of ${ctx.params.id} was failed.`;
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
    //City delete is used change the status and not complete delete
    remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Area.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Area.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = 2;
                let des = {};
                    des["areaid"] = ctx.params.id;
                return Arealang.updateMany(ctx,des,update)
                .then((resp)=>{
                    ctx.meta.log = `Area id ${ctx.params.id} was removed.`;
                    activity.setLog(ctx);
                    return this.requestSuccess("Status Changed", ctx.params.id);
                })
            })
        })
    }
}
