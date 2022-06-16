"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
//Defines error code types
const Config = require("../../../../config");
const url = Config.get("/url");
const folderpath = Config.get("/folderpath");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const vendortiming = require("../../../helpers/vendortiming");
const handlebars = require("handlebars");
const otpGenerator =  require("otp-generator");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Op = require("sequelize").Op;
const serveStatic = require("serve-static");
const mail_template = __dirname;
const Sequ = require("sequelize");
//Models
const User = new Database("Muser");
//vendor tables and its fields
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const vendorlangfilt = new Database("Mvendorlang");
const vendorcategory = new Database("Mvendorcategory");
const vendorcategoryfilt = new Database("Mvendorcategory", [
	"id",
	"vendorid",
	"categoryid",
	"status"
]);
const vendorimage = new Database("Mvendorimage");
const vendorimagefilt = new Database("Mvendorimage", [
	"id",
	"vendorimagekey",
	"vendorid",
	"image_url",
	"vendorimagepath",
	"status"
]);
const Categorylangfilt = new Database("Mcategorylang", [
	"id",
	"mcategorylangkey",
	"languageid",
	"langshortname",
	"categoryid",
	"categoryname"
]);

const Favvendor = new Database("Mfavourite");
const Favvendorfilt = new Database("Mfavourite",[
	"id",
	"favouritekey",
	"vendorid",
	"userid",
	"status"
]);

const Reviewfilt = new Database("Treview", [
	"id",
	"reviewkey",
	"userid",
	"name",
	"vendorid",
	"rating",
	"review",
	"created_at"
]);
const vendortime =  new Database("Mvendorhours");
const Staff = new Database("Mvendorstaff");
const db = require("../../../adapters/db");

//database connection for storeprocedure

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation adminvendor
 * @permission create,update,remove,status,imageremove,timeupdate
 * @whitelist  getall,get,timeget,images,create
*/
module.exports = {

	// vendor CREATION
	create: async function(ctx) {
		let langid = [];
		let langname = [];
		ctx.params.language.map((item)=>{
			langid.push(item.id);
			langname.push(item.vendorname);
		});
		let wherecond = {
			languageid: langid,
			vendorname: langname,
			status: 1,
		};
		return vendorlang.find(ctx, { query: wherecond })
			.then((res)=>{
				if (res.data.length === 0) {
					//Check email already exists
					let findvendor = {};
					findvendor["username"] = ctx.params.username;
					findvendor["status"] = { [Op.ne]: DELETE } ;
					return vendor.find(ctx, { query: findvendor })
						.then((res)=> {
							if (res.name === "Nothing Found")
							{
								let findvendor1 = {};
								findvendor1["email"] = ctx.params.email;
								findvendor1["status"] = { [Op.ne]: DELETE } ;
								return vendor.find(ctx, { query: findvendor1 })
									.then((res)=> {
										if (res.name === "Nothing Found")
										{
											let langid = [];
											let langname = [];
											ctx.params.language.map((item)=>{
												langid.push(item.languageid);
												langname.push(item.vendorname);
											});
											let wherecond = {
												languageid: langid,
												vendorname: langname,
												status: 1
											};
											return vendorlang.find(ctx, { query: wherecond })
												.then((res)=>{
													if (res.name === "Nothing Found")
													{
														//Comparing password and confirmpassword
														if (ctx.params.password.localeCompare(ctx.params.confirmpassword) == 0) {
															//Generating Hashed password
															return  this.generateHash(ctx.params.password)
																.then( (res) => vendor.insert(ctx, {
																	vendornumber: ctx.params.vendornumber,
																	isfeatured: ctx.params.isfeatured ? ctx.params.isfeatured : 0,
																	firstname: ctx.params.firstname,
																	lastname: ctx.params.lastname,
																	username: ctx.params.username ? ctx.params.username : ctx.params.firstname,
																	email: ctx.params.email,
																	password: res.data,
																	latitude: ctx.params.latitude,
																	longitude: ctx.params.longitude,
																	areaid: ctx.params.areaid,
																	cityid: ctx.params.cityid,
																	countryid: ctx.params.countryid,
																	commissiontype: ctx.params.commissiontype, ///value and percent
																	vatpercent: ctx.params.vatpercent,// authorized VAT YES=1,NO=2
																	vat: ctx.params.vat,
																	servicelocation: ctx.params.servicelocation, //1=> both, 2==> Home, 3==> Salon
																	service_available: ctx.params.service_available ? ctx.params.service_available : 1, //1=> Women, 2=> kids
																	contactnumber: ctx.params.contactnumber,
																	image_url: ctx.params.image_url,
																	photopath: ctx.params.photopath,
																	prefix: ctx.params.prefix,
																	saloonphone: ctx.params.saloonphone,
																	saloonemail: ctx.params.saloonemail,
																	crdocument_url: ctx.params.crdocument_url ? ctx.params.crdocument_url : null,
																	vatdocument_url: ctx.params.vatdocument_url ? ctx.params.vatdocument_url : null,
																	vatnumber: ctx.params.vatnumber ? ctx.params.vatnumber : null,
																	hearAboutFresha: ctx.params.hearAboutFresha ? ctx.params.hearAboutFresha : null,
																	partnerAddress: ctx.params.partnerAddress ? ctx.params.partnerAddress : null,
																	partnerDistrict: ctx.params.partnerDistrict ? ctx.params.partnerDistrict : null,
																	partnerPostcode: ctx.params.partnerPostcode ? ctx.params.partnerPostcode : null,
																	partnerRegion: ctx.params.partnerRegion ? ctx.params.partnerRegion : null,
																	teamsize: ctx.params.teamsize ? ctx.params.teamsize : null,
																	bankdocument_url: ctx.params.bankdocument_url,
																	bankaccountnumber: ctx.params.bankaccountnumber,
																	bankaccountname: ctx.params.bankaccountname,
																	bankname: ctx.params.bankname,
																	bankiban: ctx.params.bankiban,
																	bankidbic: ctx.params.bankidbic,
																	status: ctx.params.status !== null ? ctx.params.status : 1,
																	isaccepted: 1
																}))
																.then((response)=>{
																	//Inserting vendor in multiple language
																	ctx.params.language.map((lan_item)=>{
																		vendorlang.insert(ctx, {
																			vendorid: response.data.id,
																			languageid: lan_item.id,
																			languageshortname: lan_item.languageshortname,
																			vendorname: lan_item.vendorname,
																			vendordescription: lan_item.vendordescription,
																			vendoraddress: lan_item.vendoraddress
																		});
																	});
																	let temp =  "";
																	if(ctx.params.category && ctx.params.category.length) {
																		ctx.params.category.map((val)=>{
																			if(!temp) {
																				temp =  val;
																			}
																			else {
																				temp = temp + "," + val;
																			}
																		});
																	}

																	let temp_pay = "";
																	if(ctx.params.paymentoption && ctx.params.paymentoption.length) {
																		ctx.params.paymentoption.map((item)=>{
																			if(!temp_pay) {
																				temp_pay = item;
																			}
																			else {
																				temp_pay = temp_pay + "," + item;
																			}
																		});
																	}
																	let temp_gender = "";
																	if(ctx.params.gender) {
																		ctx.params.gender.map((item)=>{
																			if(!temp_gender) {
																				temp_gender = item;
																			}
																			else {
																				temp_gender = temp_gender + "," + item;
																			}
																		});
																	}
																	if(ctx.params.category && ctx.params.category.length) {
																		ctx.params.category.map((val)=>{
																			vendorcategory.insert(ctx, {
																				vendorid: response.data.id,
																				categoryid: val,
																				status: 1,
																			});
																		})
																	}
																	vendor.updateBy(ctx, 1, {
																		categoryid: temp,
																		paymentoption: temp_pay,
																		gender: temp_gender,
																	}, { query: {
																		id:response.data.id
																	}
																	});
																	vendortiming.timing(ctx).map((days)=>{
																		days["vendorid"] = response.data.id;
																		vendortime.insert(ctx, days);
																	});
																	Staff.insert(ctx, {
																		vendorid: response.data.id,
																		email: "nopreference@lamsta.com",
																		serviceid: "0",
																		employee_startdate: "Jan  1 2020  6:26AM",
																		contactnumber: "012345678",
																		firstname: "No",
																		lastname: "Preference",
																		staff_title:"No Preference",
																		notes: "No Preference",
																		isnopref: 1,

																	});

																	if(ctx.params.images) {
																		ctx.params.images.map((img)=>{
																			vendorimage.insert(ctx,{
																				vendorid: response.data.id,
																				image_url: img.image_url,
																				vendorimagepath: img.imagepath,
																			});
																		});
																	}
																	ctx.meta.username = ctx.params.email;
																	ctx.meta.log = "New vendor created.";
																	activity.setLog(ctx);
																	// Sending username and password to customers mail
																	let readHTMLFile = function(path, callback) {
																		fs.readFile(path, {encoding: "utf-8"}, function (err, html) {
																			if (err) {
																				throw err;
																			}
																			else {
																				callback(null, html);
																			}
																		});
																	};
																	//Reads the html template,body of the mail content
																	readHTMLFile(mail_template + "/Vendortemplate.html", function(err, html) {
																		let template = handlebars.compile(html);
																		let replacements = {
																			Name: ctx.params.language[0].vendorname,
																			username: ctx.params.username,
																			password: ctx.params.password,
																			message12: "Vendor Successfully created"
																		};
																		const htmlToSend = template(replacements);
																		// this method call the mail service to send mail
																		ctx.call("mail.send", {
																			to: ctx.params.email,
																			subject: "Vendor Login Details",
																			html: htmlToSend
																		}).then((res) => {
																			return "Email send Successfully";
																		});
																	});
																	return this.requestSuccess("Vendor Created", response.data.email);
																})
																.catch( (err) => {
																	console.log('-------err',err);
																	ctx.meta.username = ctx.params.email;
																	ctx.meta.log = "Create vendor failed.";
																	activity.setLog(ctx);
																	if (err.name === "Database Error" && Array.isArray(err.data)){
																		if (err.data[0].type === "unique" && err.data[0].field === "username")
																			return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
																	}
																	else if (err instanceof MoleculerError)
																		return Promise.reject(err);
																	else
																		return err;
																});
														}
														else {
															ctx.meta.username = ctx.params.email;
															ctx.meta.log = "Create vendor failed with password mismatch.";
															activity.setLog(ctx);
															return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
														}
													}
													else {
														return this.requestError(`Vendor Name ${ res.data[0].vendorname } ${CodeTypes.ALREADY_EXIST}`);
													}
												});
										}
										else {
											ctx.meta.username = ctx.params.email;
											ctx.meta.log = "Create vendor failed with same Email";
											activity.setLog(ctx);
											return this.requestError(CodeTypes.EMAIL_ALREADY_EXIST);
										}
									});
							}
							else {
								ctx.meta.username = ctx.params.username;
								ctx.meta.log = "Create vendor failed with same username";
								activity.setLog(ctx);
								return this.requestError(CodeTypes.USERS_ALREADY_EXIST);
							}
						});
				}
				else {
					return this.requestError(`Vendor Name ${ res.data[0].vendorname} ${CodeTypes.ALREADY_EXIST}`);
				}
			});
	},

	//vendor Listing for Website
	getall: async function(ctx) {
		const languageid = 1;
		let vendor_list = await db.sequelize.query("EXEC SP_GetAllVendorsAdmin :languageid",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid },type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Vendors found!", vendor_list && vendor_list.length > 0 ? JSON.parse(vendor_list[0].details) : "");
	},

	//vendor Listing for salon page
	getallsalon: async function(ctx) {
		const languageid = 1;
		let vendor_list = await db.sequelize.query("EXEC SP_GetAllVendorsAdminSalon :languageid",{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid },type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Vendors found!", vendor_list && vendor_list.length > 0 ? JSON.parse(vendor_list[0].details) : "");
	},


	status: function(ctx) {
		return  vendor.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) => vendor.updateBy(ctx, res.data.id, {
				status: ctx.params.status
			}, { query: {
				id: ctx.params.id
			}
			}))
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(err);

			});
	},

	//To get vendor details
	get: function(ctx) {
		let findvendor = {};
		findvendor["id"] = ctx.params.id;
		findvendor["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return vendor.findOne(ctx, { query: findvendor })
			.then( (res) =>{
				//TO Get categories of vendor
				async function get_category(ctx, arr) {
					let total_array = [];
					for(var i = 0;i<arr.length;i++) {
						let payDet =  arr[i].paymentoption;
						var payDetArr = [];
						// const spil = jim.split(",");
						if(payDet !== null) {
							let b = payDet.split(",").map(function(item) {
								//return parseInt(item);
								payDetArr.push(parseInt(item));

							});
						}
						arr[i].paymentoption = payDetArr;
						//to get language data of the vendor
						let language_val_filter = await vendorlangfilt.find(ctx, { filter:["id","languageid", "languageshortname","vendorname","vendoraddress","vendordescription"],query: {vendorid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});
						// to get vendor images
						let vendor_image = await vendorimagefilt.find(ctx, { filter:["id","image_url", "vendorimagepath"],query: {vendorid: arr[i].id}})
							.then((images)=>{
								let image_arr = [];
								images.data.map((item) => {
									image_arr.push(item);
								});
								arr[i]["images"] = image_arr;
								return arr[i];
							});
						total_array.push(language_val_filter);
					}
					return total_array;
				}
				let array = [];
				array.push(res.data);
				const vali =  get_category(ctx,array);
				return vali.then((resy)=>{
					return this.requestSuccess("Vendor Detail", resy);
				});
			} )
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	update: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
		let langid = [];
		let langname = [];
		ctx.params.language.map((item)=>{
			langid.push(item.id);
			langname.push(item.vendorname);
		});
		let wherecond = {
			languageid: langid,
			vendorname: langname,
			status: 1,
			vendorid: { [Op.ne]: ctx.params.id }
		};
		return vendorlang.find(ctx, { query: wherecond })
			.then ((res) => {
				if (res.data.length === 0)
				{
					return vendor.updateBy(ctx, 1, {
						isfeatured: ctx.params.isfeatured,
						firstname: ctx.params.firstname,
						lastname: ctx.params.lastname,
						email: ctx.params.email,
						username: ctx.params.username,
						latitude: ctx.params.latitude,
						longitude: ctx.params.longitude,
						areaid: ctx.params.areaid,
						cityid: ctx.params.cityid,
						countryid: ctx.params.countryid,
						commissiontype: ctx.params.commissiontype, ///value and percent
						vat: ctx.params.vat,
						servicelocation: ctx.params.servicelocation, //1=> both, 2==> Home, 3==> Salon
						service_available: ctx.params.service_available ? ctx.params.service_available : 1, //1=> Women, 2=> kids
						vatpercent: ctx.params.vatpercent,// authorized VAT YES=1,NO=2
						contactnumber: ctx.params.contactnumber,
						image_url: ctx.params.image_url,
						photopath: ctx.params.photopath,
						prefix: ctx.params.prefix,
						saloonphone: ctx.params.saloonphone,
						saloonemail: ctx.params.saloonemail,
						crdocument_url: ctx.params.crdocument_url ? ctx.params.crdocument_url : null,
						vatdocument_url: ctx.params.vatdocument_url ? ctx.params.vatdocument_url : null,
						vatnumber: ctx.params.vatnumber ? ctx.params.vatnumber : null,
						hearAboutFresha: ctx.params.hearAboutFresha ? ctx.params.hearAboutFresha : null,
						partnerAddress: ctx.params.partnerAddress ? ctx.params.partnerAddress : null,
						partnerDistrict: ctx.params.partnerDistrict ? ctx.params.partnerDistrict : null,
						partnerPostcode: ctx.params.partnerPostcode ? ctx.params.partnerPostcode : null,
						partnerRegion: ctx.params.partnerRegion ? ctx.params.partnerRegion : null,
						teamsize: ctx.params.teamsize ? ctx.params.teamsize : null,
						bankdocument_url: ctx.params.bankdocument_url,
						bankaccountnumber: ctx.params.bankaccountnumber,
						bankaccountname: ctx.params.bankaccountname,
						bankname: ctx.params.bankname,
						bankiban: ctx.params.bankiban,
						bankidbic: ctx.params.bankidbic,
						isprofileaccepted: 1,
						status: ctx.params.status !== null ? ctx.params.status : 1
					}, { query: {
						id: ctx.params.id
					}
					})
						.then((res)=>{
							let temp =  "";
							ctx.params.category.map((val)=>{
								if(!temp) {
									temp =  val;
								}
								else {
									temp = temp + "," + val;
								}
							});
							let temp_pay = "";
							ctx.params.paymentoption.map((item)=>{
								if(!temp_pay) {
									temp_pay = item;
								}
								else {
									temp_pay = temp_pay + "," + item;
								}
							});
							let temp_gender = "";
							// ctx.params.gender.map((item)=>{
							// 	if(!temp_gender) {
							// 		temp_gender = item;
							// 	}
							// 	else {
							// 		temp_gender = temp_gender + "," + item;
							// 	}
							// });
							ctx.params.category.map((val)=>{
								vendorcategory.find(ctx, { query: {vendorid: ctx.params.id,categoryid: val} })
								.then((result)=>{
									if(result.data.length === 0)
									{
										vendorcategory.insert(ctx, {
											vendorid: ctx.params.id,
											categoryid: val,
											status: 1,
										});
									}
								});
							})
							vendor.updateBy(ctx, 1, {
								categoryid: temp,
								paymentoption: temp_pay,
								gender: ctx.params.gender,
							}, { query: {
								id:ctx.params.id
							}
							});
							//It updates depends on language You are sending in header
							ctx.params.language.map((lan_item)=>{
								vendorlang.find(ctx, { query: {vendorid: ctx.params.id,languageid: lan_item.id} })
									.then((result)=>{
										if(result.data.length === 0)
										{
											vendorlang.insert(ctx, {
												vendorid: ctx.params.id,
												languageid: lan_item.id,
												languageshortname: lan_item.languageshortname,
												vendorname: lan_item.vendorname,
												vendordescription: lan_item.vendordescription,
												vendoraddress: lan_item.vendoraddress
											});
										}
										else {
											vendorlangfilt.updateBy(ctx, 1, {
												languageid: lan_item.id,
												vendorid: ctx.params.id,
												languageshortname: lan_item.languageshortname,
												vendorname: lan_item.vendorname,
												vendordescription: lan_item.vendordescription,
												vendoraddress: lan_item.vendoraddress
											}, { query: {
												vendorid: ctx.params.id,
												languageid:lan_item.id
											}
											});
										}
									});
							});

							ctx.meta.log = "vendor user details updated.";
							activity.setLog(ctx);
							//To fix the image path
							if(ctx.params.images && ctx.params.images.length != 0) {
								ctx.params.images.map((img)=>{
									//gallery image insert
									vendorimage.insert(ctx,{
										vendorid: ctx.params.id,
										vendorimagepath: img.imagepath,
										image_url: img.image_url
									});
								});
							}
							// return response with vendor details and gallery images
							return vendorlangfilt.find(ctx, { filter:["id","languageid","languageshortname", "vendorname", "vendordescription", "vendoraddress" ],query: {
								vendorid: ctx.params.id,
							}
							})
								.then((resl)=>{
									res.data[0]["language"] = resl.data;
									return vendorimagefilt.find(ctx, { filter:["id","image_url", "vendorimagepath"],query: {vendorid: ctx.params.id}})
										.then((images)=>{
											res.data[0]["images"] = images.data;
											return this.requestSuccess("vendor updated", res.data);
										});
								});
						})
						.catch( (err) => {
							ctx.meta.log = "vendor user details update failed.";
							activity.setLog(ctx);
							if (err.name === "Database Error" && Array.isArray(err.data)){
								if (err.data[0].type === "unique" && err.data[0].field === "username")
									return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
							}
							else if (err instanceof MoleculerError)
								return Promise.reject(err);
							else
								return err;
						});
				}
				else {
					return this.requestError(`Vendor Name ${ res.data[0].vendorname } ${CodeTypes.ALREADY_EXIST}`);
				}
			});
	},

	remove: function(ctx) {
		return  vendor.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				return vendor.updateBy(ctx, res.data.id, {
					status: 2
				}, { query: {
					id: ctx.params.id
				}
				})
					.then((resp)=>{
						let update = {};
						update["status"] = 2;
						let des = {};
						des["vendorid"] = ctx.params.id;
						return vendorlang.updateMany(ctx,des,update)
							.then((result)=>{
								ctx.meta.log = `vendor id ${ctx.params.id} was removed.`;
								activity.setLog(ctx);
								return this.requestSuccess("vendor deleted", ctx.params.id);
							});
					});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(err);

			});

	},

	//************************************vendor Operational hours Creations ******************************** */
	timeupdate: async function(ctx) {
		return  vendortime.updateBy(ctx, 1, {
			starttime: ctx.params.starttime,
			endtime: ctx.params.endtime,
			status: ctx.params.vendorstatus
		}, { query: {
			id: ctx.params.id
		}
		})
			.then((res)=>{
				return this.requestSuccess("vendor timings Updated");
			});

	},

	timeget: async function(ctx) {
		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		findvendor["status"] = ctx.params.status ? ctx.params.status : {[Op.ne] : DELETE};
		return vendortime.find(ctx,{ query: findvendor })
			.then((res)=>{
				res.data.map((date) => {
					let strDate = date.starttime;
					let sarr = strDate.split(":");
					let shour = parseInt(sarr[0]);
					let smin = parseInt(sarr[1]);
					let d1 = moment({ year :2010, month :3, day :5,
						hour :shour, minute :smin, second :3, millisecond :123});
					let endDate = date.endtime;
					let earr = endDate.split(":");
					let ehour = parseInt(earr[0]);
					let emin = parseInt(earr[1]);
					let d2 = moment({ year :2010, month :3, day :5,
						hour :ehour, minute :emin, second :3, millisecond :123});
					date.starttime = d1;
					date.endtime = d2;
				});

				return this.requestSuccess("Time Details",res.data);
			})
			.catch((err)=>{
				return this.requestError(err);
			});
	},

	images: async function(ctx) {
		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		findvendor["status"] = ctx.params.status ? ctx.params.status : {[Op.ne] : DELETE};
		return vendorimage.find(ctx, { filter:["id","image_url","vendorimagepath"],query: findvendor })
			.then( (res) =>{
				return this.requestSuccess("List of Images", res.data);
			});
	},

	imageremove: function(ctx) {
		return vendorimage.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then((res)=>{
				fs.unlink(res.data.vendorimagepath, (err)=>{
					if(err){
						throw err;
					}
					else {
						vendorimage.removeById(ctx,res.data.id);
					}
				});
				return this.requestSuccess("Image Deleted Successfully");
			});
	},


	adminvendortimeGetall: async function(ctx) {

		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		findvendor["status"] = ctx.params.status ? ctx.params.status : {[Op.ne] : DELETE};
		return vendortime.find(ctx,{ query: findvendor })
			.then((res)=>{
				res.data.map((date) => {
					let strDate = date.starttime;
					let sarr = strDate.split(":");
					let shour = parseInt(sarr[0]);
					let smin = parseInt(sarr[1]);
					let d1 = moment({ year :2010, month :3, day :5,
						hour :shour, minute :smin, second :3, millisecond :123}).format("HH:mm");
					let endDate = date.endtime;
					let earr = endDate.split(":");
					let ehour = parseInt(earr[0]);
					let emin = parseInt(earr[1]);
					let d2 = moment({ year :2010, month :3, day :5,
						hour :ehour, minute :emin, second :3, millisecond :123}).format("HH:mm");
					date.starttime = d1;
					date.endtime = d2;
				});

				return this.requestSuccess("Time Details",res.data);
			})
			.catch((err)=>{
				return this.requestError(err);
			});
	},
};
