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

const Cms = new Database("Mcms");
const CmsLang = new Database("Mcmslang");


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation PagemanagementController
 * @permission create,update,remove,status
 * @whitelist getall,get
*/
module.exports = {

    // CMS creation with multiple language
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var pagetitle = [];
        ctx.params.language.map((item)=>{          
            langid.push(item.id);
            pagetitle.push(item.pagetitle);
        });
        let wherecond = {
            languageid: langid,
            status: 1,
            pagetitle: pagetitle,
        };
       
        return CmsLang.find(ctx, { query: wherecond })
        .then((res) => {
            if (res.data.length === 0) {
                return Cms.insert(ctx, {
                    status: ctx.params.status
                })
                .then( (res) => {
                    ctx.params.language.map((lan_item)=>{

                        lan_item['cmsid'] = res.data.id;
                        CmsLang.insert(ctx, {
                            cmsid: res.data.id,
                            languageid: lan_item.id,
                            languageshortname: lan_item.languageshortname,
                            pagetitle: lan_item.pagetitle,
                            keywords: lan_item.keywords,
                            description: lan_item.description,
                            pagecontent: lan_item.pagecontent,
                            slug: lan_item.slug,
                            sortorder: lan_item.sortorder
                        })
                    })
                    return this.requestSuccess("Cms Created", ctx.params.language[0].pagetitle);
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
                return this.requestError(`CMS  ${ res.data[0].pagetitle } ${CodeTypes.ALREADY_EXIST}`);
            }
        })

    },
    // cms list with multiple language
    getall: function(ctx) {
        let findcms = {};
        findcms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { filter:["languageid","pagetitle", "keywords", "description","pagecontent","slug","sortorder"],query: {cmsid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });
                    
                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_cms(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of CMS", resy);
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

        return  Cms.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Cms.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })

            let update = {};
                update["status"] = ctx.params.status;
            let des = {};
				des["cmsid"] = ctx.params.id;
            CmsLang.updateMany(ctx,des,update)
            return this.requestSuccess("Status updated Cms", ctx.params.id);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });

    },
    //Particular cms list in multiple language
    get: function(ctx) {
        let findcms = {};
        findcms['id'] = ctx.params.id ;
        findcms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { filter:["languageid","pagetitle", "keywords", "description","pagecontent","slug","sortorder"],query: {cmsid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });
                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_cms(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Cms", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Cms update for mutiple language (all fields are mandatory)
    update: function(ctx) {
        var langid = [];
        var pagetitle = [];
        ctx.params.language.map((item)=>{          
            langid.push(item.id);
            pagetitle.push(item.pagetitle);
        });
        let wherecond = {
            languageid: langid,
            pagetitle: pagetitle,
            status: 1,
            cmsid: { [Op.ne]: ctx.params.id }
        };
       
        return CmsLang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                return Cms.updateBy(ctx, 1, {
                    status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{

                    ctx.params.language.map((lan_item)=>{
                        CmsLang.find(ctx, { query: {cmsid: ctx.params.id,languageid: lan_item.id} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            { 
                                CmsLang.insert(ctx, {
                                    cmsid: res.data.id,
                                    languageid: lan_item.id,
                                    languageshortname: lan_item.languageshortname,
                                    pagetitle: lan_item.pagetitle,
                                    keywords: lan_item.keywords,
                                    description: lan_item.description,
                                    pagecontent: lan_item.pagecontent,
                                    slug: lan_item.slug,
                                    sortorder: lan_item.sortorder
                                })                               
                            }
                            else {
                                CmsLang.updateBy(ctx, 1, {
                                    languageid: lan_item.id,
                                    languageshortname: lan_item.languageshortname,
                                    pagetitle: lan_item.pagetitle,
                                    keywords: lan_item.keywords,
                                    description: lan_item.description,
                                    pagecontent: lan_item.pagecontent,
                                    slug: lan_item.slug,
                                    sortorder: lan_item.sortorder
                                }, { query: {
                                    languageid: lan_item.id,
                                    cmsid: ctx.params.id
                                    }
                                    })
                            }
                        })
                    })
                })
                .then((res)=>{
                    return this.requestSuccess("Cms Updated", ctx.params.language[0].pagetitle);
                })
                .catch((err)=>{
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
                })
            }
            else
            {
                return this.requestError(`CMS  ${ res.data[0].pagetitle } ${CodeTypes.ALREADY_EXIST}`);
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
                return this.requestError(err);
        });
    },


    //Cms delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Cms.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Cms.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })

            let update = {};
                update["status"] = 2;
            let des = {};
				des["cmsid"] = ctx.params.id;
            return CmsLang.updateMany(ctx,des,update)
            .then((res)=>{
                return this.requestSuccess("CMS Deleted Successfully");
            })
    })

    }
}
