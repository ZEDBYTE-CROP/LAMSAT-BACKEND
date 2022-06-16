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
const handlebars = require('handlebars');
const mail_template = __dirname;
//Models

const Newsletter = new Database("Mnewsletter");
const newsletterfilt = new Database("Mnewsletter",[
    "id",
    "newsletterkey",
    "newslettertitle",
    "newslettercontent",
    "status"
]);
const Mnewslettersubscribe = new Database("Mnewslettersubscribe");


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation Newsletter
 * @permission create,update,remove,getall,status,get,subscriber_getall,subscriber_remove,subcribers_mail
 */

module.exports = {

    // Service creation with multiple language
    create: async function(ctx) {

        let findnewsletter = {};
        findnewsletter['newslettertitle'] = ctx.params.newslettertitle;
        findnewsletter['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Newsletter.find(ctx, { query: findnewsletter })
        .then ((res) => {
            if (res.data.length === 0)
            {                
                return Newsletter.insert(ctx, {
                    newslettertitle:ctx.params.newslettertitle,
                    newslettercontent: ctx.params.newslettercontent,
                })
                .then( (res) => {                    
                    return this.requestSuccess("Newsletter Created", ctx.params.newslettertitle);
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
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        });
    },
    // Service list with multiple language for respective hotel
    getAll: function(ctx) {
        let findnewsletter = {};          
        findnewsletter['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return newsletterfilt.find(ctx, { query: findnewsletter })
        .then( (res) => {
            return res.data;
        })
        .catch( (err) => {			
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

	},
	    
    //status updation for Status in both language
    status: function(ctx) {
        return  Service.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Service.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            let update = {};
                update["status"] = ctx.params.status;
            let des = {};
				des["serviceid"] = ctx.params.id;
                Servicelang.updateMany(ctx,des,update)
            return this.requestSuccess("Status Changed", ctx.params.id);

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        });

    },
   //Particular Service list in multiple language
    get: function(ctx) {
        let findnewsletter = {};
        findnewsletter['id'] = ctx.params.id;
        findnewsletter['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Newsletter.find(ctx, { query: findnewsletter })
        .then( (res) => {
            return res.data;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },
    //Service update for mutiple language (all fields are mandatory)
    update: async function(ctx) {
        let findnewsletter = {};
        findnewsletter['id'] = { [Op.ne]: ctx.params.id }
        findnewsletter['newslettertitle'] =  ctx.params.newslettertitle ;
        findnewsletter['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Newsletter.find(ctx, { query: findnewsletter })
        .then ((res) => {
            if (res.data.length === 0)
            {
               return Newsletter.updateBy(ctx, 1, {
                    newslettertitle:ctx.params.newslettertitle,
                    newslettercontent: ctx.params.newslettercontent,
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    return this.requestSuccess("Newsletter Updated", ctx.params.newslettertitle)
                })                              
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
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },
    //Newsletter delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Newsletter.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
           return Newsletter.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })                        
            .then((res)=>{
                return this.requestSuccess("Newsletter Deleted", ctx.params.id);
            })
        })

    },

    subscriber_getall: async function(ctx) {
        let findsubscribers = {};          
        findsubscribers['status'] = 1;
        return Mnewslettersubscribe.find(ctx, { query: findsubscribers })
        .then( (res) => {
            return res.data;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
        
    },

    //Subscriber delete is used change the status and not complete delete
    subscriber_remove: function(ctx) {
        return  Mnewslettersubscribe.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
           return Mnewslettersubscribe.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })                        
            .then((res)=>{
                return this.requestSuccess("Subscribe Deleted", ctx.params.id);
            })
        })

    },

    subcribers_mail: function(ctx) {     
        return  Newsletter.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then((res)=>{
            //console.log(result.data)
            fs.writeFile(mail_template + "/Subscribertemplate.html", res.data.newslettercontent, (err) => { 
                if (err) throw err; 
            }) 
            let findsubscribers = {};          
            findsubscribers['status'] = 1;
            return Mnewslettersubscribe.find(ctx, { query: findsubscribers })
            .then( (result) => {                            
                result.data.map((emails)=>{
                    let readHTMLFile = function(path, callback) {
                        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                            if (err) {
                                throw err;
                            }
                            else {
                                callback(null, html);
                            }
                        });
                    };
                    readHTMLFile(mail_template + "/Subscribertemplate.html", function(err, html) {
                        let template = handlebars.compile(html);
                        const htmlToSend = template();
                        ctx.call("mail.send", {
                            to: emails.email,
                            subject: res.data.newslettertitle,
                            html: htmlToSend
                        })
                        .then((res) => {
                            return "Email send Successfully";
                        })
                    })                    
                })                           
            })
        })
    }
}
