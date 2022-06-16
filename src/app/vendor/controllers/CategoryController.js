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
const activity = require("../../../helpers/activitylog");
const db = require("../../../adapters/db");
const Sequ = require("sequelize");

//Models

const Category = new Database("Mcategory");
const Categorylang = new Database("Mcategorylang");


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

	// Category creation with multiple language
	create: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		/*
            To validate the primary language
            field already exist and to convert the first letter
            in caps and remaining small
            below map function and capitalized function is used
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
			.then((res)=>{
				if (res.data.length === 0) {
					return Category.insert(ctx, {
						photopath: ctx.params.photopath,
						permission: ctx.params.permission,
						image_url: ctx.params.image_url,
						status: ctx.params.status,
						vendorid: ctx.params.vendorid,
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
									categoryid: res.data.id,
									status: 0
								});
							});

							//db.sequelize.query("EXEC SP_AddCatToVendor :categoryid :vendorid",{replacements: {categoryid: res.data.id, vendorid: ctx.params.vendorid},type: Sequ.QueryTypes.SELECT});


							ctx.meta.log = "Category Added successfully";
							activity.setLog(ctx);
							return this.requestSuccess("Category Created", ctx.params.language[0].categoryname);
						})
						.catch( (err) => {
							ctx.meta.log = "Attepmt to Add categroy failed";
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


	//Cat/Service list for vendor
	getCatServiceByVendor: async function(ctx) {
		const languageid = 1;
		const vendorid = parseInt(ctx.params.vendorid);
		let category_list = await db.sequelize.query("EXEC SP_GetCategoryAndServicesByVendor :languageid, :vendorid, :status",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid, vendorid:vendorid , status: "All"},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Services found!", category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : "");
	},

	//Cat/Service list for vendor
	getCatServiceByVendorId: async function(ctx) {
		const languageid = 1;
		const vendorid = parseInt(ctx.params.vendorid);
		let category_list = await db.sequelize.query("EXEC SP_GetCategoryAndServicesByVendorId :languageid, :vendorid, :status",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid, vendorid:vendorid , status: "All"},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Services found!", category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : "");
	},

	getCatServiceAllByVendor: async function(ctx) {
		const languageid = 1;
		let category_list = await db.sequelize.query("EXEC SP_GetCategoryAndServicesAllByVendor :vendorid, :status",{replacements: {vendorid: ctx.params.vendorid, status: "All"},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Services found!", category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : "");
	},

	getall: function(ctx) {
		let findcategory = {};
		findcategory["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		//findcategory['vendorid'] = ctx.params.vendorid;
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


	getVendorCategory: function(ctx) {
		let findcategory = {};
		console.log("ctx.params.vendorid "  ,ctx.params.vendorid );
		findcategory["status"] = 1;
		findcategory["id"] = ctx.params.vendorid;


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

	getallVendor: function(ctx) {
		let findcategory = {};
		console.log("ctx.params.categoryid "  ,ctx.params.categoryid );
		findcategory["status"] = 1;
		findcategory["id"] = ctx.params.categoryid;


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
											categoryid: ctx.params.id
										});
									}
									else {
										Categorylang.updateBy(ctx, 1, {
											languageid: lan_item.languageid,
											langshortname: lan_item.langshortname,
											categoryname: lan_item.categoryname
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

	}
};
