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
const Op = require("sequelize").Op;
const Sequ = require("sequelize");
const db = require("../../../adapters/db");


//Models

const Category = new Database("Mcategory");
const Categorylang = new Database("Mcategorylang");


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation category
 * @permission create,update,status,remove,
 * @whitelist get,getall,getall_mob,categoryApprovalReject
 */
module.exports = {

	// Category creation with multiple language
	create: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		/*
            To validate the primary language
            field already exist
        */
		let langid = [];
		let langname = [];
		ctx.params.language.map((item)=>{
			langid.push(item.languageid);
			langname.push(item.categoryname);
		});
		let wherecond = {
			languageid: langid,
			categoryname: langname,
			status: 1,
		};
		return Categorylang.find(ctx, { query: wherecond })
			.then(async(res)=>{
				var checkcategory
				if (res.data.length != 0) {
					checkcategory = await Category.find(ctx,{query :{id: res.data[0].categoryid,status:1}}).then((res) => {
						return res.data; 
					});
				} else {
					checkcategory = []
				}
				if (checkcategory.length === 0) {
					return Category.insert(ctx, {
						image_url: ctx.params.image_url,
						photopath: ctx.params.photopath,
						status: ctx.params.status,
						permission: "Approved",
						is_admin: 1,
						color: ctx.params.color,
					})
						.then( (res) => {
							ctx.params.language.map((lan_item)=>{
								lan_item["categoryid"] = res.data.id;
								Categorylang.insert(ctx, {
									languageid: lan_item.languageid,
									langshortname: lan_item.langshortname,
									categoryname: lan_item.categoryname,
									categorydesc: lan_item.categorydesc,
									categoryid: res.data.id
								});
							});
							ctx.meta.log = "New Category added by Admin";
							activity.setLog(ctx);
							return this.requestSuccess("Category Created", ctx.params.language[0].categoryname);
						})
						.catch( (err) => {
							ctx.meta.log = "Attempt to add New area Failed by user";
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
				}
				else {
					return this.requestError(`Category Name ${ res.data[0].categoryname } ${CodeTypes.ALREADY_EXIST}`);
				}
			});
	},
	// Category list with multiple language
	getall: function(ctx) {
		let findcategory = {};
		findcategory["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Category.find(ctx, { query: findcategory })
			.then( (res) => {
				let arr = res.data;
				async function get_category(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						let language_val = await Categorylang.find(ctx, { filter:["languageid","categoryid", "categoryname"],query: {categoryid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let subject_lang = await Categorylang.find(ctx, { query: {categoryid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								arr[i]["categorydesc"] = lan_res.data[0].categorydesc;
								return arr[i];
							});

						final.push(subject_lang);
					}
					return final;
				}
				const vali =  get_category(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Category Details",resy);
				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},

	// Category list with multiple language
	getalladmincat: function(ctx) {
		let findcategory = {};
		let lang = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1;
		findcategory["status"] = ctx.params.status ? ctx.params.status : 1;
		findcategory["is_admin"] = { [Op.eq]: ACTIVE };
		return Category.find(ctx, { query: findcategory })
			.then( (res) => {
				let arr = res.data;
				async function get_category(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						let language_val = await Categorylang.find(ctx, { filter:["languageid","categoryid", "categoryname"],query: {categoryid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let subject_lang = await Categorylang.find(ctx, { query: {categoryid: arr[i].id,languageid: lang}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								arr[i]["categorydesc"] = lan_res.data[0].categorydesc;
								return arr[i];
							});

						final.push(subject_lang);
					}
					return final;
				}
				const vali =  get_category(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Category Details",resy);
				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},

	// Category list with multiple language
	getall_mob: function(ctx) {
		let findcategory = {};
		findcategory["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Category.find(ctx, { query: findcategory })
			.then( (res) => {
				let arr = res.data;
				async function get_category(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						let language_val = await Categorylang.find(ctx, { filter:["languageid","categoryname"],query: {categoryid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						final.push(language_val);
					}
					return final;
				}
				const vali =  get_category(ctx,arr);
				return vali.then((resy)=>{
					return resy;
				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},


	// Category list with multiple language
	getadmincats: async function(ctx) {
		const languageid = 1;
		let category_list = await db.sequelize.query("EXEC SP_GetAdminCategories :languageid",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid },type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Categories found!", category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : {});
	},

	//status updation for City in both language
	status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return  Category.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				Category.updateBy(ctx, res.data.id, {
					status: ctx.params.status
				}, { query: {
					id: ctx.params.id
				}
				});
				let update = {};
				update["status"] = ctx.params.status;
				let des = {};
				des["categoryid"] = ctx.params.id;
				Categorylang.updateMany(ctx,des,update);
				ctx.meta.log = "Category Status by Admin";
				activity.setLog(ctx);
				return this.requestSuccess("Status Changed", ctx.params.id);

			})
			.catch( (err) => {
				ctx.meta.log = "Attempt to update category status failed by Admin";
				activity.setLog(ctx);
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return err;

			});

	},
	//Particular Category list in multiple language
	get: function(ctx) {
		let findcategory = {};
		findcategory["id"] = ctx.params.id;
		findcategory["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Category.find(ctx, { query: findcategory })
			.then( (res) => {
				let arr = res.data;
				async function get_area(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						let language_val = await Categorylang.find(ctx, { query: {categoryid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let subject_lang = await Categorylang.find(ctx, { query: {categoryid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								arr[i]["categorydesc"] = lan_res.data[0].categorydesc;
								return arr[i];
							});

						final.push(language_val);
					}
					return final;
				}
				const vali =  get_area(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Requested Category", resy);
				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},
	//Category update for mutiple language (all fields are mandatory)
	update: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		let langid = [];
		let langname = [];
		ctx.params.language.map((item)=>{
			langid.push(item.languageid);
			langname.push(item.categoryname);
		});
		let wherecond = {
			languageid: langid,
			categoryname: langname,
			status: 1,
			categoryid: { [Op.ne]: ctx.params.id }
		};
		return Categorylang.find(ctx, { query: wherecond })
			.then ((res) => {
				if (res.data.length === 0)
				{
					Category.updateBy(ctx, 1, {
						image_url: ctx.params.image_url,
						photopath: ctx.params.photopath,
						status: ctx.params.status,
						color: ctx.params.color,
					}, { query: {
						id: ctx.params.id
					}
					}).then((res)=>{

						ctx.params.language.map((lan_item)=>{
							Categorylang.find(ctx, { query: {categoryid: ctx.params.id,languageid: lan_item.languageid} })
								.then((result)=>{
									if(result.data.length === 0)
									{
										Categorylang.insert(ctx, {
											languageid: lan_item.languageid,
											langshortname: lan_item.langshortname,
											categoryname: lan_item.categoryname,
											categorydesc: lan_item.categorydesc,
											categoryid: ctx.params.id
										});
									}
									else {
										Categorylang.updateBy(ctx, 1, {
											languageid: lan_item.languageid,
											langshortname: lan_item.langshortname,
											categoryname: lan_item.categoryname,
											categorydesc: lan_item.categorydesc
										}, { query: {
											languageid: lan_item.languageid,
											categoryid: ctx.params.id
										}
										});
									}
								});
						});
					});
					ctx.meta.log = "Category Updated by Admin";
					activity.setLog(ctx);
					return this.requestSuccess("Category Updated", ctx.params.language[0].categoryname);

				}
				else
				{
					ctx.meta.log = "Attempt to update Category Name failed,category name already exit by Admin";
					activity.setLog(ctx);
					return this.requestError(`Category Name ${ res.data[0].categoryname } ${CodeTypes.ALREADY_EXIST}`);
				}
			})
			.catch( (err) => {
				ctx.meta.log = "Attempt to update Category failed by Admin";
				activity.setLog(ctx);
				if (err.name === "Database Error" && Array.isArray(err.data)){
					if (err.data[0].type === "unique" && err.data[0].field === "first")
						return this.requestError(CodeTypes.T1_FIRST_CONSTRAINT);
				}
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});

	},
	//Category delete is used change the status and not complete delete
	remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return  Category.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				return Category.updateBy(ctx, res.data.id, {
					status: 2
				}, { query: {
					id: ctx.params.id
				}
				})
					.then((resp)=>{
						ctx.meta.log = "New Category added by Admin";
						activity.setLog(ctx);
						let update = {};
						update["status"] = 2;
						let des = {};
						des["categoryid"] = ctx.params.id;
						Categorylang.updateMany(ctx,des,update);
						return this.requestSuccess("Category Deleted", ctx.params.id);
					});


			});

	},

	categoryApprovalReject: function(ctx) {
		return  Category.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				Category.updateBy(ctx, res.data.id, {
					permission: ctx.params.field,
					status: 1
				}, { query: {
					id: ctx.params.id
				}
				});
				return this.requestSuccess("Catrgory Permission Status Changed", ctx.params.id);
			});
	}
};
