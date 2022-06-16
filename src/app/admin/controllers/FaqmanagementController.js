"use strict";
// DEVELOPED ON 21-12-2020

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
const Faq = new Database("Mfaq");
const FaqLang = new Database("Mfaqlang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation faqmanage
 * @permission create,update,remove,status
 * @whitelist getall,get
*/
module.exports = {

    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return Faq.insert(ctx, {
            status: ctx.params.status
        })
        .then( (res) => {
            ctx.params.language.map((lan_item)=>{
                FaqLang.insert(ctx, {
                    faqid: res.data.id,
                    languageid: lan_item.id,
                    languageshortname: lan_item.languageshortname,
                    question: lan_item.question,
                    answer: lan_item.answer,
                    sortorder: lan_item.sortorder
                })
            })
            ctx.meta.log = "Attempt to add city failed by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("Faq Created");
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to add city failed by Admin";
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

    },
    // cms list with multiple language
    getall: function(ctx) {
        let findfaq = {};
        findfaq['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Faq.find(ctx, { query: findfaq })
        .then( (res) => {
            var arr = res.data;
            async function get_faq(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await FaqLang.find(ctx, { filter:["languageid", "question", "answer", "sortorder", "status"],query: {faqid: arr[i].id}})
                    .then((lan_res)=>{
                        console.log('------------------------------------');
                        console.log('lan_res' , lan_res);
                        console.log('------------------------------------');
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_faq(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of FAQ", resy);
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
        return  Faq.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Faq.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                ctx.meta.log = "Status updated by Admin";
                activity.setLog(ctx);
                let update = {};
                update["status"] = ctx.params.status;
                let des = {};
                    des["faqid"] = ctx.params.id;
                FaqLang.updateMany(ctx,des,update)
                return this.requestSuccess("Status Updated Successfully");
            })


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
        return Faq.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_faq(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    /*
                     let language_val = await FaqLang.find(ctx, { filter:["languageid", "question", "answer", "sortorder", "status"],query: {faqid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}}) */
                    let language_val = await FaqLang.find(ctx, { filter:["languageid", "question", "answer", "sortorder", "status"],query: {faqid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_faq(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested FAQ", resy);
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
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return Faq.updateBy(ctx, 1, {
            status: ctx.params.status
        }, { query: {
                id: ctx.params.id
            }
        }).then((res)=>{

            ctx.params.language.map((lan_item)=>{
                FaqLang.updateBy(ctx, 1, {
                    languageid: lan_item.id,
                    languageshortname: lan_item.languageshortname,
                    question: lan_item.question,
                    answer: lan_item.answer,
                    sortorder: lan_item.sortorder
                }, { query: {
                    languageid: lan_item.id,
                    faqid: ctx.params.id
                    }
                    })
            })
            ctx.meta.log = "City updated by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("FAQ Updated");
        }).catch( (err) => {
            ctx.meta.log = "Attempt to update City failed by Admin";
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


    //FAQ delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Faq.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
			console.log('res------',res);
            Faq.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
			let update = {};
			update["status"] = 2;
			let des = {};
				des["faqid"] = ctx.params.id;
			return FaqLang.updateMany(ctx,des,update)
			.then((res)=>{
				ctx.meta.log = "Status updated by Admin";
				activity.setLog(ctx);
				return this.requestSuccess("FAQ Deleted Successfully")
			})

        })
    }
}
