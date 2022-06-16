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

const Cms = new Database("Mcms");
const CmsLang = new Database("Mcmslang");

const Faq = new Database("Mfaq");
const FaqLang = new Database("Mfaqlang");
const FaqLangfilt = new Database("Mfaqlang",[
    "id",
    "faqlangkey",
    "languageid",
    "langshortname",
    "faqid",
    "question",
    "answer",
    "sortorder"
]);

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation PagemanagementController
 * @permission 'create,update,remove,getall,status,cmsstatus,get'
*/

module.exports = {

    // CMS creation with multiple language
    create: async function(ctx) {
        let findcms = {};
        findcms['cmsname'] = ctx.params.language[0].cmsname ? ctx.params.language[0].cmsname : { [Op.ne]: DELETE };
        findcms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return CmsLang.find(ctx, { query: findcms })
        .then((res) => {
            if (res.data.length === 0) {
                return Cms.insert(ctx, {
                    cmsstatus: ctx.params.cmsstatus,
                    status: ctx.params.status
                })
                .then( (res) => {
                    ctx.params.language.map((lan_item)=>{

                        lan_item['cmsid'] = res.data.id;
                        CmsLang.insert(ctx, {
                            cmsid: res.data.id,
                            languageid: lan_item.languageid,
                            langshortname: lan_item.langshortname,
                            cmsname: lan_item.cmsname,
                            pagetitle: lan_item.pagetitle,
                            keywords: lan_item.keywords,
                            description: lan_item.description,
                            pagecontent: lan_item.pagecontent,
                            slug: lan_item.slug,
                            sortorder: lan_item.sortorder
                        })
                    })
                    return this.requestSuccess("Cms Created", ctx.params.language[0].cmsname);
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
    // cms list with multiple language
    getAll: function(ctx) {
        let findcms = {};
        if(ctx.params.cmsstatus) {
            findcms['cmsstatus'] = ctx.params.cmsstatus;
        }
        findcms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { query: {cmsid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["cmsname"] = lan_res.data[0].cmsname;
                        arr[i]["pagetitle"] = lan_res.data[0].pagetitle;
                        arr[i]["keywords"] = lan_res.data[0].keywords;
                        arr[i]["description"] = lan_res.data[0].description;
                        arr[i]["pagecontent"] = lan_res.data[0].pagecontent;
                        arr[i]["slug"] = lan_res.data[0].slug;
                        arr[i]["sortorder"] = lan_res.data[0].sortorder;
                       // arr[i]["cmsstatus"] = lan_res.data[0].cmsstatus;
                        arr[i]["status"] = lan_res.data[0].status;
                        return arr[i];
                    })

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
                    let language_val = await CmsLang.find(ctx, { query: {cmsid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["cmsname"] = lan_res.data[0].cmsname;
                        arr[i]["pagetitle"] = lan_res.data[0].pagetitle;
                        arr[i]["keywords"] = lan_res.data[0].keywords;
                        arr[i]["description"] = lan_res.data[0].description;
                        arr[i]["pagecontent"] = lan_res.data[0].pagecontent;
                        arr[i]["slug"] = lan_res.data[0].slug;
                        arr[i]["sortorder"] = lan_res.data[0].sortorder;
                        arr[i]["cmsstatus"] = lan_res.data[0].cmsstatus;
                        arr[i]["status"] = lan_res.data[0].status;
                        return arr[i];
                    })

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

        let findcms = {};
        findcms['cmsid'] = { [Op.ne]: ctx.params.id }
        findcms['cmsname'] = ctx.params.language[0].cmsname ? ctx.params.language[0].cmsname : { [Op.ne]: DELETE };
        findcms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return CmsLang.find(ctx, { query: findcms })
        .then ((res) => {
            if (res.data.length === 0)
            {
                Cms.updateBy(ctx, 1, {
                    cmsstatus: ctx.params.cmsstatus,
                    status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{

                    ctx.params.language.map((lan_item)=>{
                        CmsLang.updateBy(ctx, 1, {
                            languageid: lan_item.languageid,
                            langshortname: lan_item.langshortname,
                            cmsname: lan_item.cmsname,
                            pagetitle: lan_item.pagetitle,
                            keywords: lan_item.keywords,
                            description: lan_item.description,
                            pagecontent: lan_item.pagecontent,
                            slug: lan_item.slug,
                            sortorder: lan_item.sortorder
                        }, { query: {
                            languageid: lan_item.languageid,
                            cmsid: ctx.params.id
                            }
                            })
                    })
                })

                return this.requestSuccess("Cms Updated", ctx.params.language[0].cmsname);

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
                return this.requestError(err);
        });
    },

     //CmsStatus update
     cmsstatus: function(ctx) {
        return Cms.updateBy(ctx, 1, {
            cmsstatus: ctx.params.cmsstatus
        }, { query: {
                id: ctx.params.id
            }
        }).then((res)=>{
            return this.requestSuccess("Cms Status Updated", ctx.params.id);
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
				des["cms"] = ctx.params.id;
            CmsLang.updateMany(ctx,des,update)
    })

    }
}
