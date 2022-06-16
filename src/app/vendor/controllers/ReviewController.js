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
const Sequ = require("sequelize");
const activity = require("../../../helpers/activitylog");
const db = require('../../../adapters/db');

//Models

const Review = new Database("Treview");
const Reviewfilt = new Database("Treview", [
    "id",
    "reviewkey",
    "userid",
    "name",
    "vendorid",
    "rating",
	"review",
	"email",
	"contactnumber",
    "isreview",
    "created_by",
    "created_at"
]);
const vendorfilt = new Database("Mvendor");
const vendorlangfilt = new Database("Mvendorlang");
const User = new Database("Muser");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // Review creation
    create: async function(ctx) {
        return Review.insert(ctx, {
            userid: ctx.params.userid,
            name: ctx.params.name,
            vendorid: ctx.params.vendorid,
            rating: ctx.params.rating,
			review: ctx.params.review,
			email: ctx.params.email,
			contactnumber: ctx.params.contactnumber,
			isreview: 1,
        })
        .then( (res) => {
           return this.requestSuccess("Review Successfly Created", "Thanks for your reviews");
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

    },
    // Admin verified Review list
    getall: function(ctx) {
        let findreview = {};
        findreview['vendorid'] = ctx.meta.user.id;
        if(ctx.params.userid != null) {
            findreview['userid'] = ctx.params.userid;
        }
        if(ctx.params.isreview != null) {
            findreview['isreview'] = ctx.params.isreview;
        }
        findreview['status'] =  { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
            async function get_name(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get language data of the vendor
                    let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["vendorname"] = lan_res.data[0].vendorname;
                        return arr[i];
                    });

                    let language_user_filter = await User.find(ctx, { query: {id: arr[i].userid}})
                    .then((lan_res)=>{
                        arr[i]["user_name"] = lan_res.data[0].firstname;
						arr[i]["user_email"] = lan_res.data[0].email;
						arr[i]["contactnumber"] = lan_res.data[0].contactnumber;
                        return arr[i];
                    });
                    total_array.push(language_val_filter);
                }
                return total_array;
            }
            const vali =  get_name(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested review list", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //Particular Review list in multiple language
    get: function(ctx) {
        let findreview = {};
        findreview['id'] = ctx.params.id ;
        findreview['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
            async function get_name(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get language data of the vendor
                    let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["vendorname"] = lan_res.data[0].vendorname;
                        return arr[i];
                    });

                    let language_user_filter = await User.find(ctx, { query: {id: arr[i].userid}})
                    .then((lan_res)=>{
                        arr[i]["user_name"] = lan_res.data[0].firstname;
                        arr[i]["user_email"] = lan_res.data[0].email;
                        return arr[i];
                    });
                    total_array.push(language_val_filter);
                }
                return total_array;
            }
            const vali =  get_name(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested review list", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //vendor approving user's review for their saloon
    review_approval: function(ctx) {
        activity.getAdmin(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.username;
			// console.log(activityData);
		});
        return  Review.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Review.updateBy(ctx, res.data.id, {
                isreview: ctx.params.approval
                }, { query: {
                    id: ctx.params.id
                }
            }).then((resp)=>{
				if(resp.data.length > 0) {
					db.sequelize.query('EXEC SP_CalculateAvgRating :vendorid',{replacements: {vendorid: resp.data[0].vendorid },type: Sequ.QueryTypes.SELECT});
				}

                ctx.meta.log = 'User Review Approved';
				activity.setLog(ctx);
            	return this.requestSuccess("Review Verified Successfully", ctx.params.id);
            });
        })
        .catch( (err) => {
            ctx.meta.log = 'User Review Approve Failed';
            activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });

    },

    review_count: function(ctx) {
        var findcount = {};
        findcount['vendorid'] = ctx.meta.user.id;
        if(ctx.params.isreview != null){
            findcount['isreview'] = ctx.params.isreview;
        }
        return Reviewfilt.count(ctx, findcount)
               .then((res)=>{
                return this.requestSuccess("Review list count", res.data);
               })
    },

    //Review delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getAdmin(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.username;
			// console.log(activityData);
		});
        return  Reviewfilt.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Reviewfilt.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            ctx.meta.log = 'User Review Removed successfully';
            activity.setLog(ctx);
            return this.requestSuccess("Review Deleted", ctx.params.id);
    })

    }
}
