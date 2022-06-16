
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
const Op = require("sequelize").Op;
const Sequ = require("sequelize");
const activity = require("../../../helpers/activitylog");
const notifiction = require("../../../helpers/pushnotification");
const db = require("../../../adapters/db");

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
	"created_at"
]);
const vendorfilt = new Database("Mvendor");
const vendorlangfilt = new Database("Mvendorlang");
const vendorimage = new Database("Mvendorimage");
const vendorlang = new Database("Mvendorlang");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

	// Review creation
	create: async function(ctx) {
		// activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
		// 	ctx.meta.username = res.data.email;
		// });
		return db.sequelize.query("EXEC SP_BookingReviewed :bookingid",{replacements: {bookingid: ctx.params.bookingid },type: Sequ.QueryTypes.SELECT})
			.then( async(res) => {

				ctx.params.servicelist.map(service => {
					Review.insert(ctx, {
						userid: ctx.params.userid,
						name: ctx.params.name,
						vendorid: ctx.params.vendorid,
						rating: ctx.params.rating,
						review: ctx.params.review,
						bookingid: ctx.params.bookingid,
						serviceid: service.service_id,
						email: ctx.params.email,
						contactnumber: ctx.params.contactnumber,
						isreview: 1,
					})
				})
				
				let Vendor = await vendorlang.find(ctx, { query: {vendorid: ctx.params.vendorid,languageid:1}}).then((res)=>{return res.data});
				ctx.meta.log = "Review Added successfully";
				activity.setLog(ctx);
				let obj = {};
				obj.msg = {"en": `${ctx.params.name} added bad review to ${Vendor[0].vendorname}`};
				obj.userkey = Vendor[0].vendorlangkey;
				obj.heading = {"en": "bad review added"};
				let notObj = {
					title: JSON.stringify(obj.heading),
					content: JSON.stringify(obj.msg),
					isdelivered: 1,
					userid: ctx.params.vendorid,
					usertype: "vendor"
				}
				if(ctx.params.rating <= 1)
				{
					
					notifiction.sendAdmin(obj).then((r) => {
						console.log('----',r)
						r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
						notifiction.saveNotification(ctx,notObj);
					});

					let notObj1 = {
						title: JSON.stringify(obj.heading),
						content: JSON.stringify(obj.msg),
						isdelivered: 1,
						userid: 1,
						usertype: "admin"
					}
					notifiction.sendAdmin(obj).then((r) => {
						r.recipients ? notObj1.isdelivered = 1 : notObj1.isdelivered = 0
						notifiction.saveNotification(ctx,notObj1);
					});
				}else{
					notifiction.sendAdmin(obj).then((r) => {
						r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
						notifiction.saveNotification(ctx,notObj);
					});
				}
				return this.requestSuccess("Review Successfly Created", "Thanks for your reviews");
			})
			.catch( (err) => {
				console.log("-----",err);
				ctx.meta.log = "Attempt to Add Failed";
				activity.setLog(ctx);
				if (err.name === "Database Error" && Array.isArray(err.data)){
					if (err.data[0].type === "unique" && err.data[0].field === "username")
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
		findreview["userid"] = ctx.meta.user.id;
		findreview["status"] = 1;
		return Reviewfilt.find(ctx, { query: findreview })
			.then( (res) => {
				//TO Get categories of vendor
				async function get_vendor(ctx, arr) {
					let total_array = [];
					for(var i = 0;i<arr.length;i++) {
						//to get language data of the vendor

						let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["vendorname"] = lan_res.data[0].vendorname;
								arr[i]["address"] = lan_res.data[0].vendoraddress;
								return arr[i];
							});

						//let vendor_image = await vendorfilt.find(ctx, { filter: ["image_url","photopath"],query: {id: arr[i].vendorid}})
						let vendor_image = await vendorimage.find(ctx, { filter: ["image_url","vendorimagepath"],query: {vendorid: arr[i].vendorid}})	
							.then((images)=>{
								arr[i]["images"] = images.data;
								return arr[i];
							});
						total_array.push(language_val_filter);
					}
					return total_array;
				}
				const vali =  get_vendor(ctx,res.data);
				return vali.then((resy)=>{
					return this.requestSuccess("Requested review list", resy);
				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},

	//Particular Review list in multiple language
	get: function(ctx) {
		let findreview = {};
		findreview["id"] = ctx.params.id ;
		findreview["status"] = 1;
		return Reviewfilt.find(ctx, { query: findreview })
			.then( (res) => {
				return res.data;
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},
	getbycount: async function(ctx) {
		try {
			let finData = {};
			let re = await db.sequelize.query(`SELECT COUNT(id) as count, rating
			FROM treview
			WHERE vendorid = ${ctx.params.vendorid}
			AND status = 1
			GROUP BY rating
			ORDER BY COUNT(id) DESC;`);
			//return re;
			if(re[0].length) {
				finData.totalcount = re[1];
				finData.data = re[0]
			} else {
				finData.data = [];
			}
			return Promise.all(re).then(() =>{
				return this.requestSuccess("Requested review count", finData);
			})
		} catch (err) {
			if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
		}
	},
	getbyrating: function(ctx) {
		let findreview = {};
		findreview["vendorid"] = ctx.params.vendorid;
		findreview["rating"] = ctx.params.rating ;
		findreview["status"] = 1;
		return Reviewfilt.find(ctx, { query: findreview })
			.then( (res) => {
				return this.requestSuccess("Requested review", res.data);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

    update: function(ctx) {

        return  Review.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Review.updateById(ctx, ctx.params.id, {
				rating: ctx.params.rating,
				review: ctx.params.review,					
            })
            .then((resp)=>{
                return this.requestSuccess("Review updated Successfully", ctx.params.id);
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

};
