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

const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");
const Serviceprice = new Database("Mserviceprice");
const Staff = new Database("Mvendorstaff");
const Categorylangfilt = new Database("Mcategorylang", [
	"id",
	"mcategorylangkey",
	"languageid",
	"langshortname",
	"categoryid",
	"categoryname",
	"created_by",
	"created_at",
]);
const Category = new Database("Mcategory");
const vendor = new Database("Mvendor");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

	// Service creation with multiple language
	create: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		let langid = [];
		let langname = [];
		let testname = "";
		ctx.params.language.map((item)=>{
			langid.push(item.languageid);
			langname.push(item.servicename);
		});
		let wherecond = {
			languageid: langid,
			servicename: langname,
			status: 1,
			vendorid: ctx.params.vendorid
		};
		return Servicelang.find(ctx, { query: wherecond })
			.then((res)=>{
				if(res.data.length === 0) {
					let sev_staff = ctx.params.service_staff.toString();
					return Service.insert(ctx, {
						vendorid: ctx.params.vendorid,
						categoryid: ctx.params.categoryid,
						admincategoryid: ctx.params.admincategoryid,
						availability: ctx.params.availability,
						//tax: ctx.params.tax,
						photopath: ctx.params.photopath,
						permission : ctx.params.permission,
						image_url: ctx.params.image_url,
						service_staff: sev_staff,
						status: ctx.params.status,
					})
						.then(async(res)=>{
							ctx.params.service_staff.map(async(staff)=>{
								let staff_det = await Staff.findOne(ctx,{query: {
									id: staff
								}});
								let temp = staff_det.data.serviceid;
								if(temp != null){
									let temp_arr = temp.split(",");
									let serv_id  = res.data.id.toString();
									if(temp_arr.includes(serv_id) != true){
										temp_arr.push(serv_id);
										let jam = temp_arr.toString();
										Staff.updateBy(ctx, 1, {
											serviceid: jam
										}, { query: {
											id: staff
										}
										}).then(res => console.log('updated---',res))
										.catch(err => console.log('update error---',err));

									}
								}
							});
							ctx.params.language.map((lan_item)=>{
								Servicelang.insert(ctx, {
									languageid: lan_item.languageid,
									langshortname: lan_item.langshortname,
									servicename: lan_item.servicename,
									vendorid: ctx.params.vendorid,
									serviceid: res.data.id,
									description: ctx.params.description
								});
							});

							ctx.params.price.map((price)=>{
								Serviceprice.insert(ctx,{
									vendorid: ctx.params.vendorid,
									serviceid: res.data.id,
									pricing_name: price.pricing_name,
									duration: this.convetToMin(price.duration),
									pricetype: price.pricetype,
									price: price.price,
									special_price: price.special_price
								});
							});
							var vendorupdate = await vendor.find(ctx, { query: {id: ctx.params.vendorid} })
							.then(async(res)=> {
								console.log(res.data)
								if(res.data.length)
								{
									await vendor.updateBy(ctx, 1, {
										isserviceaccepted: 1
									}, { query: {
										id:res.data[0].id
									}
									});
								}
							}) 
							ctx.meta.log = "Category Added successfully";
							activity.setLog(ctx);
							return this.requestSuccess("Service Created", ctx.params.language[0].servicename);
						});
				}
				else {
					ctx.meta.log = `Service Name ${ res.data[0].servicename } ${CodeTypes.ALREADY_EXIST}`;
					activity.setLog(ctx);
					return this.requestError(CodeTypes.ALREADY_EXIST);
				}
			})
			.catch( (err) => {
				ctx.meta.log = "Attempt to add service failed";
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

	// Service list with multiple language for respective vendor
	getall: async function(ctx) {
		let category_list = await db.sequelize.query("EXEC SP_category :languageid",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT});
		let findservice = {};
		findservice["vendorid"] = ctx.params.vendorid;
		if(ctx.params.categoryid) {
			findservice["categoryid"] = ctx.params.categoryid;
		}
		findservice["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Service.find(ctx, { query: findservice })
			.then( (res) => {
				let arr = res.data;
				async function get_services(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						//converting string of staff id's into array
						let ser_staff = arr[i].service_staff.split(",");
						arr[i]["service_staff"] = ser_staff;
						let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["servicename"] = lan_res.data[0].servicename;
								return arr[i];
							});

						let price_option = await Serviceprice.find(ctx, { filter: ["id","pricing_name", "duration","pricetype", "price", "special_price"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["price"] = lan_res.data;
								return arr[i];
							});

						final.push(language_val);
					}
					return final;
				}
				let ser_arr = [];
				const vali =  get_services(ctx,arr);
				return vali.then((resy)=>{
					category_list.map((valy)=>{
						resy.map((ans)=>{
							if(valy.id == ans.categoryid){
								ser_arr.push(ans);
							}
						});
						valy["service"] =  ser_arr;
						ser_arr = [];
					});
					return this.requestSuccess("Services found!",category_list);

				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},
	// Service list with multiple language for respective vendor
	getall_mob: function(ctx) {
		let findservice = {};
		findservice["vendorid"] = ctx.params.vendorid;
		if(ctx.params.categoryid) {
			findservice["categoryid"] = ctx.params.categoryid;
		}
		findservice["status"] = 1;
		return Service.find(ctx, { query: findservice })
			.then( (res) => {
				let arr = res.data;
				async function get_services(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						//converting string of staff id's into array
						let ser_staff = arr[i].service_staff.split(",");
						arr[i]["service_staff"] = ser_staff;

						let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								return arr[i];
							});

						let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["servicename"] = lan_res.data[0].servicename;
								return arr[i];
							});

						// let language_val1 = await Servicelang.find(ctx, { filter: ['languageid', 'servicename','description'],query: {serviceid: arr[i].id}})
						// .then((lan_res)=>{
						//     arr[i]["language"] = lan_res.data;
						//     return arr[i];
						// });

						let price_option = await Serviceprice.find(ctx, { filter: ["id","pricing_name", "duration","pricetype", "price", "special_price"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["price"] = lan_res.data;
								return arr[i];
							});

						final.push(language_val);
					}
					return final;
				}
				const vali =  get_services(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Services found!",resy);

				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},
	//Particular Service list in multiple language
	get: function(ctx) {
		let findservice = {};
		findservice["id"] = ctx.params.id;
		findservice["status"] = 1;
		return Service.find(ctx, { query: findservice })
			.then( (res) => {
				let arr = res.data;
				console.log(res)
				async function get_services(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						//converting string of staff id's into array
						let ser_staff = arr[i].service_staff.split(",");
						arr[i]["service_staff"] = ser_staff;

						let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								return arr[i];
							});

						let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["servicename"] = lan_res.data[0].servicename;
								return arr[i];
							});

						let language_val1 = await Servicelang.find(ctx, { filter: ["id","languageid", "servicename","description"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let price_option = await Serviceprice.find(ctx, { filter: ["id","pricing_name", "duration","pricetype", "price", "special_price"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["price"] = lan_res.data;
								return arr[i];
							});
						final.push(language_val);
					}
					return final;
				}
				// const vali =  get_services(ctx,arr);
				// return vali.then((resy)=>{
				// 	return this.requestSuccess("Service found!",resy);
				// });
				return this.requestSuccess("Service found vendor !",res);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	//get Particular Service list with all details

	getbyid: function(ctx) {
		let findservice = {};
		findservice["id"] = ctx.params.id;
		//findservice["status"] = 1;
		return Service.find(ctx, {filter: ["id","vendorid","categoryid","availability","tax","service_staff","image_url","photopath","status","admincategoryid" ], query: findservice })
			.then( async(res) => {
				let arr = res.data;
					let language_val1 = await Servicelang.find(ctx, {filter: ["id","serviceid","languageid","langshortname","servicename","description","status"] , query: {serviceid: arr[0].id}})
						.then((lan_res)=>{
							arr[0]["servicelanguage"] = lan_res.data;
							return arr[0];
						});
					let price_option = await Serviceprice.find(ctx, {filter: ["id","serviceid","duration","pricetype","price","special_price","status"] ,query: {serviceid: arr[0].id}})
						.then((lan_resprice)=>{
							arr[0]["serviceprice"] = lan_resprice.data;
							return arr[0];
						});
				return this.requestSuccess("Service found!",arr);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	//status updation for Status in both language
	status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
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
				});
				let update = {};
				update["status"] = ctx.params.status;
				let des = {};
				des["serviceid"] = ctx.params.id;
				Servicelang.updateMany(ctx,des,update);
				ctx.meta.log = "Service Status updated successfully";
				activity.setLog(ctx);
				return this.requestSuccess("Status Changed", ctx.params.id);

			})
			.catch( (err) => {
				ctx.meta.log = "Attempt to update Service Status failed";
				activity.setLog(ctx);
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return err;
			});
	},
	//Service update for mutiple language (all fields are mandatory)
	update: async function(ctx) {
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
		let testname = "";
		ctx.params.language.map((item)=>{
			langid.push(item.languageid);
			langname.push(item.servicename);

		});
		let wherecond = {
			languageid: langid,
			servicename: langname,
			status: 1,
			vendorid: ctx.params.vendorid,
			serviceid: {[Op.ne]: ctx.params.id}
		};

		await Serviceprice.removeMany(ctx,{
			serviceid: ctx.params.id
		});
		return Servicelang.find(ctx, { query: wherecond })
			.then ((res) => {
				if (res.data.length === 0)
				{
					let sev_staff = ctx.params.service_staff.toString();
					Service.updateBy(ctx, 1, {
						categoryid: ctx.params.categoryid,
						admincategoryid: ctx.params.admincategoryid,
						vendorid: ctx.params.vendorid,
						availability: ctx.params.availability,
						//tax: ctx.params.tax,
						photopath: ctx.params.photopath,
						image_url: ctx.params.image_url,
						service_staff: sev_staff
					}, { query: {
						id: ctx.params.id
					}
					}).then((res)=>{
						ctx.params.language.map((lan_item)=>{
							Servicelang.find(ctx, { query: {serviceid: ctx.params.id,languageid: lan_item.languageid} })
								.then((result)=>{
									if(result.data.length === 0)
									{
										Servicelang.insert(ctx, {
											languageid: lan_item.languageid,
											langshortname: lan_item.langshortname,
											servicename: lan_item.servicename,
											vendorid: ctx.params.vendorid,
											serviceid: ctx.params.id,
											description: ctx.params.description
										});
									}
									else {
										Servicelang.updateBy(ctx, 1, {
											languageid: lan_item.languageid,
											langshortname: lan_item.langshortname,
											servicename: lan_item.servicename,
											vendorid: ctx.params.vendorid,
											description: ctx.params.description
										}, { query: {
											languageid: lan_item.languageid,
											serviceid: ctx.params.id
										}
										});
									}
								});
						});

						ctx.params.price.map((value)=>{
							Serviceprice.insert(ctx,{
								vendorid: ctx.params.vendorid,
								serviceid: ctx.params.id,
								pricing_name: value.pricing_name,
								duration: this.convetToMin(value.duration),
								pricetype: value.pricetype,
								price: value.price,
								special_price: value.special_price
							});
						});
					});
					ctx.meta.log = "Service Updated Successfully";
					activity.setLog(ctx);
					return this.requestSuccess("Service Updated", ctx.params.language[0].servicename);
				}
				else
				{
					ctx.meta.log = "Service Update failed";
					activity.setLog(ctx);
					return this.requestError(`Service Name ${ res.data[0].servicename } ${CodeTypes.ALREADY_EXIST}`);
				}
			})
			.catch( (err) => {
				ctx.meta.log = "Service Update failed";
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
	//Service delete is used change the status and not complete delete
	remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return Category.findOne(ctx,{query:{id: ctx.params.id}})
		.then((cres) => {
			if(cres.data) {
				return Category.updateBy(ctx,cres.data.id, {
					status:2
				},{ query: {
					id: ctx.params.id
				}
				}).then((ures) => {
					return  Service.find(ctx, { query: {
						categoryid: ctx.params.id
					}
					})
					.then (async (res) =>{
						if(res.data && res.data.length) {
							let servupdate = await res.data.map((serv,id) => {
								Service.updateBy(ctx, serv.id, {
									status: 2
								}, { query: {
									id: serv.id
								}
								});
								let update = {};
								update["status"] = 2;
								let des = {};
								des["serviceid"] = serv.id;
								Servicelang.updateMany(ctx,des,update);
							})
						}
						ctx.meta.log = "Service Removed Successfully";
						activity.setLog(ctx);
						return this.requestSuccess("Service Deleted", ctx.params.id);
					});
				})
			} else {
				return this.requestError("No category found");
			}
		})
	},

	getvendorservice : function(ctx){

		let findservice = {};
		if(ctx.params.vendorid) {
			findservice["vendorid"] = ctx.params.vendorid;
		}
		findservice["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Service.find(ctx, { query: findservice })
			.then( (res) => {
				let arr = res.data;
				async function get_services(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						//converting string of staff id's into array
						let ser_staff = arr[i].service_staff.split(",");
						arr[i]["service_staff"] = ser_staff;

						let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								return arr[i];
							});

						let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["servicename"] = lan_res.data[0].servicename;
								return arr[i];
							});

						let language_val1 = await Servicelang.find(ctx, { filter: ["languageid", "servicename","description"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let price_option = await Serviceprice.find(ctx, { filter: ["id","pricing_name", "duration","pricetype", "price", "special_price"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["price"] = lan_res.data;
								return arr[i];
							});

						final.push(language_val);
					}
					return final;
				}
				const vali =  get_services(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Services found!",resy);

				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	getVendorStaffService : function(ctx){

		let findservice = {};
		if(ctx.params.vendorid) {
			findservice["vendorid"] = ctx.params.vendorid;
		}
		findservice["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Service.find(ctx, { query: findservice })
			.then( (res) => {
				let arr = res.data;
				async function get_services(ctx, arr) {
					let final = [];
					for(var i = 0;i<arr.length;i++) {
						//converting string of staff id's into array
						let ser_staff = arr[i].service_staff.split(",");
						arr[i]["service_staff"] = ser_staff;

						let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["categoryname"] = lan_res.data[0].categoryname;
								return arr[i];
							});

						let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
							.then((lan_res)=>{
								arr[i]["servicename"] = lan_res.data[0].servicename;
								return arr[i];
							});

						let language_val1 = await Servicelang.find(ctx, { filter: ["languageid", "servicename","description"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});

						let price_option = await Serviceprice.find(ctx, { filter: ["id","pricing_name", "duration","pricetype", "price", "special_price"],query: {serviceid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["price"] = lan_res.data;
								return arr[i];
							});

						final.push(language_val);
					}
					console.log(final)
					return final;
				}
				const vali =  get_services(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess("Services found!",resy);

				});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	}
};
