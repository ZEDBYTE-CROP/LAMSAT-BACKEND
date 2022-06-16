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

const Country = new Database("Mcountry");
const CountryLang = new Database("Mcountrylang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation country
 * @permission create,update,status,remove
 * @whitelist get,getall
 */
module.exports = {

    // Country creation with multiple language
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.countryname);
        });
        let wherecond = {
            languageid: langid,
            countryname: langname,
            status: { [Op.ne]: DELETE }
        };
        return CountryLang.find(ctx, { query: wherecond })
        .then((res) => {
            if (res.data.length === 0) {
                return Country.insert(ctx, {
                    countrycode: ctx.params.countrycode,
					countryiso: ctx.params.countryiso,
					status: ctx.params.status
                })
                .then( (res) => {
                    ctx.params.language.map((lan_item)=>{
                        lan_item['countryid'] = res.data.id;
                        CountryLang.insert(ctx, lan_item)
                    })
                    ctx.meta.log = "Country Added by Admin";
			        activity.setLog(ctx);
                    return this.requestSuccess("Country Created", ctx.params.language[0].countryname);
                })
                .catch( (err) => {
                    ctx.meta.log = "Attempt to  Added  country failed by Admin";
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
               return this.requestError(`Country Name ${ res.data[0].countryname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })

    },
    // country list with multiple language
    getall: function(ctx) {
        let findcountry = {};
        console.log('------------------------------------');
        console.log('ctx.options.parentCtx.params.req.headers.language' , ctx.options.parentCtx.params.req.headers.language);
        console.log('------------------------------------');
        findcountry['status'] =  ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Country.find(ctx, { filter:['id', 'countrykey', 'countrycode','countryiso', 'status','created_by'],query: findcountry })
        .then( (res) => {
            console.log('------------------------------------');
            console.log('res' , res);
            console.log('------------------------------------');
            var arr = res.data;
            async function get_country(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CountryLang.find(ctx, { filter:['id', 'languageid', 'langshortname', 'countryname','countryshortname'],query: {countryid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        console.log('------------------------------------');
                        console.log('lan_res' , lan_res);
                        console.log('------------------------------------');
                        arr[i]['languageid'] = lan_res.data[0].languageid;
                        arr[i]["countryname"] = lan_res.data[0].countryname;
                        arr[i]['countryshortname'] = lan_res.data[0].countryshortname;
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })
                    final.push(language_val);
                    console.log('------------------------------------');
                    console.log('final' , final);
                    console.log('------------------------------------');
                }
                return final;
            }
            const vali =  get_country(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of Countries", resy);
            })
        })
        .catch( (err) => {

            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //status updation for country in both language
    status: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        //0=> inactive, 1=> active
        return  Country.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Country.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = ctx.params.status;
                let des = {};
                    des["countryid"] = ctx.params.id;
                return CountryLang.updateMany(ctx,des,update)
                .then((resp)=>{
                    ctx.meta.log = "Country Status Updated by Admin";
			        activity.setLog(ctx);
                    return this.requestSuccess("Country Status Updated");
                })
            })
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update country status failed by Admin";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });

    },
    //Particular country list in multiple language
    get: function(ctx) {
        let findcountry = {};
        findcountry['id'] = ctx.params.id ;
        findcountry['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Country.find(ctx, { query: findcountry })
        .then( (res) => {
            var arr = res.data;
            async function get_country(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CountryLang.find(ctx, { query: {countryid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_country(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Country", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Country update for mutiple language (all fields are mandatory)
    update: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.countryname);
        });
        let wherecond = {
            languageid: langid,
            countryname: langname,
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
            countryid: { [Op.ne]: ctx.params.id }
        };

        return CountryLang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                Country.updateBy(ctx, 1, {
                    countrycode: ctx.params.countrycode,
                    countryiso: ctx.params.countryiso,
                    status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    ctx.params.language.map((lan_item)=>{
                        CountryLang.find(ctx, { query: {countryid: ctx.params.id,languageid: lan_item.languageid} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            {
                                CountryLang.insert(ctx, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    countryname: lan_item.countryname,
                                    countryid: ctx.params.id,
                                    status: ctx.params.status
                                })
                            }
                            else {
                                CountryLang.updateBy(ctx, 1, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshort_name,
                                    countryname: lan_item.countryname,
                                    countryshortname: lan_item.countryshortname,
                                    status: ctx.params.status
                                }, { query: {
                                    languageid: lan_item.languageid,
                                    countryid: ctx.params.id
                                    }
                                })
                            }
                        })
                    })
                })
                ctx.meta.log = "Country Updated by Admin";
			    activity.setLog(ctx);
                return this.requestSuccess("Country Updated", ctx.params.language[0].countryname);
            }
            else
            {
                ctx.meta.log = "Attempt to Update Country failed by Admin";
			    activity.setLog(ctx);
                return this.requestError(`Country Name ${ res.data[0].countryname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to Update Country failed by Admin";
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

    //Country delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Country.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Country.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            }).then((res)=>{
                let update = {};
                update["status"] = 2;
                let des = {};
                    des["countryid"] = ctx.params.id;
                return CountryLang.updateMany(ctx,des,update)
                .then((resp)=>{
                    ctx.meta.log = "Country removed successfully";
			        activity.setLog(ctx);
                    return this.requestSuccess("Country Deleted", ctx.params.id);
                })
            })
    })
    }
}
