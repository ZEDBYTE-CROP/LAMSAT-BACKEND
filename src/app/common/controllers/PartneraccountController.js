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
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const vendorlangfilt = new Database("Mvendorlang");
const Language = new Database("Mlanguage");
const db = require("../../../adapters/db");
const Sequ = require("sequelize");
const mail_template = __dirname;
const handlebars = require('handlebars');
const Config = require("../../../../config");
const url = Config.get('/url');
const vendortiming = require("../../../helpers/vendortiming");
const notifiction = require("../../../helpers/pushnotification");
const request = require("request");
const SMS = Config.get('/sms');
const otpGenerator =  require("otp-generator");
const { v4: uuidv4 } = require("uuid");
//Models
const Partneraccount = new Database("Mpartneraccount");
const Vendor = new Database("Mvendor");
const PartnerImage = new Database("Mpartnerimage");
const VendorImage = new Database("Mvendorimage");
const Patnertime =  new Database("Mpartnerhours");
const vendortime =  new Database("Mvendorhours");
const PartnerStaff = new Database("Mpartnerstaff");
const PartnerStafflang = new Database("Mpartnerstafflang");
const Staff = new Database("Mvendorstaff");
const Stafflang = new Database("Mvendorstafflang");
const partnercategory = new Database("Mpartnercategory");
const vendorcategory = new Database("Mvendorcategory");
const Admin = new Database("Madmin");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

	// Partner Account creation with multiple language
	create: async function(ctx) {

		let wherecond = {
			email_address: ctx.params.email_address,
			status: { [Op.ne]: DELETE }
		};
		return Partneraccount.find(ctx, { query: wherecond })
			.then((res) => {
				if (res.data.length === 0) {
					let sum = "";
					ctx.params.services.map((serv) =>{
						sum = sum + serv + ",";
					});
					let language = JSON.stringify(ctx.params.language);
					const pass = ctx.params.partnerpassword.toString().trim();
					const confpass = ctx.params.partnerconfirmpassword.toString().trim();
					if (pass.localeCompare(confpass) == 0) {
						return this.generateHash(pass)
							.then( (resp) => {
								let postData = {
									firstname: ctx.params.firstname,
									lastname: ctx.params.lastname,
									email_address: ctx.params.email_address,
									countryid: ctx.params.countryid,
									cityid: ctx.params.cityid,
									privacy_policy: ctx.params.privacy_policy,
									mobile: ctx.params.phonenumber,
									phonenumber: ctx.params.salonphonenumber,
									mobile_number: ctx.params.mobile_number,
									saloonname: ctx.params.saloonname,
									services: sum.replace(/^,|,$/g, ""),
									hearAboutFresha: ctx.params.hearAboutFresha,
									partnerAddress: ctx.params.partnerAddress,
									partnerDistrict: ctx.params.partnerDistrict,
									partnerPostcode: ctx.params.partnerPostcode,
									partnerRegion: ctx.params.partnerRegion,
									partnerconfirmpassword: resp.data,
									partnerpassword: resp.data,
									crdocument_url: ctx.params.crdocument_url,
									vatdocument_url: ctx.params.vatdocument_url,
									vatnumber: ctx.params.vatnumber,
									vatpercent: ctx.params.vatpercent,
									isVAT: ctx.params.isVAT,//---->YES=1,NO=2
									description: ctx.params.description,
									bankaccountnumber: ctx.params.bankaccountnumber,
									bankaccountname: ctx.params.bankaccountname,
									bankdocument_url: ctx.params.bankdocument_url,
									bankname: ctx.params.bankname,
									bankiban: ctx.params.bankiban,
									bankidbic: ctx.params.bankidbic,
									saloonphone: ctx.params.saloonphone,
									saloonemail: ctx.params.saloonemail,
									teamsize: ctx.params.teamsize,
									latitude: ctx.params.latitude,
									longitude: ctx.params.longitude,
									prefix: ctx.params.prefix,
									serviceavilable: ctx.params.serviceavilable,
									language: language

								}
								// console.log(`---------
								// request ${JSON.stringify(postData)}
								// ------------
								// `)
								return Partneraccount.insert(ctx, postData).then((response)=>{
									console.log('res',response);
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
									Partneraccount.updateBy(ctx, 1, {
										categoryid: temp,
									}, { query: {
										id:response.data.id
									}
									}).then((res) => console.log('res')).catch((err) => console.log('update err--',err));
									ctx.params.images.map((img)=>{
										PartnerImage.insert(ctx,{
											partnerid: response.data.id,
											image_url: img.image_url,
											partnerimagepath: img.imagepath,
										}).then((res) => {
											console.log('images inserted',res);
										})
										.catch(err => console.log('image insert error',err));
									});
									ctx.params.partnertime.map((days)=>{
										days["partnerid"] = response.data.id;
										Patnertime.insert(ctx, days).then(res => console.log('time inserted',res))
										.catch(err => console.log('time insert error',err));
									});
									//add category
									if(ctx.params.category && ctx.params.category.length) {
										ctx.params.category.map((val)=>{
											partnercategory.insert(ctx, {
												partnerid: response.data.id,
												categoryid: val,
												status: 1,
											});
										})
									}
									//add staffs
									if(ctx.params.staffs) {
										ctx.params.staffs.map((staff,i) => {
											PartnerStaff.find(ctx, { query: {
												[Op.or]: [
													{ email: staff.email, },
													{ contactnumber: staff.contactnumber }
												],
												partnerid: response.data.id,
												status: 1
											}})
											.then((res)=>{
												if(res.data.length === 0) {
													let serv_id;
													if(staff.serviceid) {
														serv_id = staff.serviceid.toString();
													}
													PartnerStaff.insert(ctx, {
														partnerid: response.data.id,
														email: staff.email,
														contactnumber: staff.contactnumber,
														employee_startdate: staff.employee_startdate ? staff.employee_startdate : '2020/1/1',
														employee_enddate: staff.employee_enddate,
														serviceid: serv_id ? serv_id : null,
														photopath: staff.photopath,
														firstname: staff.firstname,
														lastname: staff.lastname,
														staff_title: staff.staff_title,
														notes: staff.notes,
														image_url: staff.image_url,
														status: staff.status
													})
													.then( (res) => {
														console.log('------',res)
													})
													.catch((err) => {
														console.log('--------',err)
													})
												}
											})
										});
									}
									return this.requestSuccess("Partner Registerd Successfully", response.data);
								}).catch( (err) => {
									console.log("-----error----",err);
									if (err.name === "Database Error" && Array.isArray(err.data)){
										if (err.data[0].type === "unique" && err.data[0].field === "username")
											return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
									}
									else if (err instanceof MoleculerError)
										return Promise.reject(err);
									else
										return this.requestError(err);
								});
							})
							.catch((err) => console.log('passer------',JSON.stringify(err)))
					} else {
						ctx.meta.username = ctx.params.email;
						ctx.meta.log = "Password and confirm password is not matching.";
						activity.setLog(ctx);
						return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
					}
				}
				else {
					return this.requestError(`${ctx.params.email_address} Email ${CodeTypes.ALREADY_EXIST}`);
				}
			});

	},
	// country list with multiple language
	getall: async function(ctx) {
		let category_list = await db.sequelize.query("EXEC SP_GetPartnersApplications ",{ type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess("Services found!", category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : "");

		/*
		return Partneraccount.find(ctx, { filter:["id", "partneraccountkey", "firstname","lastname", "email_address","cityid","countryid", "privacy_policy", "mobile","status","created_by","mobile_number","services","hearAboutFresha","partnerAddress","partnerDistrict","partnerPostcode","partnerRegion", "saloonname", "vatnumber", "vatpercent", "vatdocument_url", "crdocument_url", "isaccepted", "description"],query: findpartneraccount })
			.then( (res) => {
				return this.requestSuccess("Partner Account List", res.data);
			})
			.catch( (err) => {

				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});*/
	},

	//status updation for country in both language
	status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
		//0=> inactive, 1=> active
		return  Partneraccount.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				return this.requestSuccess("Requested Partner Account", res.data);
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
	//Particular country list in multiple language
	get: function(ctx) {
		let findpartneraccount = {};
		findpartneraccount["id"] = ctx.params.id ;
		findpartneraccount["status"] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Partneraccount.find(ctx, { query: findpartneraccount })
			.then( (res) => {
				return this.requestSuccess("Requested Partner Account", res.data);
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	//Country update for mutiple language (all fields are mandatory)
	update: function(ctx) {
		let wherecond = {
			email_address: ctx.params.email_address,
			status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
			id: { [Op.ne]: ctx.params.id }
		};

		return Partneraccount.find(ctx, { query: wherecond })
			.then ((res) => {
				if (res.data.length === 0)
				{
					Partneraccount.updateBy(ctx, 1, {
						firstname: ctx.params.firstname,
						lastname: ctx.params.lastname,
						email_address: ctx.params.email_address,
						location: ctx.params.location,
						privacy_policy: ctx.params.privacy_policy,
						mobile: ctx.params.mobile,
					}, { query: {
						id: ctx.params.id
					}
					});
					return this.requestSuccess("Partner Account Updated", ctx.params.email_address);
				}
				else
				{
					return this.requestError(`Partner Account ${ res.data[0].email_address } ${CodeTypes.ALREADY_EXIST}`);
				}
			})
			.catch( (err) => {
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

	//Country delete is used change the status and not complete delete
	remove: function(ctx) {

		return  Partneraccount.findOne(ctx, { query: {
			id: ctx.params.id
		}
		})
			.then ((res) =>{
				return Partneraccount.updateBy(ctx, res.data.id, {
					status: 2
				}, { query: {
					id: ctx.params.id
				}
				}).then((res)=>{
					return this.requestSuccess("Partner Account Deleted", ctx.params.id);
				});
			});
	},

	//Check email or contact already exist
	isemailexist: async function(ctx) {
		let wherecond = {
			[Op.or]: [
				{ email_address: ctx.params.email_address, },
				{ mobile: ctx.params.mobile },
				{ saloonemail: ctx.params.email_address, },
			],
			status: { [Op.ne]: DELETE }
		};
		let vwherecond = {
			[Op.or]: [
				{ email: ctx.params.email_address, },
				{ contactnumber: ctx.params.mobile }
			],
			status: { [Op.ne]: DELETE }
		};
		const isPartnerExist = await Partneraccount.find(ctx, { query: wherecond });
		const isVendorExist = await Vendor.find(ctx, { query: vwherecond});
		if(isPartnerExist.data.length === 0 && isVendorExist.data.length === 0) {
			return this.requestSuccess("sucess");
		} else {
			return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
		}
	},

	updateapplystatus: function(ctx) {
		let wherecond = {
			id: ctx.params.id,
			status: { [Op.ne]: DELETE }
		};
		return Partneraccount.find(ctx, { query: wherecond })
			.then((res) => {
				if (res.data.length ) {
					return Partneraccount.updateBy(ctx, 1, {
						isaccepted: ctx.params.isaccepted
					}, { query: {
						id: ctx.params.id
					}
					}).then((res)=>{
						async function getVendorNumber() {
							let lastNum = await db.sequelize.query('SELECT TOP 1 vendornumber from mvendor order by vendornumber DESC');
							if(lastNum && lastNum[0].length && lastNum[0][0].vendornumber) {
								let str= lastNum[0][0].vendornumber;
								let strSplit = str;
								strSplit= parseInt(strSplit)+1;
								console.log(strSplit)
								let len = strSplit.toString().length;
								if(len === 1) {
									strSplit = `00${strSplit}`;
								} else if(len === 2) {
									strSplit = `0${strSplit}`;
								} else {
									strSplit = `${strSplit}`;
								}
								return strSplit;
							} else {
								let str= `001`;
								return str;
							}
						}
						const NUM =  getVendorNumber();
						return NUM.then((vendorno)=>{
							if(res.data[0].isaccepted) {
								let params = res.data[0];
								let language = JSON.parse(res.data[0].language);
								vendor.insert(ctx,{
									vendornumber: vendorno,
									isfeatured: res.data[0].isfeatured ? ctx.params.isfeatured : 0,
									firstname: res.data[0].firstname,
									lastname: res.data[0].lastname,
									username: res.data[0].firstname,
									email: res.data[0].email_address,
									password: res.data[0].partnerpassword,
									latitude: res.data[0].latitude,
									longitude: res.data[0].longitude,
									areaid: res.data[0].areaid ? res.data[0].areaid : null,
									cityid: res.data[0].cityid,
									countryid: res.data[0].countryid,
									commissiontype: null, ///value and percent
									sortorder: 1,
									vat: res.data[0].vatpercent,
									vatnumber: res.data[0].vatnumber,
									servicelocation: res.data[0].partnerAddress, //1=> both, 2==> Home, 3==> Salon
									service_available: res.data[0].serviceavilable ? res.data[0].serviceavilable : 3,//? ctx.params.serviceavilable : 1, //1=> Women, 2=> kids
									contactnumber: res.data[0].mobile,
									image_url: res.data[0].image_url,
									photopath: res.data[0].imagepath,
									//prefix: res.data[0].mobile_number,
									status: 1,
									crdocument_url: res.data[0].crdocument_url,
									vatdocument_url: res.data[0].vatdocument_url,
									saloonphone: res.data[0].saloonphone,
									saloonemail: res.data[0].saloonemail,
									teamsize: res.data[0].teamsize,
									hearAboutFresha: res.data[0].hearAboutFresha,
									partnerDistrict: res.data[0].partnerDistrict,
									partnerPostcode: res.data[0].partnerPostcode,
									partnerRegion: res.data[0].partnerRegion,
									bankdocument_url: res.data[0].bankdocument_url,
									bankaccountnumber: res.data[0].bankaccountnumber,
									bankaccountname: res.data[0].bankaccountname,
									bankname: res.data[0].bankname,
									bankiban: res.data[0].bankiban,
									bankidbic:  res.data[0].bankidbic,
									isaccepted: 1,
									vatpercent: res.data[0].isVAT ? res.data[0].isVAT : 1,//--->YES=1,NO=2
									//description: res.data[0].description,
									saloonname: res.data[0].saloonname,
									prefix: res.data[0].prefix,
									categoryid: res.data[0].categoryid,
									mobilenumber: res.data[0].mobile_number
								})
									.then(async (resLocal) => {
										//console.log('-------reslocal',resLocal);
										// Language.find(ctx, { query: {status:{ [Op.ne]: DELETE }} }).then((langres) => {
										// 	langres.data.map((langu) => {
										// 		vendorlang.insert(ctx, {
										// 			vendorid: resLocal.data.id,
										// 			languageid: langu.id,
										// 			languageshortname: langu.languageshortname,
										// 			vendorname: resLocal.data.saloonname,
										// 			vendordescription: resLocal.data.description,
										// 			vendoraddress: resLocal.data.partnerAddress
										// 		}).then(res => console.log('insert in to vendor language'))
										// 		.catch(err => console.log('insert error----->',err));
										// 	});
										// });
										language.map((langu) => {
											vendorlang.insert(ctx, {
												vendorid: resLocal.data.id,
												languageid: langu.id,
												languageshortname: langu.languageshortname,
												vendorname: langu.vendorname,
												vendordescription: langu.vendordescription,
												vendoraddress: langu.vendoraddress
											}).then(res => console.log('insert in to vendor language'))
											.catch(err => console.log('insert error----->',err));
										});
										let partnerImg = await PartnerImage.find(ctx,{query:{partnerid:res.data[0].id}}).then(res=>{return res});
										if(partnerImg.data && partnerImg.data.length) {
											partnerImg.data.map((img)=>{
												VendorImage.insert(ctx,{
													vendorid: resLocal.data.id,//img.partnerid,
													image_url: img.image_url,
													vendorimagepath: img.partnerimagepath,
												});
											});
										}
										let partnerTime = await Patnertime.find(ctx,{query:{partnerid:res.data[0].id}}).then(res=>{return res});
										if(partnerTime.data && partnerTime.data.length) {
											partnerTime.data.map((day)=>{
												let days = {};
												days["vendorid"] = resLocal.data.id;
												days["days"] = day.days;
												days["starttime"] = day.starttime;
												days["endtime"] = day.endtime;
												days["vendorstatus"] = day.partnerstatus;
												vendortime.insert(ctx, days);
											});
										}

										let partnerCategory = await partnercategory.find(ctx,{query:{partnerid:res.data[0].id}}).then(res=>{return res});
										if(partnerCategory.data && partnerCategory.data.length) {
											partnerCategory.data.map((category)=>{
												vendorcategory.insert(ctx, {
													vendorid: resLocal.data.id,
													categoryid: category.categoryid,
													status: 1,
												});
											});
										}

										let partnerStaff = await PartnerStaff.find(ctx,{query:{partnerid:res.data[0].id}}).then(res=>{return res});
										if(partnerStaff.data && partnerStaff.data.length) {
											partnerStaff.data.map((staff)=>{
												Staff.insert(ctx,{
													vendorid: resLocal.data.id,//img.partnerid,
													email: staff.email,
													contactnumber: staff.contactnumber,
													employee_startdate: staff.employee_startdate ? staff.employee_startdate : '2020/1/1',
													employee_enddate: staff.employee_enddate,
													serviceid: staff.serviceid,
													photopath: staff.photopath,
													firstname: staff.firstname,
													lastname: staff.lastname,
													staff_title: staff.staff_title,
													notes: staff.notes,
													image_url: staff.image_url,
													status: staff.status
												});
											});
										}
									}).catch(err => console.log('insert error-----',err));

									const URL = url.url;
									const LOGO = `${URL}logo.png`;
									//Send confirmation booking
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
									readHTMLFile(mail_template + "/PartnerEmail.html", function(err, html) {
										let template = handlebars.compile(html);
										let replacements = {
											logo: LOGO,
											username: res.data[0].firstname+" "+res.data[0].firstname,
										};
										const htmlToSend = template(replacements);
										// this method call the mail service to send mail
										ctx.call("mail.send", {
											to: res.data[0].email_address,
											subject: "Saloon Confirmation",
											html: htmlToSend
										}).then((res) => {
											return "Email send Successfully";
										})
									})
								return this.requestSuccess("Partner application accepted.", res.data[0].isaccepted);
							} else if(res.data[0].isaccepted === 2) {
								console.log("----rejeted----");
								return this.requestSuccess("Partner application rejected.", res.data[0].isaccepted);
							}
						});
					})
					.catch((err) => {
						console.log('sttus update error------->',err);
					});
				}
			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.NOTHING_FOUND);
				else
					return this.requestError(err);
			});
	},

	createnewsalon: function(ctx) {
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		let emailverificationkey = uuidv4();
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
																	firstname: ctx.params.firstname,
																	lastname: ctx.params.lastname,
																	username: ctx.params.username ? ctx.params.username : ctx.params.firstname,
																	email: ctx.params.email,
																	password: res.data,
																	latitude: ctx.params.latitude,
																	longitude: ctx.params.longitude,
																	areaid: 1,
																	cityid: ctx.params.cityid,
																	countryid: ctx.params.countryid,
																	contactnumber: ctx.params.contactnumber,
																	mobilenumber: ctx.params.mobile_number,
																	prefix: ctx.params.prefix,
																	saloonphone: ctx.params.saloonphone,
																	saloonemail: ctx.params.saloonemail,
																	partnerAddress: ctx.params.partnerAddress ? ctx.params.partnerAddress : null,
																	partnerDistrict: ctx.params.partnerDistrict ? ctx.params.partnerDistrict : null,
																	partnerPostcode: ctx.params.partnerPostcode ? ctx.params.partnerPostcode : null,
																	partnerRegion: ctx.params.partnerRegion ? ctx.params.partnerRegion : null,
																	status: ctx.params.status !== null ? ctx.params.status : 1,
																	otp: otp,
																	isotpverified:0,
																	isverifiedemail:0,
																	emailverificationkey: emailverificationkey,
																	isfeatured: 0,
																	isaccepted: 0,
																	isstaffaccepted: 0,
																	isprofileaccepted: 0,
																	isserviceaccepted: 0
																}))
																.then(async(response)=>{
																	let adminData = await Admin.findOne(ctx, { query: {id: 1}}).then((res)=>{return res.data});
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
																	ctx.meta.username = ctx.params.email;
																	ctx.meta.log = "New vendor created.";
																	activity.setLog(ctx);
																	// Sending username and password to customers mail
																	var URL = url.url;
																	const verificationLink = `https://lamsat.app/emailverification/${emailverificationkey}/vendor`
																	//const verificationLink = `${URL}api/v1/public/partner/partnerverifyMailId?emailverificationkey=${emailverificationkey}`
																	//Reads the html template,body of the mail content
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
																	readHTMLFile(mail_template + "/Partnerconfirmation.html", function(err, html) {
																		let template = handlebars.compile(html);
																		let replacements = {
																			Name: ctx.params.firstname,
																			username: ctx.params.email,
																			password: ctx.params.password,
																			otp: otp,
																			emailverificationkey: verificationLink,
																			message12: "Partner Created Successfully "
																		};
																		const htmlToSend = template(replacements);
																		// this method call the mail service to send mail
																		ctx.call("mail.send", {
																			to: ctx.params.email,
																			subject: "Partner Verification Mail",
																			html: htmlToSend
																		}).then((res) => {
																			return "Email send Successfully";
																		});
																	});
																	let obj = {};

																	obj.msg = {"en": `${ctx.params.username ? ctx.params.username : ctx.params.firstname} new vendor created`};
																	obj.userkey = adminData.adminkey;
																	obj.heading = {"en": "New vendor added"};
																	let notObj = {
																		title: JSON.stringify(obj.heading),
																		content: JSON.stringify(obj.msg),
																		isdelivered: 1,
																		userid: adminData.id,
																		usertype: "admin"
																	}
																	notifiction.sendAdmin(obj).then((r) => {
																		console.log('----',r)
																		r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
																		notifiction.saveNotification(ctx,notObj);
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

	updatesalonapproval: function(ctx) {
		let wherecond = {
			id: ctx.params.id,
			status: 1,
		};
		return vendor.find(ctx, { query: wherecond })
			.then((res)=>{
				console.log("responseeee",res.data)
				if (res.data.length !== 0) {
					if(ctx.params.isaccepted == 1)
					{
						vendor.updateBy(ctx, 1, {
							status: 1,
							isaccepted: 1
							}, { query: {
								id: ctx.params.id
							}
						});
						const URL = url.url;
						const LOGO = `${URL}logo.png`;
						//Send confirmation booking
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
						readHTMLFile(mail_template + "/PartnerEmail.html", function(err, html) {
							let template = handlebars.compile(html);
							let replacements = {
								logo: LOGO,
								username: res.data[0].firstname+" "+res.data[0].lastname,
							};
							const htmlToSend = template(replacements);
							// this method call the mail service to send mail
							ctx.call("mail.send", {
								to: res.data[0].email,
								subject: "Saloon Confirmation",
								html: htmlToSend
							}).then((res) => {
								return "Email send Successfully";
							})
						})
						let obj = {};
						obj.msg = {"en": `vendor application accepted`};
						obj.userkey = res.data[0].vendorkey;
						obj.heading = {"en": "vendor approval status"};
						let notObj = {
							title: JSON.stringify(obj.heading),
							content: JSON.stringify(obj.msg),
							isdelivered: 1,
							userid: ctx.params.id,
							usertype: "vendor"
						}
						notifiction.sendAdmin(obj).then((r) => {
							console.log('----',r)
							r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
							notifiction.saveNotification(ctx,notObj);
						});
						return this.requestSuccess("Vendor Accepted Successfully");
					}
					else {
						vendor.updateBy(ctx, 1, {
							status: 1,
							isaccepted: 2
							}, { query: {
								id: ctx.params.id
							}
						});
						let obj = {};
						obj.msg = {"en": `vendor application rejected`};
						obj.userkey = res.data[0].vendorkey;
						obj.heading = {"en": "vendor approval status"};
						let notObj = {
							title: JSON.stringify(obj.heading),
							content: JSON.stringify(obj.msg),
							isdelivered: 1,
							userid: ctx.params.id,
							usertype: "vendor"
						}
						notifiction.sendAdmin(obj).then((r) => {
							console.log('----',r)
							r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
							notifiction.saveNotification(ctx,notObj);
						});
						return this.requestSuccess("Vendor Rejected Successfully");
					}
				}
				else {
					return this.requestError(`Vendor Not Found`);
				}
			});
	},

	publicgeneratevendornumber: async function(ctx,res) {
		let lastNum = await db.sequelize.query('SELECT TOP 1 vendornumber from mvendor order by vendornumber DESC');
		if(lastNum && lastNum[0].length && lastNum[0][0].vendornumber) {
			let str= lastNum[0][0].vendornumber;
			let strSplit = str;
			strSplit= parseInt(strSplit)+1;
			console.log(strSplit)
			let len = strSplit.toString().length;
			if(len === 1) {
				strSplit = `00${strSplit}`;
			} else if(len === 2) {
				strSplit = `0${strSplit}`;
			} else {
				strSplit = `${strSplit}`;
			}
			return this.requestSuccess('Saloon number',strSplit);
		} else {
			let str= `001`;
			return this.requestSuccess('Saloon number.',str);
		}
	},

	partnerverifyMailId: function(ctx) {

		return  vendor.findOne(ctx, { query: {
			emailverificationkey: ctx.params.emailverificationkey
		}
		})
			.then((response) => {
				if(response.name === "Nothing Found") {
					ctx.meta.log = "Invalid verification code. Please try again.";
					activity.setLog(ctx);
					return this.requestError(CodeTypes.INVALID_VERIFICATION_CODE);
				} else{

					vendor.updateById(ctx, parseInt(response.data.id), {
						isverifiedemail: 1
					});
					ctx.meta.log = "EMail id verified successfully. Please login.";
					activity.setLog(ctx);
					return this.requestSuccess("Email id verified", ctx.params.id);
				}

			})
			.catch( (err) => {
				if (err.name === "Nothing Found")
					return this.requestError(CodeTypes.INVALID_VERIFICATION_CODE);
				else {
					this.logger.info(err);
					return this.requestError(`${err}`);
				}
			});

	},

	getpartneremail: function(ctx) {
		let emailverificationkey = uuidv4();
		let wherecond = {
			id: ctx.params.id,
			email: ctx.params.email,
		};
		return vendor.find(ctx, { query: wherecond })
		.then((res)=>{
			if (res.data.length)
			{
				var URL = url.url;
				const verificationLink = `https://lamsat.app/emailverification/${emailverificationkey}/vendor`
				//const verificationLink = `${URL}api/v1/public/partner/partnerverifyMailId?emailverificationkey=${emailverificationkey}`
				//Reads the html template,body of the mail content
				vendor.updateBy(ctx, 1, {
					emailverificationkey: emailverificationkey,
				}, { query: {
					id:ctx.params.id
				}
				});
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
				readHTMLFile(mail_template + "/Partneremailconfirm.html", function(err, html) {
					let template = handlebars.compile(html);
					let replacements = {
						Name: res.data[0].firstname,
						username: ctx.params.email,
						emailverificationkey: verificationLink,
						message12: "Partner Created Successfully "
					};
					const htmlToSend = template(replacements);
					// this method call the mail service to send mail
					ctx.call("mail.send", {
						to: ctx.params.email,
						subject: "Partner Verification Mail",
						html: htmlToSend
					}).then((res) => {
						return "Email send Successfully";
					});
				});
				return this.requestSuccess("Email send Successfully", ctx.params.email);
			}
			else {
				return this.requestError(`Vendor Not Found`);
			}
		});
	},

	getpartnerotp: function(ctx) {
		let otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		let wherecond = {
			id: ctx.params.id,
			contactnumber: '+'+ctx.params.contactnumber,
		};
		console.log(wherecond)
		return vendor.find(ctx, { query: wherecond })
		.then((res)=>{
			console.log("------",res)
			if (res.data.length)
			{
				vendor.updateBy(ctx, 1, {
					otp: otp,
				}, { query: {
					id:ctx.params.id
				}
				});
				let MobileNumber = ctx.params.contactnumber;
				let Sender_Id = "LAMSAT";
				let MsgContent = otp +" is your OTP for Lamsat Signup.";
				let CountryCode = ctx.params.countrycode;
				let NewMobileNumber = MobileNumber.replace("+" + ctx.params.countrycode, "");

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
				return this.requestSuccess("Otp send Successfully", ctx.params.contactnumber);
			}
			else {
				return this.requestError(`Vendor Not Found`);
			}
		});
	},

	partnerotp_verify: function(ctx) {
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
		return  vendor.findOne(ctx, { query: {
			[Op.or]: [
				email,
				contact
			],
		}
		})
			.then ((res) => {
				if (ctx.params.otp.localeCompare(res.data.otp) == 0)
				{
					return vendor.updateBy(ctx, res.data.id, {
						isotpverified: 1
					}, { query: {
						id: res.data.id
					}
					})
						.then((res)=>{
							return this.requestSuccess("OTP verified", ctx.params.email);
						});
				}
				else {
					return this.requestError(CodeTypes.NOTHING_FOUND);
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

};
