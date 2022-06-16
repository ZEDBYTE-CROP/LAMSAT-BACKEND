"use strict";
// DEVELOPED ON 14-07-2020

const jwt	= require("jsonwebtoken");
const passwordHash = require("password-hash");
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;
const { log } = require("util");
const fs = require("fs");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const Op = require("sequelize").Op;
const CodeTypes = require("../../../fixtures/error.codes");
const Config = require("../../../../config");
const SMS = Config.get('/sms');
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const db = require("../../../adapters/db");
const mail_template = __dirname;
const moment = require("moment");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Sequ = require("sequelize");
let googleAuth = require( "./googleAuth.js" );
let facebookAuth = require( "./facebookAuth.js" );
const { Console } = require("console");
const haversine =  require("haversine");
const otpGenerator =  require("otp-generator");
const request = require("request");
const { v4: uuidv4 } = require("uuid");
const url = Config.get('/url');

// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Logins = {
	security: ["id", "password", "usertypeid","email","isverified", "isverifiedemail"],
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
let dateTime = require("node-datetime");

//Models
const Voucher = new Database("Mvoucher");
const Uservoucher = new Database("Muservoucher");
// Create Promisify encode & verify methods
const encode = Promise.promisify(jwt.sign);
const verify = Promise.promisify(jwt.verify);
const User = new Database("Muser");
const User_filter = new Database("Muser",[
	"id",
	"userkey",
	"firstname",
	"lastname",
	"email",
	"contactnumber",
	"countryid",
	"cityid",
	"isverified",
	"usertypeid",
	"panel",
	"socialtypeid",
	"socialkey",
	"image_url",
	"photopath",
	"devicetype",
	"devicetoken",
	"status",
	"isverifiedemail"
]);
const Categorylang = new Database("Mcategorylang");
const Favvendor = new Database("Mfavourite");
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
	"service_available"
]);
const vendorlang = new Database("Mvendorlang");
const vendorcategory = new Database("Mvendorcategory");
const vendorimage = new Database("Mvendorimage");
const Tokens = new Database("Mtoken");
const Citylang = new Database("Mcitylang");
const CountryLang = new Database("Mcountrylang");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE



module.exports = {

	// User Login
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

					return ctx.call("user.verifyUsername", { username: response.id, userDetails: userDetails })
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
			return ctx.call("user.verifypassword", { email: ctx.params.email, password: ctx.params.password })
				.then( (res) => {
					return this.generateToken(res.data)
						.then( (res2) => {
							return Tokens.insert(ctx, {
								userId: res.data.id,
								login_type: "user",
								token: res2
							})
								.then( () => {
									let final_output = [];
									return  User_filter.findOne(ctx, { query: {
										id: res.data.id
									}
									})
										.then((res)=>{
											ctx.meta.username = ctx.params.username;
											ctx.meta.log = "Successfully logged in";
											activity.setLog(ctx);
											final_output.push(res.data);
											return this.requestSuccess("Login Success", res2, final_output);
										});
								});
						});
				})
				.catch( (err) => {
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

	// User registration
	create: async function(ctx) {
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		let emailverificationkey = uuidv4();
		//Check email already exists
		return User.findOne(ctx, { query: {
			contactnumber: ctx.params.contactnumber,
			status: { [Op.ne]: DELETE },
			isverified: 1
		}})
			.then((res)=> {
				if (typeof res !== undefined && res.name === "Nothing Found")
				{
					return User.findOne(ctx, { query: {
						email: ctx.params.email,
						status: { [Op.ne]: DELETE },
						isverifiedemail: 1
					}
					}).then((res)=> {

						console.log("-----" + JSON.stringify(res));
						return res;
					});
				} else {

					console.log("Contact number already exists.");

					ctx.meta.username = ctx.params.email;
					ctx.meta.log = "Contact number already exists.";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
				}
			})
			.then((res)=> {
				if (typeof res !== undefined && res.name === "Nothing Found")
				{
					return User.findOne(ctx, { query: {
						email: ctx.params.email,
						contactnumber: ctx.params.contactnumber,
						status: { [Op.ne]: DELETE },
						isverified: 0
					}
					}).then((res)=> {

						console.log("+++++++++++++++++++++++" + JSON.stringify(res));
						return res;
					});
				} else {
					ctx.meta.username = ctx.params.email;
					ctx.meta.log = "Contact number or email id already exists.";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
				}
			})
			.then((res)=> {
				const pass = ctx.params.password.toString().trim();
				const confpass = ctx.params.confirmpassword.toString().trim();
				//Comparing password and confirmpassword
				if (pass.localeCompare(confpass) == 0) {
					if (res === undefined || typeof res === undefined || res.name === "Nothing Found")
					{    //Generating Hashed password
						return this.generateHash(pass)
							.then( (res) => { return User.insert(ctx, {
								firstname: ctx.params.firstname,
								lastname: ctx.params.lastname,
								email: ctx.params.email,
								password: res.data,
								cityid: ctx.params.cityid,
								countryid: ctx.params.countryid,
								usercountryname: ctx.params.usercountryname,
								countrycode: ctx.params.countrycode,
								contactnumber: ctx.params.contactnumber,
								photopath: ctx.params.photopath,
								socialtypeid: ctx.params.socialtypeid,
								socialkey: ctx.params.socialkey,
								devicetype: ctx.params.devicetype,
								devicetoken: ctx.params.devicetoken,
								otp: otp,
								isverified:0,
								isverifiedemail:0,
								emailverificationkey: emailverificationkey,
								usertypeid: 3,
								panel: "User",
								image_url: ctx.params.image_url
							});
							}
							);
					}
					else {

						return User.findOne(ctx, { query: {
							/*[Op.or]: [
                            { email: ctx.params.email, },
                            { contactnumber: ctx.params.contactnumber }
                            ],
                            */
							contactnumber: ctx.params.contactnumber,
							email: ctx.params.email,
							status: { [Op.ne]: DELETE },
							isverified: 0
						}
						});
					}
				}
				else {
					ctx.meta.username = ctx.params.email;
					ctx.meta.log = "Password not matching. Please enter valid password.";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
				}
				/*
                .then((response)=>{

                })
                .catch( (err) => {
                    ctx.meta.username = ctx.params.email;
                    ctx.meta.log = 'Create User failed.';
                    activity.setLog(ctx);
                    if (err.name === 'Database Error' && Array.isArray(err.data)){
                        if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                            return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                    }
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return err;
                });
            */

			}).then((response)=> {

				User.findOne(ctx, { query: {
					contactnumber: ctx.params.contactnumber
				}
				}).then((resp) => {
					User.updateById(ctx, parseInt(resp.data.id), {
						otp: otp,
						emailverificationkey: emailverificationkey,
					});
				});

				let MobileNumber = ctx.params.contactnumber;
				let Sender_Id = "LAMSAT";
				let MsgContent = otp +" is your OTP for Lamsat Signup.";
				let CountryCode = ctx.params.countrycode;
				let NewMobileNumber = MobileNumber.replace("+" + ctx.params.countrycode, "");

				//let urlSendSMS = "http://mshastra.com/sendurlcomma.aspx?user=20099487&pwd=6xp4bu&senderid=" + Sender_Id + "&CountryCode="+ CountryCode +"&mobileno=" + NewMobileNumber + "&msgtext=" + MsgContent + "&smstype=0/4/3";
				var urlSendSMS = `${SMS.url}?user=${SMS.user}&pwd=${SMS.pwd}&senderid=${SMS.sid}&CountryCode=${CountryCode}&msgtext=${MsgContent}&mobileno=${NewMobileNumber}`;
				console.log(urlSendSMS);

				request({
					url: urlSendSMS,
					method: "GET",
				}, function(error, response, body){
					if(error) {
						console.log( "Errrrorrr" , error);
					} else {
						console.log("Response Status & body " , response.statusCode, body);
					}
				});

				//return this.requestSuccess("User Created", response.data);

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
				var URL = url.url;
				const verificationLink = `https://lamsat.app/emailverification/${emailverificationkey}/user`
				//const verificationLink = `${URL}api/v1/public/user/verifymailid?emailverificationkey=${emailverificationkey}`
				//Reads the html template,body of the mail content
				readHTMLFile(mail_template + "/Usertemplate.html", function(err, html) {
					let template = handlebars.compile(html);
					let replacements = {
						Name: ctx.params.firstname,
						username: ctx.params.email,
						password: ctx.params.password,
						otp: otp,
						emailverificationkey: verificationLink,
						message12: "User Created Successfully "
					};
					const htmlToSend = template(replacements);
					// this method call the mail service to send mail
					ctx.call("mail.send", {
						to: ctx.params.email,
						subject: "User Verification Mail",
						html: htmlToSend
					}).then((res) => {
						return "Email sent successfully";
					});
				});
				return this.requestSuccess("User Created", response.data);
			});
	},

	verifypassword: function(ctx) {
		return User.findOne(ctx, {
			query: {
				[Op.or]: [
					{ email: ctx.params.email, },
					{ contactnumber: ctx.params.email }
				],
				status: 1
			},
			filter: Filters_Logins.security
		})
			.then( (res) => {
				if(res.data == undefined) {
					return User.findOne(ctx, {
						query: {
							[Op.or]: [
								{ email: ctx.params.email, },
								{ contactnumber: ctx.params.email }
							],
							status: 1
						},
						filter: Filters_Logins.security
					})
						.then( (res) => {
							console.log(res)
							// if(res.data.isverifiedemail === 0) {
							// 	return this.requestError(CodeTypes.AUTH_VERIFY_EMAILID);
							// } else
							if(res.data.isverified == 1) {
								if (passwordHash.verify(ctx.params.password, res.data.password))
								{
									return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
								}
								else
								{
									return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
								}
							}
							else {
								return this.requestError(CodeTypes.USERS_VERIFICATION);
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
					console.log(res)
					// if(res.data.isverifiedemail === 0) {
					// 	return this.requestError(CodeTypes.AUTH_VERIFY_EMAILID);
					// } else
					if(ctx.params.email == res.data.email && res.data.isverifiedemail == 0){
						return this.requestError(CodeTypes.USERS_VERIFICATION);
					}else if(ctx.params.email !== res.data.email && res.data.isverified == 0){
						return this.requestError(CodeTypes.USERS_VERIFICATION);
					}else{
						if (passwordHash.verify(ctx.params.password, res.data.password))
						{
							return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
						}
						else
						{
							return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
						}
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
		activity.getUser(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
		return this.verifyIfLogged(ctx)
			.then( () => ctx.call("user.verify_changepassword", { id: ctx.params.id, password: ctx.params.oldpassword}))
			.then( () => this.generateHash(ctx.params.newpassword) )
			.then( (res) => {

				if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
					User.updateById(ctx, ctx.meta.user.id, {
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
			.then( () => ctx.call("user.close_allsessions"))
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

	adminchangepassword: function(ctx) {
		activity.getUser(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		})
		return User.findOne(ctx, {query: {id: ctx.params.id}}).then((userres)=>{
			if(userres.data)
			{
				return this.generateHash(ctx.params.newpassword)
				.then( (res) => {
					if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
						User.updateById(ctx, ctx.params.id, {
							password: res.data
						});
						ctx.meta.log = "Password changed";
						activity.setLog(ctx);
					} else {
						ctx.meta.log = "Password Mismatch";
						activity.setLog(ctx);
						return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
					}
				}).then( () => this.requestSuccess("Changes Saved", true) )
			}	else {
			return this.requestError(CodeTypes.T1_T2_NOTHING_FOUND);
			}
		})
		.catch( (err) => {
			ctx.meta.log = "Attepmt to change password failed";
			activity.setLog(ctx);
			if (err instanceof MoleculerError)
				return Promise.reject(err);
			else
				return this.requestError(CodeTypes.UNKOWN_ERROR);
		});
	},

	otp_resend: function(ctx) {
		//Random password generation
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		return User_filter.find(ctx, { query: {
			contactnumber: ctx.params.contactnumber
		}})
			.then((response) => {
				if(response.data)
				{
					let MobileNumber = ctx.params.contactnumber;
					let Sender_Id = "LAMSAT";
					let MsgContent = otp +" is your OTP for Lamsat Signup.";
					let CountryCode = ctx.params.countrycode;
					let NewMobileNumber = MobileNumber.replace("+" + ctx.params.countrycode, "");

					//let urlSendSMS = "http://mshastra.com/sendurlcomma.aspx?user=20099487&pwd=6xp4bu&senderid=" + Sender_Id + "&CountryCode="+ CountryCode +"&mobileno=" + NewMobileNumber + "&msgtext=" + MsgContent + "&smstype=0/4/3";
					var urlSendSMS = `${SMS.url}?user=${SMS.user}&pwd=${SMS.pwd}&senderid=${SMS.sid}&CountryCode=${CountryCode}&msgtext=${MsgContent}&mobileno=${NewMobileNumber}`;
					console.log(urlSendSMS);

					request({
						url: urlSendSMS,
						method: "GET",
					}, function(error, response, body){
						if(error) {
							console.log( "Errrrorrr" , error);
						} else {
							console.log("Response Status & body " , response.statusCode, body);
						}
					});
					//generateHash gives encrypted password
					return this.generateHash(otp)
						.then((res) => {
							return User.updateBy(ctx, 1,
								{ otp : otp }, { query: {
									id: response.data[0].id
								}})

								.then((result) => {
									ctx.meta.username = ctx.params.email;
									ctx.meta.log = "OTP resent. Please verify.";
									activity.setLog(ctx);

									return this.requestSuccess("Resend OTP", response.data[0]);
								});
						});
				}
				else
					return this.requestError(CodeTypes.ALREADY_EXIST);
			}).catch( (err) => {
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = "OTP resend error.";
				activity.setLog(ctx);
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
			});
	},

	forgetpassword: function(ctx) {
		//Random password generation
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		return User.find(ctx, { query: {
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
					const verificationLink = `https://lamsat.app/resetpassword/${response.data[0].userkey}`
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
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		return User.find(ctx, { query: {
			email: ctx.params.email
		}})
			.then((response) => {
				if(response.data)
				{
					//generateHash gives encrypted password
					return this.generateHash(otp)
						.then((res) => {
							return User.updateBy(ctx, 1,
								{ password : res.data }, { query: {
									id: response.data[0].id
								}})

								.then((result) => {
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

									readHTMLFile(mail_template + "/Forgetpasswordtemplate.html", function(err, html) {

										let template = handlebars.compile(html);
										let replacements = {
											username: response.data[0].email,
											password: otp
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
				ctx.meta.log = "User Password reset attempt failed";
				activity.setLog(ctx);
				if (err instanceof MoleculerError)
					return Promise.reject(err);
				else
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
			});
	},

	changeforgetpassword: function(ctx) {
		return User.find(ctx, { query: {
			userkey: ctx.params.userkey
		}})
			.then((response) => {
				if(response.data)
				{
					return this.generateHash(ctx.params.password)
					.then((res) => {
						return User.updateBy(ctx, 1,
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

	otp_verify: function(ctx) {
		let email = "";
		let contact = "";
		if(ctx.params.email){
			email = {
				email : ctx.params.email
			};
		}

		if(ctx.params.contactnumber) {
			contact = {
				contactnumber: ctx.params.contactnumber
			};
		}
		return  User.findOne(ctx, { query: {
			[Op.or]: [
				email,
				contact
			],
		}
		})
			.then ((res) => {
				if (ctx.params.otp.localeCompare(res.data.otp) == 0)
				{
					return User.updateBy(ctx, res.data.id, {
						isverified: 1
					}, { query: {
						id: res.data.id
					}
					})
						.then((res)=>{
							return this.requestSuccess("OTP verified", ctx.params.email);
						});
				}
				else {
					return this.requestError(CodeTypes.INVALID_OTP);
				}
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

	verify_changepassword: function(ctx) {
	    return User.findOne(ctx, {
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
		let finduser = {};
		finduser["id"] = ctx.params.id;
		finduser["status"] = { [Op.ne]: DELETE };
		return User.findOne(ctx, { query: finduser })
			.then( (res) =>{
				return this.requestSuccess("User Detail", res.data);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	update: async function(ctx) {
		// activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
		// 	ctx.meta.username = res.data.email;
		// });
		return User.find(ctx, { query: {
			[Op.or]: [
				{ email: ctx.params.email, },
				{ contactnumber: ctx.params.contactnumber }
			],
			id: {[Op.ne]: ctx.params.id},
			status: {[Op.ne]:DELETE}
		}})
			.then((res)=>{

				if(res.data.length === 0) {
					return User.find(ctx, { query: {
						id: ctx.params.id
					}})
						.then((res)=>{
							let isverifiedemail = 0;
							let emailverificationkey = "";
							let actMail= res.data[0].email.trim().toLowerCase();
							let upMail = ctx.params.email.trim().toLowerCase();
							isverifiedemail = actMail === upMail ? 1 : 0;
							emailverificationkey  = actMail === upMail ? "" : uuidv4();
							return User.updateById(ctx, ctx.params.id, {
								firstname: ctx.params.firstname,
								lastname: ctx.params.lastname,
								email: ctx.params.email,
								contactnumber: ctx.params.contactnumber,
								photopath: ctx.params.photopath ? ctx.params.photopath : null,
								devicetype: ctx.params.devicetype,
								devicetoken: ctx.params.devicetoken,
								image_url: ctx.params.image_url ? ctx.params.image_url : null,
								isverifiedemail: isverifiedemail,
								emailverificationkey: emailverificationkey
							})
							.then((res)=>{
									//We get new mail id. So, send email verification mail
									if(isverifiedemail == 0) {
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
										var URL = url.url;
										const verificationLink = `https://lamsat.app/emailverification/${emailverificationkey}/user`
										//const verificationLink = `${URL}api/v1/public/user/verifymailid?emailverificationkey=${emailverificationkey}`
										//const verificationLink = `http://localhost:9012/emailverification/user${emailverificationkey}`
										//Reads the html template,body of the mail content
										readHTMLFile(mail_template + "/UserMailVerification.htm", function(err, html) {
											let template = handlebars.compile(html);
											let replacements = {
												Name: ctx.params.firstname,
												username: ctx.params.email,
												emailverificationkey: verificationLink,
												message12: "Email id updated successfully "
											};
											const htmlToSend = template(replacements);
											// this method call the mail service to send mail
											ctx.call("mail.send", {
												to: ctx.params.email,
												subject: "User Verification Mail",
												html: htmlToSend
											}).then((res) => {
												return "Email sent successfully";
											});
										});

									}
									ctx.meta.log = "User details updated.";
									activity.setLog(ctx);
									return  User_filter.findOne(ctx, { query: {
										id: ctx.params.id
									}
									})
										.then((res)=>{
											let temp_arr = [];
											async function get_favvendor(ctx, arr) {
												let total_array = [];
												for(let i = 0;i<arr.length;i++) {
												//to get Fav vendors of the user
													let fav_vendor = await Favvendor.find(ctx, { filter:["vendorid"],query: {userid:ctx.params.id}})
														.then((response)=>{
															let vendor_id = [];
															response.data.map((item) => {
																vendor_id.push(item.vendorid);
															});
															arr[i]["fav_vendors"] = vendor_id;
															return arr[i];
														});

													total_array.push(fav_vendor);
												}
												return total_array;
											}
											temp_arr.push(res.data);
											const vali =  get_favvendor(ctx,temp_arr);
											return vali.then((resy)=>{
												return resy;
											});
										});
							})
							.catch( (err) => {
									ctx.meta.log = "User details update failed.";
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
						}).catch( (err) => {

							ctx.meta.log = "User details update failed.";
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
					ctx.meta.log = "Update User failed with same email or Phone";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
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

	verifyMailId: function(ctx) {
		return  User.findOne(ctx, { query: {
			emailverificationkey: ctx.params.emailverificationkey
		}
		})
			.then((response) => {
				if(response.name === "Nothing Found") {
					ctx.meta.log = "Invalid verification code. Please try again.";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.INVALID_VERIFICATION_CODE);
				} else{

					User.updateById(ctx, parseInt(response.data.id), {
						isverifiedemail: 1
					});
					ctx.meta.log = "EMail id verified successfully. Please login.";
					activity.setLog(ctx);
					return this.requestSuccess("Email id verified", ctx.params.id);
				}

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
		return  User.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				User.updateBy(ctx, res.data.id, {
					status: 2
				}, { query: {
					id: ctx.params.id
				}
				});
				ctx.meta.log = `User id ${ctx.params.id} was removed.`;
				activity.setLog(ctx);
				return this.requestSuccess("User deleted", ctx.params.id);
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
			vendorstatus: ctx.params.vendorstatus
		}, { query: {
			id: ctx.params.id
		}
		})
			.then((res)=>{
				return "vendor timings Updated";
			});

	},

	timestatus: async function(ctx) {
		return vendortime.updateById(ctx, ctx.params.id, {
			vendorstatus:ctx.params.vendorstatus
		})
			.then((res)=>{
				return "vendor Status Updated";
			});
	},

	timeget: async function(ctx) {
		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
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

				return res.data;
			})
			.catch((err)=>{
				return err;
			});
	},

	images: async function(ctx) {
		let findvendor = {};
		findvendor["vendorid"] = ctx.params.vendorid;
		return vendorimagefilt.find(ctx, { query: findvendor })
			.then( (res) =>{

				async function get_images(ctx, arr) {

					let total_array = [];
					for(var i = 0;i<arr.length;i++) {
						let vendor_image = await vendorimagefilt.find(ctx, { query: {vendorid: arr[i].id}})
							.then((images)=>{
								const split_image = arr[i].vendorimagepath.split("__uploads");
								const image = split_image[1];
								const slice_image = image.slice(1);
								arr[i]["vendorimagepath"] = slice_image;
								return arr[i];
							});
						total_array.push(vendor_image);
					}
					return total_array;
				}
				const vali =  get_images(ctx,res.data);
				return vali.then((resy)=>{
					return resy;
				});
			});
	},

	imageremove: async function(ctx) {
		return vendorimage.removeById(ctx,ctx.params.id)
			.then((res)=>{
				return "Image Successfully Removed";
			});
	},

	favvendor: function(ctx) {
		if (ctx.params.favourite == 1) {
			return Favvendor.find(ctx, { query: {
				[Op.and]: [
					{ vendorid: ctx.params.vendorid, },
					{ userid: ctx.params.userid }
				],
			} })
				.then((res)=> {
					if (res.name === "Nothing Found")
					{
						return Favvendor.insert(ctx,{
							vendorid: ctx.params.vendorid,
							userid: ctx.params.userid
						})
							.then((res)=>{
								return this.requestSuccess("Favourites added");
							});
					}
					else {
						return this.requestError("Favourites already added");
					}
				});
		}
		else if (ctx.params.favourite == 0) {
			return Favvendor.removeMany(ctx,{
				vendorid: ctx.params.vendorid,
				userid: ctx.params.userid
			})
				.then((res)=>{
					return this.requestSuccess("Favourites Removed");
				});
		}
	},

	favhotels: function(ctx){
		return Favvendor.find(ctx, { filter:["vendorid"],query: {userid:ctx.params.userid}})
			.then((res)=>{
				let vendor_array = [];
				res.data.map((ven_id)=>{
					vendor_array.push(ven_id.vendorid);
				});
				let wherecond = {
					status: 1,
					id: vendor_array
				};
				return vendorfilt.find(ctx, { query: wherecond})
					.then((response)=>{
						async function get_hoteldetails(ctx, arr) {

							let total_array = [];
							for(var i = 0;i<arr.length;i++) {
								//to get language data of the hotel
								let language_val_filter = await vendorlang.find(ctx, { query: {vendorid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
									.then((lan_res)=>{
										arr[i]["vendorname"] = lan_res.data[0].vendorname;
										arr[i]["vendoraddress"] = lan_res.data[0].vendoraddress;
										arr[i]["vendordescription"] = lan_res.data[0].vendordescription;
										return arr[i];
									});
								let vendorimg = await vendorimage.find(ctx, { filter:["image_url","vendorimagepath"],query: {vendorid: arr[i].id}})
									.then((img_res)=>{
										arr[i]["images"] = img_res.data
										return arr[i];
									});
								let review_val = await db.sequelize.query("EXEC SP_Avgreview :vendorid",{replacements: {vendorid: arr[i].id},type: Sequ.QueryTypes.SELECT});
								if(review_val[0])
								{
									arr[i]["reviews"] = review_val[0];
								}
								else {
									let review = {
										"count": 0,
										"rating":0
									};
									arr[i]["reviews"] = review;
								}
								let cat_arr = [];
								if(arr[i].categoryid) {
									cat_arr = arr[i].categoryid.split(",");
								}
								let wherecondition = {
									categoryid: cat_arr,
									languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1,
									status: 1
								};
								let category_lan = await Categorylang.find(ctx,{filter:["categoryid","categoryname"],query:wherecondition})
									.then((res)=>{
										arr[i]["categories"] = res.data;
									});
								total_array.push(language_val_filter);
							}
							return total_array;
						}

						const vali =  get_hoteldetails(ctx,response.data);
						return vali.then((resy)=>{
							return resy;
						});
					});
			});
	},

	validate_voucher: function(ctx) {
		let dt = dateTime.create();
		let formatted = ctx.params.bookingdate;
		//let formatted = dt.format("Y-m-d");
		// return  Voucher.findOne(ctx, { query: {
		// 	vouchercode: ctx.params.vouchercode,
		// 	status: 1,
		// 	startdate: {
		// 		[Op.lte]: formatted
		// 	},
		// 	enddate:{
		// 		[Op.gte]: formatted
		// 	},
		// }
		// })
		const QUERY = `select * from mvoucher where vouchercode ='${ctx.params.vouchercode}' and status = 1
		and ('${formatted}' BETWEEN  startdate and enddate )`;
		return db.sequelize.query(QUERY)
			.then((res) => {
				console.log("response----------",res)
				if(res[0].length){
					return Uservoucher.findOne(ctx,{ query: {
						voucherid: res[0][0].id,
						status: 1,
						userid: ctx.params.userid,
						isused: 0
					}
					})
						.then(async (resp)=>{
							if(resp.data) {
								if(resp.data.mincartvalue <= ctx.params.totalamount){
									let subcost = ctx.params.totalamount;
									let discount = parseInt(resp.data.vouchervalue)/100 * parseInt(subcost);
									//let discount = resp.data.vouchervalue;
									let finalamount = subcost - discount;
									let voucher_obj = {};
									voucher_obj["subcost"] = subcost;
									voucher_obj["discount"] = discount;
									voucher_obj["finalamount"] = finalamount> 0 ? finalamount : 0;
									return this.requestSuccess("Voucher Approved",voucher_obj);
								}
								else{
									return this.requestSuccess("Insufficient Amount");
								}
							}
							else {
								return this.requestSuccess("Invalid Voucher");
							}
						})
						.catch((err)=>{
							return this.requestError("Invalid Voucher");
						});
				}
				else{
					return this.requestSuccess("Invalid Voucher");
				}
			})
			.catch((err=>{
				return this.requestError("Error Occurred", err);
			}));
	},

	sendMailVerficationEmail: function(ctx) {
	}
};
