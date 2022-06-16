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
	"email",
	"contactnumber",
    "review",
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

/**
 *
 * @annotation review
 * @permission create,remove,get,getall,review_approval,user_review,vendor_reviews,admin
 * @whitelist getall
 */
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
        if(ctx.params.isreview) {
            findreview['isreview'] = ctx.params.isreview;
        }
        findreview['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
            //TO Get categories of vendor
            async function get_name(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get language data of the vendor
                    let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["vendorname"] = lan_res.data.length ? lan_res.data[0].vendorname : "";
                        return arr[i];
                    });

                    let language_user_filter = await User.find(ctx, { query: {id: arr[i].userid}})
                    .then((lan_res)=>{
                        arr[i]["user_name"] = lan_res.data.length ? lan_res.data[0].firstname : "";
                        arr[i]["user_email"] = lan_res.data.length ? lan_res.data[0].email : "";
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

    //Particular Review list
    get: function(ctx) {
        let findreview = {};
        findreview['id'] = ctx.params.id ;
        findreview['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
           //TO Get categories of vendor
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

    //Review delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Reviewfilt.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Reviewfilt.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((resp)=>{
                return this.requestSuccess("Review Deleted", ctx.params.id);
            })
        })
    },

    review_approval: function(ctx) {

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
            })
            .then((resp)=>{
				if(resp.data.length > 0) {
					db.sequelize.query('EXEC SP_CalculateAvgRating :vendorid',{replacements: {vendorid: resp.data[0].vendorid },type: Sequ.QueryTypes.SELECT});
				}

                return this.requestSuccess("Review Verified Successfully", ctx.params.id);
            });
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

     //Particular Payment method list
     admin_list: async function(ctx) {
        // let playersList = await sequelize12.query('EXEC SP_VendorReviewDetail :vendorid,:rating,:review,:name',{replacements: {vendorid: ctx.params.vendorid,rating: ctx.params.rating,review: ctx.params.review,name: ctx.params.username,}, type: Sequ.QueryTypes.SELECT});
        // return this.requestSuccess("Review List", playersList);
    },

    // Admin verified Review list
    user_reviews: function(ctx) {
        let findreview = {};
        findreview['isreview'] = 1;
        findreview['userid'] = ctx.params.userid;
        findreview['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
            //TO Get categories of vendor
            async function get_vendordetails(ctx, arr) {

                let total_array = [];
                for(var i = 0;i<arr.length;i++) {

                    //to get language data of the vendor
                let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                .then((lan_res)=>{
                   arr[i]["vendorname"] = lan_res.data[0].vendorname;
                    return arr[i];
                });
                    // to get vendor images
                let vendor_image = await vendorfilt.find(ctx, { query: {id: arr[i].vendorid}})
                .then((images)=>{
                    arr[i]["images"] = images.data;
                    return arr[i];
                });
                total_array.push(language_val_filter);
                }
                return total_array;
            }
            let array = [];
            array.push(res.data);
            const vali =  get_vendordetails(ctx,res.data);
            return vali.then((resy)=>{
                return resy;
            })
            return res.data;
            //return this.requestSuccess("Requested review list", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    review_count: function(ctx) {
        return Reviewfilt.count(ctx, {
                vendorid: ctx.params.id,
                isreview: 1
               })
               .then((res)=>{
                return this.requestSuccess("Review list count", res.data);
               })
    },


    // Admin verified Review list
    vendor_reviews: function(ctx) {
        let findreview = {};
       // findreview['isreview'] = 1;
        findreview['vendorid'] = ctx.params.vendorid;
        if(ctx.params.isreview) {
            findreview['isreview'] = ctx.params.isreview;
        }
        findreview['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Reviewfilt.find(ctx, { query: findreview })
        .then( (res) => {
            //TO Get categories of vendor
            async function get_vendordetails(ctx, arr) {

                let total_array = [];
                for(var i = 0;i<arr.length;i++) {

                    //to get language data of the vendor
                let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                .then((lan_res)=>{
                   arr[i]["vendorname"] = lan_res.data[0].vendorname;
                    return arr[i];
                });

                    // to get vendor images
                let vendor_image = await vendorfilt.find(ctx, { query: {id: arr[i].vendorid}})
                .then((images)=>{
                    arr[i]["images"] = images.data;
                    return arr[i];
                });
                total_array.push(language_val_filter);
                }
                return total_array;
            }
            let array = [];
            array.push(res.data);
            const vali =  get_vendordetails(ctx,res.data);
            return vali.then((resy)=>{
                return resy;
            })
            return res.data;
            //return this.requestSuccess("Requested review list", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

}
