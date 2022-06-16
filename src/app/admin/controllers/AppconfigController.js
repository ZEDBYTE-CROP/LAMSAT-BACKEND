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
const Config = require("../../../../config");
const url = Config.get('/url')
const Social = new Database("Msocialmedia");
const Cms = new Database("Mcms");
const CmsLang = new Database("Mcmslang");
//Models
const Appconfig = new Database("Mappconfig");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation appconfig
 * @permission update
 * @whitelist get
 */
module.exports = {
	get: async function(ctx) {
		let findconfig = {};
        findconfig['status'] = 1;
        return Appconfig.find(ctx, { query: findconfig })
        .then( (res) => {
            return this.requestSuccess("App Configuration Details",res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
	},
	update: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return Appconfig.updateBy(ctx, 1, ctx.params, { query: {
			id: 1
		}
		})
		.then((res)=>{
			ctx.meta.log = "Activity log Updated.";
			activity.setLog(ctx);
			return this.requestSuccess("Configurations Updated", res.data);
		})
		.catch( (err) => {
			return err;
		});
	},
	getactive: function(ctx) {
        let findcms = {}; let findsmtp = {};
        if(ctx.params.status) {
            findcms['status'] = ctx.params.status;
        }
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { query: {cmsid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language
                    }})
                    .then((lan_res)=>{
                        lan_res.data.length > 0 ? arr[i]["pagetitle"] = lan_res.data[0].pagetitle:'';
                        lan_res.data.length > 0 ? arr[i]["pagecontent"] = lan_res.data[0].pagecontent:'';
                        return arr[i];
                    })
                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_cms(ctx,arr);
            return vali.then((resy)=>{
                   findsmtp['status'] = ctx.params.status;

                            return Social.find(ctx, { query: findsmtp })
                        .then( (media) => {
                            return Appconfig.find(ctx, { query: findsmtp })
                            .then( (config) => {
                                console.log(Config.get('/server/uri'));
                            return this.requestSuccess("List of SMTPS", [config.data,media.data,resy]);
                            })
                            })


                 })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },


    getCMS: function(ctx) {
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



}
