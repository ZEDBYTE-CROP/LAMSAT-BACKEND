"use strict";
// DEVELOPED ON 14-07-2020

const jwt	= require("jsonwebtoken");
const passwordHash = require("password-hash");
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;

const fs = require("fs");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const Op = require("sequelize").Op;
const CodeTypes = require("../../../fixtures/error.codes");
const Config = require("../../../../config");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const mail_template = __dirname;
const vendortiming = require("../../../helpers/vendortiming");
const moment = require("moment");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Sequ = require("sequelize");
let googleAuth = require( "./googleAuth.js" );
let facebookAuth = require( "./facebookAuth.js" );
const { Console } = require("console");
const serveStatic = require("serve-static");
const db = require('../../../adapters/db');
// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Logins = {
	security: ["id", "password", "usertypeid","email"],
	admin_security: ["id", "password", "usertypeid"],
	admin_security1: ["id", "password", "usertypeid"],
	encode: ["id", "usertypeid"],
	admin_encode: ["id", "usertypeid"]
};
const Filters_Tokens = {
	empty: ["id","login_type"]
};

const JWT_SECRET = "TOP SECRET!!!";

const {
	DELETE,
	ACTIVE,
	INACTIVE,
	ADMIN_ROLE,
	USER_ROLE
} = Constants;
const Roles = [ADMIN_ROLE, USER_ROLE];

//Models
// Create Promisify encode & verify methods
const encode = Promise.promisify(jwt.sign);
const verify = Promise.promisify(jwt.verify);
const User = new Database("Muser");
const Language = new Database("Mlanguage");
//vendor tables and its fields
const vendor = new Database("Mvendor");
const vendorfilt = new Database("Mvendor", [
	"id",
	"vendorkey",
	"isfeatured",
	"firstname",
	"lastname",
	"username",
	"email",
	"latitude",
	"longitude",
	"countryid",
	"cityid",
	"areaid",
	"commissiontype",
	"contactnumber",
	"sortorder",
	"vat",
	"vendorstatus",
	"servicelocation",
	"paymentoption",
	"usertypeid",
	"socialtypeid",
	"socialkey",
	"devicetype",
	"devicetoken",
	"photopath",
	"status",
	"categoryid",
	"image_url",
	"service_available",
	"isstaffaccepted",
	"isprofileaccepted",
	"isserviceaccepted",
	"isaccepted"
]);
const Tokens = new Database("Mtoken");
const vendorlang = new Database("Mvendorlang");
const otpGenerator =  require("otp-generator");

const vendorhours =  new Database("Mvendorhours");
//const vendortime =  new Database("Mvendorhours");
const vendorcategory = new Database("Mvendorcategory");
const Stafftime =  new Database("Mvendorstaffhours");
const vendorcategoryfilt = new Database("Mvendorcategory", [
	"id",
	"vendorid",
	"categoryid",
	"status"
]);
const vendorimage = new Database("Mvendorimage");
const Categorylangfilt = new Database("Mcategorylang", [
	"id",
	"mcategorylangkey",
	"languageid",
	"langshortname",
	"categoryid",
	"categoryname"
]);


const Citylang = new Database("Mcitylang");
const CountryLang = new Database("Mcountrylang");
const Vendorvoucher = new Database("Mvendorvoucher");
const Voucher = new Database("Mvoucher");
const vendortime =  new Database("Mvendorhours");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE



module.exports = {

	// vendor CREATION
	login: async function(ctx) {
		ctx.meta.username = ctx.params.username;
		if(ctx.params.socialtypeid == 1 && ctx.params.socialkey != "") {

			return googleAuth.getUser( ctx.params.socialkey )
				.then( response => {

					let userDetails = {
						username: response.id,
						password: response.id,
						firstname: response.name,
						confirmpassword: response.id,
						socialtypeid: ctx.params.socialtypeid,
						email: response.email,
					};

					return ctx.call("vendor.verifyUsername", { username: response.id, userDetails: userDetails })
						.then( (userId) => {
							let user = {
								id: userId,
								username: response.id,
								usertypeid: 2,
								iat: 1596987716
							};

							return this.generateToken(user)
								.then( (res2) => {
									return Tokens.insert(ctx, {
										userId: userId,
										login_type: "vendor",
										token: res2
									})
										.then( () => {
											ctx.meta.username = userDetails.email;
											ctx.meta.log = "Successfully logged in with google";
											activity.setLog(ctx);
											let details = {
												name: "vendor Login Success",
												data: res2,
												code: 200
											};
											return details;
										});
								}).then( user => { return user; } );
						});
				}).catch( (err) => {
					ctx.meta.username = ctx.params.socialkey;
					ctx.meta.log = "Logged in with google failed";
					activity.setLog(ctx);
					if (err instanceof MoleculerError)
						return Promise.reject(err);
					else {
						this.logger.info(err);
						return this.requestError(CodeTypes.UNKOWN_ERROR);
					}
				});
		} else if(ctx.params.socialtypeid == 2 && ctx.params.socialkey != "") {
			return facebookAuth.getUser( ctx.params.socialkey )
				.then( response => {

					let user = {
						id: 6,
						username: response.id,
						usertypeid: 2,
						iat: 1596987716
					};
					return this.generateToken(user)
						.then( (res2) => {
							return Tokens.insert(ctx, {
								userId: 100,
								login_type: "vendor",
								token: res2
							})
								.then( () => {
									ctx.meta.username = user.username;
									ctx.meta.log = "Successfully logged in with facebook";
									activity.setLog(ctx);
									let details = {
										name: "vendor Login Success",
										data: res2,
										code: 200
									};
									return details;
								});
						}).then( user => { return user; } );
				}).catch( (err) => {
					ctx.meta.username = ctx.params.socialkey;
					ctx.meta.log = "Logged in failed with facebook";
					activity.setLog(ctx);
					if (err instanceof MoleculerError)
						return Promise.reject(err);
					else {
						this.logger.info(err);
						return this.requestError(CodeTypes.UNKOWN_ERROR);
					}
				});
		} else {
			return ctx.call("vendor.verifypassword", { username: ctx.params.username, password: ctx.params.password })
				.then( (res) => {
					console.log('-----er',res);
					return this.generateToken(res.data)
						.then( (res2) => {
							return Tokens.insert(ctx, {
								userId: res.data.id,
								login_type: "vendor",
								token: res2
							})
								.then( () => {
									let final_output = [];
									return  vendorfilt.findOne(ctx, { query: {
										id: res.data.id
									}
									})
										.then((res)=>{
											ctx.meta.username = ctx.params.username;
											ctx.meta.log = "Successfully logged in";
											activity.setLog(ctx);
											return vendorlang.find(ctx,{ filter:["languageid","languageshortname", "vendorid", "vendorname", "vendoraddress", "vendordescription"],query: {
												vendorid: res.data.id
											}
											}).then(async (resy) => {
												resy.data.map(async(item)=>{
													await Language.findOne(ctx,{filter:["languagename"],query:{
														id:item.languageid
													}})
														.then((resp)=>{
															item["languagename"] = resp.data.languagename;
														});
													res.data["language"] = resy.data;

												});
												return vendorimage.find(ctx, { filter:["id","image_url", "vendorimagepath"],query: {vendorid: res.data.id}})
													.then((images)=>{
														let image_arr = [];
														images.data.map((item) => {
															let image_obj = {};
															if(item.vendorimagepath) {
																const split_image = item.vendorimagepath.split("__uploads");
																const image = split_image[1];
																const slice_image = image.slice(1);
																//item['vendorimages'] = slice_image;
																image_obj["id"] = item.id;
																image_obj["image"] = slice_image;
																image_arr.push(image_obj);
															}
														});
														res.data["images"] = image_arr;
														final_output.push(res.data);
														return this.requestSuccess("Login Success", res2, final_output);
													});
											});
										});
								});
						});
				})
				.catch( (err) => {
					console.log('----',err)
					ctx.meta.username = ctx.params.email;
					ctx.meta.log = "Attempt logged in failed";
					activity.setLog(ctx);
					if (err instanceof MoleculerError) {
						ctx.meta.log = "Invalid Crendentials";
						activity.setLog(ctx);
						return Promise.reject(err);
					} else {
						ctx.meta.log = CodeTypes.USERS_NOTHING_FOUND;
						activity.setLog(ctx);
						return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
					}
				});
		}
	},

	verifypassword: function(ctx) {
	    let findUser = {};
		findUser["email"] =  ctx.params.username;
		findUser["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return vendor.findOne(ctx, {
			query: findUser,
			filter: Filters_Logins.security
		})
			.then( (res) => {
				if(res.data == undefined) {
					let findUser1 = {};
					findUser1["email"] =  ctx.params.username;
					findUser1["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
					return vendor.findOne(ctx, {
						query: findUser1,
						filter: Filters_Logins.security
					})
						.then( (res) => {
							if (passwordHash.verify(ctx.params.password, res.data.password))
							{
								console.log('pass valid')
								return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
							}
							else
							{
								return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
							}
						})
						.catch((err)=>{
							if (err instanceof MoleculerError)
								return Promise.reject(err);
							else if (err.name === "Nothing Found")
								return this.requestError(CodeTypes.NOTHING_FOUND);
							else if (err.name === "TypeError"){
								return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
							}
							else {
								return this.requestError(CodeTypes.UNKOWN_ERROR);
							}
						});
				}
				else {

					if (passwordHash.verify(ctx.params.password, res.data.password))
					{
						return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
					}
					else
					{
						return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
					}
				}
			})
			.catch( (err) => {
				if (err instanceof MoleculerError){
					return Promise.reject(err);
				}
				else if (err.name === "Nothing Found") {
					return this.requestError(CodeTypes.NOTHING_FOUND);
				}
				else if (err.name === "TypeError"){
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
				}
				else {
					return this.requestError(CodeTypes.UNKOWN_ERROR);
				}
			});
	},

	changepassword: function(ctx) {
		activity.getVendor(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return this.verifyIfLogged(ctx)
			.then( () => ctx.call("vendor.verify_changepassword", { id: ctx.params.id, password: ctx.params.oldpassword}))
			.then( () => this.generateHash(ctx.params.newpassword) )
			.then( (res) => {
				if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
					vendor.updateById(ctx, ctx.meta.user.id, {
						password: res.data
					});
					ctx.meta.log = "Password changed";
					activity.setLog(ctx);
				}
				else {
					ctx.meta.log = "Invalid old password";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
				}
			})
			//.then( () => ctx.call("vendor.close_allsessions"))
			.then( () => this.requestSuccess("Changes Saved", true) )
			.catch( (err) => {
				ctx.meta.log = "Attepmt to change password failed";
				activity.setLog(ctx);
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.UNKOWN_ERROR);
			});
	},

	changeforgetpassword: function(ctx) {
		return vendor.find(ctx, { query: {
			vendorkey: ctx.params.vendorkey
		}})
		.then((response) => {
			if(response.data)
			{
				return this.generateHash(ctx.params.password)
				.then((res) => {
					return vendor.updateBy(ctx, 1,
						{ password : res.data }, { query: {
							id: response.data[0].id
						}})

						.then((result) => {
							return this.requestSuccess("Password changed");
						});
				});
			}
			else
				return this.requestError(CodeTypes.NOTHING_FOUND);
		}).catch( (err) => {
			if (err instanceof MoleculerError)
				return Promise.reject(err);
			else
				return this.requestError(CodeTypes.NOTHING_FOUND);
		});
	},

	forgetpassword: function(ctx) {
		//Random password generation
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		return vendor.find(ctx, { query: {
			email: ctx.params.email
		}})
		.then((response) => {
			if(response.data)
			{
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = "User Password has been reseted";
				activity.setLog(ctx);
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
				const verificationLink = `https://lamsat.app/partner/resetpassword/${response.data[0].vendorkey}`
				// console.log('otp----',otp);
				// console.log('resetlink--',verificationLink);
				readHTMLFile(mail_template + "/Forgetpasswordtemplate.html", function(err, html) {

					let template = handlebars.compile(html);
					let replacements = {
						username: response.data[0].email,
						password: otp,
						emailverificationkey: verificationLink,
						Name: response.data[0].firstname
					};
					const htmlToSend = template(replacements);

					ctx.call("mail.send", {
						to: ctx.params.email,
						subject: "Forget Password Details",
						html: htmlToSend
					}).then((res) => {
						return "Email send Successfully";
					});
				});
				return "Password Resetted Please Check Email";
			}
			else
				return this.requestError(CodeTypes.ALREADY_EXIST);
		}).catch( (err) => {
			ctx.meta.username = ctx.params.email;
			ctx.meta.log = "User Password reset attempt failed";
			activity.setLog(ctx);
			if (err instanceof MoleculerError)
				return Promise.reject(err);
			else
				return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
		});
	},

	forgetpassword_old: function(ctx) {
		//Random password generation
		let random_password = otpGenerator.generate(6,{ upperCase: false, specialChars: false, alphabets: false});
		return vendor.find(ctx, { query: {
			email: ctx.params.email
		}})
			.then((response) => {
				if(response.data)
				{
					//generateHash gives encrypted password
					return this.generateHash(random_password)
						.then((res) => {
							return vendor.updateBy(ctx, 1,
								{ password : res.data }, { query: {
									id: response.data[0].id
								}})

								.then((result) => {
									ctx.meta.username = ctx.params.email;
									ctx.meta.log = "vendor Password has been reseted";
									activity.setLog(ctx);
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

									readHTMLFile(mail_template + "/Forgetpasswordtemplate.html", function(err, html) {

										let template = handlebars.compile(html);
										let replacements = {
											username: response.data[0].email,
											password: random_password
										};
										const htmlToSend = template(replacements);

										ctx.call("mail.send", {
											to: ctx.params.email,
											subject: "Forget Password Details",
											html: htmlToSend
										}).then((res) => {
											return "Email send Successfully";
										});
									});
									return "Password Resetted Please Check Email";
								});
						});
				}
				else
					return this.requestError(CodeTypes.ALREADY_EXIST);
			}).catch( (err) => {
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = "vendor Password reset attempt failed";
				activity.setLog(ctx);
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
			});
	},


	verify_changepassword: function(ctx) {
	    return vendor.findOne(ctx, {
			query: {
				id: ctx.params.id
			},
			filter: Filters_Logins.admin_security
		})
			.then( (res) => {
				if (passwordHash.verify(ctx.params.password, res.data.password))
					return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.admin_encode));
				else
					return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
			})
			.catch( (err) => {
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else {
					this.logger.info(err);
					return this.requestError(CodeTypes.UNKOWN_ERROR);
				}
			});
	},

	count_sessions: function(ctx) {

		return this.verifyIfLogged(ctx)
			.then( () => Tokens.count(ctx, {
				userId: ctx.meta.user.id
			}))
			.then( (res) => this.requestSuccess("Count Complete", res.data) )
			.catch( (err) => {
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.UNKOWN_ERROR);
			});
	},

	close_allsessions: function(ctx) {

		return this.verifyIfLogged(ctx)
			.then( () => Tokens.removeMany(ctx, {
				userId: ctx.meta.user.id
			}))
			.then( () => this.requestSuccess("All existing sessions closed", true) )
			.catch( (err) => {
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.UNKOWN_ERROR);
			});
	},

	logout: function(ctx) {

		return this.verifyIfLogged(ctx)
			.then( () => Tokens.removeMany(ctx, {
				token: ctx.meta.user.token
			}))
			.then( () => this.requestSuccess("Logout Success", true) )
			.catch( (err) => {
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.UNKOWN_ERROR);
			});
	},

	//To get vendor details
	get: function(ctx) {
		const array = [];
		let findvendor = {};
		findvendor["id"] = ctx.params.id;
		findvendor["status"] = 1;
		return vendorfilt.findOne(ctx, { query: findvendor })
			.then( (res) =>{
				//TO Get categories of vendor
				async function get_category(ctx, arr) {

					let total_array = [];
					for(var i = 0;i<arr.length;i++) {
						let jim =  arr[i].paymentoption;
						const spil = jim.split(",");
						arr[i].paymentoption = spil;
						//to get language data of the vendor
						let language_val_filter = await vendorlang.find(ctx, { filter:["id","languageid", "languageshortname","vendorname","vendoraddress","vendordescription"],query: {vendorid: arr[i].id}})
							.then((lan_res)=>{
								arr[i]["language"] = lan_res.data;
								return arr[i];
							});
						// to get vendor images
						let vendor_image = await vendorimage.find(ctx, { filter:["id","image_url", "vendorimagepath"],query: {vendorid: arr[i].id}})
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

	update: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
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
						firstname: ctx.params.firstname,
						lastname: ctx.params.lastname,
						email: ctx.params.email,
						username: ctx.params.username,
						latitude: ctx.params.latitude,
						longitude: ctx.params.longitude,
						areaid: ctx.params.areaid,
						cityid: ctx.params.cityid,
						countryid: ctx.params.countryid,
						servicelocation: ctx.params.servicelocation, //1=> both, 2==> Home, 3==> Salon
						service_available: ctx.params.service_available ? ctx.params.service_available : 1, //1=> Women, 2=> kids
						contactnumber: ctx.params.contactnumber,
						image_url: ctx.params.image_url,
						photopath: ctx.params.photopath,
						prefix: ctx.params.prefix
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
							// var temp_pay = "";
							// ctx.params.paymentoption.map((item)=>{
							//     if(!temp_pay) {
							//         temp_pay = item;
							//     }
							//     else {
							//         temp_pay = temp_pay + "," + item;
							//     }
							// });
							vendor.updateBy(ctx, 1, {
								categoryid: temp,
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
											vendorlang.updateBy(ctx, 1, {
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
							if(ctx.params.images.length != 0) {
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
							return  vendorlang.find(ctx, { filter:["id","languageid","languageshortname", "vendorname", "vendordescription", "vendoraddress" ],query: {
								vendorid: ctx.params.id,
							}
							})
								.then((resl)=>{
									res.data[0]["language"] = resl.data;
									return vendorimage.find(ctx, { filter:["id","image_url", "vendorimagepath"],query: {vendorid: ctx.params.id}})
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

	verifyUsername: function(ctx) {
		return  User.findOne(ctx, { query: {
			username: ctx.params.username
		}
		})
			.then((response) => {
				if(response.data != null) {
					return response.data.id;
				}

				this.logger.info(")))))))))))))))))))) 888888888888888");
				this.logger.info(ctx.params.userDetails);
				this.logger.info(")))))))))))))))))))) 888888888888888");

				return ctx.call("user.create", ctx.params.userDetails)
					.then( (resLocal) => {

						return ctx.call("user.verifyUsername", { username: ctx.params.userDetails.username })
							.then( (resLocal2) => {
								this.logger.info(")))))))))))))))))))) 333333333333");
								this.logger.info(resLocal2);
								this.logger.info(")))))))))))))))))))) 333333333333");

								return resLocal2.data.id;
							});

					}).catch( (err) => {
						if (err instanceof MoleculerError)
							return Promise.reject(err);
						else {
							this.logger.info("************** ERROR");
							this.logger.info(err);
							this.logger.info("************** ERROR");
							return this.requestError(err);
						}
					});
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else {
					this.logger.info(err);
					return this.requestError(err);
				}
			});

	},

	remove: function(ctx) {
		return  vendor.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				vendor.updateBy(ctx, res.data.id, {
					status: 2
				}, { query: {
					id: ctx.params.id
				}
				});

				let update = {};
				update["status"] = 2;
				let des = {};
				des["vendorid"] = ctx.params.id;
				vendorlang.updateMany(ctx,des,update);
				ctx.meta.log = `vendor id ${ctx.params.id} was removed.`;
				activity.setLog(ctx);
				return this.requestSuccess("vendor deleted", ctx.params.id);


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
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		return  vendortime.updateBy(ctx, 1, {
			starttime: ctx.params.starttime,
			endtime: ctx.params.endtime,
			vendorstatus: ctx.params.vendorstatus
		}, { query: {
			id: ctx.params.id
		}
		})
			.then((res)=>{
				ctx.meta.log = "Vendor Time updated successfully";
				activity.setLog(ctx);
				return this.requestSuccess("vendor timings Updated");
			});

	},

	timeget: async function(ctx) {
		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		findvendor["status"] = 1;
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
		findvendor["status"] = 1;
		return vendorimage.find(ctx, { filter:["id","image_url","vendorimagepath"],query: findvendor })
			.then( (res) =>{
				return this.requestSuccess("List of Images", res.data);
			});
	},

	imageremove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
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
				ctx.meta.log = "Vendor Gallery images removed successfully";
				activity.setLog(ctx);
				return this.requestSuccess("Image Deleted Successfully");
			});
	},


	vendorTimeget: async function(ctx) {


		let findHour = {};
		findHour["vendorid"] = ctx.params.vendorid;

		return vendorhours.find(ctx,{ query: findHour })
			.then((res)=>{
				let i;
				if (res.data.length === 0){
					try {

						vendorhours.insert(ctx, {
							vendorid: ctx.params.vendorid,
							status: 1,
							days: "Sunday",
							starttime: "10:00",
							endtime: "22:00",
							status: 1,
							staffstatus: 1
						}).then(function(user) {
							console.log("===>" ,user);
						}).then(function(userData) {
							console.log("===>" ,userData);
							// userData is undefined
						});


						/*vendorhours.insert(ctx, {
                        vendorid: ctx.params.vendorid,
                        status: 1,
                        days: 'Sunday',
                        starttime: '10:00',
                        endtime: '22:00',
                        status: 1,
                        staffstatus: 1
                    }).then( (re) => {
                                console.log('re ' , re);
                    })*/
					} catch (error) {
						console("error mee" , error);
					}

					console.log("------------------------------------");
					console.log("000000000");
					console.log("------------------------------------");
				}
			});
	},



	vendortimeGetall: async function(ctx) {

		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		findvendor["status"] = ctx.params.status ? ctx.params.status : {[Op.ne] : DELETE};
		//const QUERY = `select * from mvendorhours WHERE vendorid = ${ctx.params.vendorid} and status =${ctx.params.status ? ctx.params.status : 1}
		const QUERY = `select * from mvendorhours WHERE vendorid = ${ctx.params.vendorid}
			order by
			 CASE
				  WHEN days = 'Monday' THEN 1
				  WHEN days = 'Tuesday' THEN 2
				  WHEN days = 'Wednesday' THEN 3
				  WHEN days = 'Thursday' THEN 4
				  WHEN days = 'Friday' THEN 5
				  WHEN days = 'Saturday' THEN 6
				  WHEN days = 'Sunday' THEN 7
				 END ASC `;
				 		//return vendortime.find(ctx,{ query: findvendor })
			return db.sequelize.query(QUERY)
			.then((res)=>{
				res[0].map((date) => {
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

				return this.requestSuccess("Time Details",res[0]);
			})
			.catch((err)=>{
				return this.requestError(err);
			});
	},

	timeupdates: async function(ctx) {
		console.log("------------------------------------");
		console.log("ctx.params." , ctx.params);
		console.log("------------------------------------");
		/*   let findvendor = {};
      findvendor['vendorid'] = ctx.params.vendorid;
      findvendor['status'] = ctx.params.status ? ctx.params.status : {[Op.ne] : DELETE};
      return vendortime.find(ctx,{ query: findvendor })
      .then((res)=>{
          res.data.map((date) => {
              let strDate = date.starttime;
              let sarr = strDate.split(':');
              let shour = parseInt(sarr[0]);
              let smin = parseInt(sarr[1]);
              let d1 = moment({ year :2010, month :3, day :5,
                  hour :shour, minute :smin, second :3, millisecond :123});
              let endDate = date.endtime;
              let earr = endDate.split(':');
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
      }) */
		return  vendortime.updateBy(ctx, 1, {
			//ctx.params.field=='start'?starttime: ctx.params.timevalue:endtime: ctx.params.timevalue,
			endtime: ctx.params.endtime,
			starttime: ctx.params.starttime,
			status: ctx.params.status
		}, { query: {
			id: ctx.params.timeslotid
		}
		})
			.then((res)=>{
				return this.requestSuccess("vendor timings Updated");
			});

	},
};
