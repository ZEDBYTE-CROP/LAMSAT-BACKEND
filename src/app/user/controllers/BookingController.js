"use strict";

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const mail_template = __dirname;
const handlebars = require('handlebars');
const request = require("request");
const Sequ = require("sequelize");
const Config = require("../../../../config");
const SMS = Config.get('/sms');
const notifiction = require("../../../helpers/pushnotification");
const moment = require('moment');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require("uuid");
const url = Config.get('/url');
//Models

const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");
const Serviceprice = new Database("Mserviceprice");
const Servicestaff = new Database("Mservicestaff");
const Package = new Database("Mpackage");
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const Vendorimage = new Database("Mvendorimage");
const Booking = new Database("Tbooking");
const Bookingfilt = new Database("Tbooking");
const Bookingtime = new Database("Tbookingtime");
const Bookingsublist = new Database("Tbookingsublist");
const Bookingsublistfilt = new Database("Tbookingsublist");
const Category = new Database("Mcategory");
const Categorylang = new Database("Mcategorylang");
const Staff = new Database("Mvendorstaff");
const Uservoucher = new Database("Muservoucher");
var dateTime = require('node-datetime');
const Bookingtimefilt = new Database("Tbookingtime",[
	"service_id",
	"service_date",
	"service_time",
	"service_details",
    "status",
    "staffid"
]);

const BookingtimefiltbyID = new Database("Tbookingtime",[
	"service_id",
	"service_date",
	"service_time",
	"service_details",
    "status",
    "staffid",
    "staff_details"
]);
const User_filt = new Database("Muser",[
    'id',
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
	"countrycode",
    "status"
]);
const User = new Database("Muser");
const CountryLang = new Database("Mcountrylang");
const Citylang = new Database("Mcitylang");
const Review = new Database("Treview");
const db = require('../../../adapters/db');
const Settings = new Database("Msettings");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

const qrOption = {
  margin : 7,
  width : 175
};

module.exports = {

    getservice_list: async function(ctx) {
        let findservice = {};
        if(ctx.params.vendorid) {
            findservice['vendorid'] = ctx.params.vendorid;
        }
        if(ctx.params.categoryid) {
            findservice['categoryid'] = ctx.params.categoryid;
        }
        findservice['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Service.find(ctx, { query: findservice })
        .then( (res) => {
            var arr = res.data;
            async function get_services(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {

                    let subject_lang = await Categorylang.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["categoryname"] = lan_res.data[0].categoryname;
                        return arr[i];
                    });

                    let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["servicename"] = lan_res.data[0].servicename;
                        return arr[i];
                    });

                    let language_val1 = await Servicelang.find(ctx, { filter: ['languageid', 'servicename','description'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });

                    let price_option = await Serviceprice.find(ctx, { filter: ['pricing_name', 'duration','pricetype', 'price', 'special_price'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["price"] = lan_res.data;
                        return arr[i];
                    })

                    let service_staff = await Servicestaff.find(ctx, { filter: ['staffid'],query: {serviceid: arr[i].id}})
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
                return this.requestSuccess('Services found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    getcategory_list: function(ctx) {
        let findcategory = {};
        if(ctx.params.vendorid) {
            findcategory['vendorid'] = ctx.params.vendorid;
        }
        findcategory['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Category.find(ctx, { query: findcategory })
        .then( (res) => {
            var arr = res.data;
            async function get_category(ctx, arr) {
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
                        return arr[i];
                    })

                    final.push(subject_lang);
                }
                return final;
            }
            const vali =  get_category(ctx,arr);
            return vali.then((resy)=>{
                return resy;
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
    // Booking creation
    create: async function(ctx) {
		var itemArr = [];
        if(!ctx.params.vouchercode){
			var sercost = 0, packcost = 0;
			var newcustomerid = 0;
            if(ctx.params.serviceid) {
                    sercost = await serv_cost(ctx, ctx.params.serviceid);
            }
            if(ctx.params.packageid){
                    packcost = await pack_cost(ctx, ctx.params.packageid);
			}
			if(ctx.params.customerid == 0){
				await User.findOne(ctx, { query: {
					[Op.or]: [
						{ email: ctx.params.email, },
					  ],
					status: { [Op.ne]: DELETE }
				}})
				.then(async(res)=> {
					if (res.name === "Nothing Found")
					{
						let emailverificationkey = uuidv4();
						await User.insert(ctx, {
							firstname: ctx.params.customername,
							lastname: "",
							email: ctx.params.email,
							password: "sha256$6c8380b2$1$8377121c1830ef2f0d468f2b1201e68780471677f723da936800edb89db1d896",
							cityid: 1,
							countryid: 1,
							contactnumber: ctx.params.contactnumber,
							otp: "12345",
							usertypeid: 3,
							panel: "User",
							isverified:1,
							isverifiedemail:1,
							emailverificationkey: emailverificationkey,
						})
						.then((response)=>{
							newcustomerid = response.data.id
						})	
					} else {
						newcustomerid = res.data.id
					}
				})
			}
			console.log("test",newcustomerid)

            // var sercost = await serv_cost(ctx, ctx.params.serviceid);
            // var packcost = await pack_cost(ctx, ctx.params.packageid);
            // var vatval = await vat_val(ctx, ctx.params.vendorid);
            // var subcost =  sercost + packcost;
            // var vatamt =  (subcost/100) * vatval;
            // var totcost =   subcost + vatamt;
            var subcost =  ctx.params.subtotal;
            var vatamt =  ctx.params.vat_amount;
            var totcost =   ctx.params.totalcost;
            var cat_str = ctx.params.categoryid.toString();
            //var serv_str = ctx.params.serviceid.toString();
            return Booking.insert(ctx, {
                bookingno: this.randombookingnum(),
                vendorid: ctx.params.vendorid,
                customerid: ctx.params.customerid == 0 ? newcustomerid : ctx.params.customerid,
                service_date: ctx.params.service_date,
                service_time: ctx.params.service_time,
                subtotal: ctx.params.subtotal,
                actualrate: ctx.params.actualrate,
                servicerate: ctx.params.servicerate,
                vat_percent: ctx.params.vat_percent,
                vat_amount: ctx.params.vat_amount,
                totalcost: ctx.params.totalcost,
                payment_method: ctx.params.payment_method,
                devicetype: ctx.params.devicetype,
                devicetoken: ctx.params.devicetoken,
                booking_status: 1,   //1 -> confirmed,2 -> late cancelled,3 -> cancelled
                categoryid: cat_str,
                staffid: ctx.params.staffid,
            })
            .then(async(result)=>{
				// ctx.call("payment.completepayment",{eid:ctx.params.eid,checkoutid:ctx.params.checkoutid,bookingid:result.data.id,transactionkey:ctx.params.transactionkey})
				// .then(async (res) => {
				// 	if(res.data) {
						var hot_detail = [];
						await vendor.find(ctx, { query: {
							id: ctx.params.vendorid,
						} })
						.then(async (res) => {
							delete res.data[0]["password"];

							var arr = res.data;
							let language_val12 = await vendorlang.find(ctx, { query: {vendorid: ctx.params.vendorid}})
							.then((lan_res)=>{
								res.data[0]['language'] = lan_res.data;
							})
							hot_detail.push(res.data[0]);
						});
						var hotel_str = JSON.stringify(hot_detail);
						User_filt.find(ctx, { query: { id: ctx.params.customerid == 0 ? newcustomerid : ctx.params.customerid,  }
						})
						.then(async (ans)=>{
							var fin_val = JSON.stringify(ans.data);
							Booking.updateBy(ctx, 1, {
								customerdetails:fin_val,
								vendor_details:hotel_str
							}, { query: {
								id: result.data.id
							}
							});
						})
						var serv_arr = ctx.params.serviceid;
						var BookingIte = await serv_arr.map(async (service,index) => {
							var wherecon = {
								id: service.serviceid,
								status:1
							}
							return await Service.find(ctx, {filter:['id','vendorid', 'categoryid','availability', 'tax', 'service_staff','photopath','image_url'],query:wherecon})
							.then(async (resp)=>{
								var jim = [];
								return await resp.data.map(async(item)=>{

									let ServiceListlang = await db.sequelize.query('EXEC SP_serv_lang :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT})
									let ServiceListprice = await db.sequelize.query('EXEC SP_serv_price :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT})
									item['language'] = ServiceListlang;
									item['price'] = ServiceListprice;
									jim.push(item);
									if(jim.length == resp.data.length){

										var serv_str = JSON.stringify(jim);
										return await Staff.find(ctx, { query: { id: service.staffId  }
										})
										.then(async(response)=>{

											var staff_val = JSON.stringify(response.data);
											return await Bookingtime.insert(ctx,{
												bookingid: result.data.id,
												staffid: service.staffId,
												service_id: item.id,
												service_date: service.service_date,
												service_time: service.service_time,
												service_details: serv_str,
												status:1,
												staff_details: staff_val,
												booking_status: 2,
												payment_method: ctx.params.payment_method,
												payment_status: 0,
											}).then((res) => {
												//console.log('bookin time rea',res);
												itemArr.push(res.data);
											}).catch((err) => {
												//console.log('Booking time error',err);
												return this.requestError(err);
											});
										})
									}
								})
							})
						})
						return Promise.all(BookingIte).then(async () => {
							if(ctx.params.categoryid.length > 0){
								var cat_arr = ctx.params.categoryid;
								var wherecat = {
									id: cat_arr,
									status:1
								}
								Category.find(ctx, {filter:['id','categorykey', 'photopath','image_url','status', 'created_by', 'created_at'],query:wherecat})
								.then((resp)=>{
									var jim = [];
									resp.data.map(async(item)=>{
										let CategoryListlang = await db.sequelize.query('EXEC SP_categorylang :categoryid',{replacements: {categoryid: item.id},type: Sequ.QueryTypes.SELECT})
										item['language'] = CategoryListlang;
										jim.push(item);
										if(jim.length == resp.data.length){
											var cat_str = JSON.stringify(jim);
											Booking.updateBy(ctx, 1, {
												category_details: cat_str
											}, { query: {
												id: result.data.id
											}
											})
										}
									})
								})
								.catch((err)=>{
									return this.requestError(err);
								})
							}
							var vendordetails = [];
							var final_val = {};
							let vendordata =await vendor.find(ctx, { query: {
								id: ctx.params.vendorid,
							} })
							.then(async (res) => {
								delete res.data[0]["password"];
								var arr = res.data;
								let language_val12 = await vendorlang.findOne(ctx, { filter:['vendorname'],query: {vendorid: ctx.params.vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
								.then((lan_res)=>{
									res.data[0]['language'] = lan_res.data;
								});
								vendordetails.push(res.data[0]);
								await sleep(2000)
								let servData = await Bookingtimefilt.find(ctx, {query: {bookingid:result.data.id,status:1}}).then((re) => {

									return re;
								});
								if(servData.data.length) {
									var serviceDetailArr = [];
									servData.data.map((service,i) => {
										let obj = {};
										const serv = JSON.parse(service.service_details);
										serv.map((service)=>{
											var serv_lan = [];
											service.language.map((val)=>{
												if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
													serv_lan.push(val);
												}
											})
											if(serv_lan.length > 0){
												service.language = serv_lan[0];
											}
											else {
												service.language = {};
											}
										})
										obj['service_id'] = service.service_id;
										obj['service_date'] = service.service_date;
										obj['service_time'] = service.service_time;
										obj['status'] = service.status;
										obj['service_details'] = serv;
										serviceDetailArr.push(obj);
									})
									final_val['service_details'] = serviceDetailArr;
								}
								final_val['vendor_name'] = vendordetails[0]['language']['vendorname'];
								final_val['image_url'] = vendordetails[0]['image_url'];
								final_val['bookingid'] = result.data.bookingno;
								final_val['bookingDetails'] = result.data;
								User_filt.find(ctx, { query: { id: ctx.params.customerid == 0 ? newcustomerid : ctx.params.customerid,  }
								})
								.then(async (ans)=>{
									console.log(`
										-----------------
										${JSON.stringify(ans)}
										-----------------
									`)
									const commissionamount = await  Settings.find(ctx,{query:{}}).then((res) => {
										return res.data[0].settingsvalue; 
									});
									console.log("commissionamount",commissionamount)
									const qrString = `https://lamsat.app/bookingdetails/${result.data.id}`;
									const bufferImage = await qrcode.toDataURL(qrString,qrOption);
									console.log(bufferImage);
									const uploadDir = `${global.appRoot}/src/app/common/controllers/__uploads`;
									const QRFileName = `QR-${result.data.bookingno}.png`;
									var base64Data = bufferImage.replace(/^data:image\/png;base64,/, "");
									fs.writeFile(`${uploadDir}/${QRFileName}`, base64Data, 'base64', function(err) {
										console.log('file write error',err);
									});
									const URL = url.url;
									const LOGO = `${URL}logo.png`;
									const QRLink = `${URL}${QRFileName}`;
									// const b_date = moment(vendordetails[0]["created_at"]).format('L');
									// const b_time = moment(vendordetails[0]["created_at"]).format('LT');
									const b_date = ctx.params.service_date;
									const b_time = moment(serv_arr[0].service_time,'h:mm:ss').format("hh:mm A");
									const map_location = `https://maps.google.com/?q=${vendordetails[0]['latitude']},${vendordetails[0]['longitude']}`
									var itemList = '<span>';
									if(itemArr && itemArr.length) {
										itemArr.map((item,i) => {
											let servDetailObj = JSON.parse(item.service_details);
											let servicename = servDetailObj[0]["language"][0].servicename;
											let serviceprice = servDetailObj[0]["price"][0].price;
											itemList +=	`
													<tr>
														<td align="left">
															${servicename}
														</td>
														<td align="right">
															${(parseInt(serviceprice)+parseInt(serviceprice * commissionamount/100))} SAR
														</td>
													</tr>
											`;
										})
									}
									itemList += '</span>';
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
									readHTMLFile(mail_template + "/BookingEmail.html", function(err, html) {
										let template = handlebars.compile(html);
										let replacements = {
											logo: LOGO,
											saloon_name: vendordetails[0]['language']['vendorname'],
											saloon_image: vendordetails[0]['image_url'],
											saloon_address: vendordetails[0]['vendoraddress'],
											map_link: map_location,
											booking_date: b_date,
											booking_time: b_time,
											list: itemList,
											booking_id: result.data.bookingno,
											booking_cost: totcost,
											vat:vatamt,
											QRLink:QRLink,
											message12: "Your Booking Completed Successfully "
										};
										const htmlToSend = template(replacements);
										// this method call the mail service to send mail
										ctx.call("mail.send", {
											to: ans.data[0].email,
											subject: "Booking Details",
											html: htmlToSend
										}).then((res) => {
											return "Email send Successfully";
										})
									})

									// let MobileNumber = ans.data[0].contactnumber;
									// let Sender_Id = "LAMSAT";
									// let MsgContent =  "Hi "+ans.data[0].firstname +" "+ans.data[0].lastname+", your appointment with "+vendordetails[0]['language']['vendorname']+" salon is confirmed";
									// let CountryCode = ans.data[0].countrycode;
									// let NewMobileNumber = MobileNumber.replace("+" + CountryCode, "");
									// var urlSendSMS = `${SMS.url}?user=${SMS.user}&pwd=${SMS.pwd}&senderid=${SMS.sid}&CountryCode=${CountryCode}&msgtext=${MsgContent}&mobileno=${NewMobileNumber}`;
									// console.log(urlSendSMS);
					
									// request({
									// 	url: urlSendSMS,
									// 	method: "GET",
									// }, function(error, response, body){
									// 	if(error) {
									// 		console.log( "Errrrorrr" , error);
									// 	} else {
									// 		console.log("Response Status & body " , response.statusCode, body);
									// 	}
									// });	

									let obj = {};
									obj.msg = {"en": `${ans.data[0].firstname +" "+ans.data[0].lastname} new booking ${ctx.params.service_date}`};
									obj.userkey = res.data[0].vendorkey;
									obj.heading = {"en": "new booking added"};
									let notObj = {
										title: JSON.stringify(obj.heading),
										content: JSON.stringify(obj.msg),
										isdelivered: 1,
										userid: ctx.params.vendorid,
										usertype: "vendor"
									}
									notifiction.sendAdmin(obj).then((r) => {
										console.log('----',r)
										r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
										notifiction.saveNotification(ctx,notObj);
									});
								});
							});
							return this.requestSuccess("Your Service Booked Successfully", final_val);
						})
					// }
				// })
				// .catch((err) => {
				// 	return this.requestError(err)
				// })
			})
            .catch((err)=>{
                return this.requestError(err);
            })
        }
        else {
            var dt = dateTime.create();
            var formatted = dt.format('Y-m-d');
            return Uservoucher.findOne(ctx,{ query: {
                voucherid: ctx.params.voucherid,
                status: 1,
                startdate: {
                    [Op.lte]: formatted
                },
                enddate:{
                    [Op.gte]: formatted
                },
                userid: ctx.params.customerid,
            }
            })
            .then(async (res)=>{
                if(res.data.isused == 0) {

                        var actualrate = 0 , vatamt = 0 , totalcost = 0 ,sercost = 0, packcost = 0;
                        if(ctx.params.serviceid) {
                                sercost = await serv_cost(ctx, ctx.params.serviceid);
                        }
                        if(ctx.params.packageid){
                                packcost = await pack_cost(ctx, ctx.params.packageid);
                        }
                        var vatval = await vat_val(ctx, ctx.params.vendorid);
                        var subcost =  sercost + packcost;
                    if(res.data.mincartvalue <= subcost){
                        if(res.data.vouchertype == 1) {
                            actualrate = subcost - res.data.vouchervalue;
                            vatamt =  (actualrate/100) * vatval;
                            totalcost =  actualrate + vatamt;
                        }
                        else if(res.data.vouchertype == 2) {
                            var temp_var = (subcost/100) * res.data.vouchervalue;
                            actualrate = subcost - temp_var;
                            vatamt =  (actualrate/100) * vatval;
                            totalcost =  actualrate + vatamt;
                        }
                        var cat_str = ctx.params.categoryid.toString();
                        var serv_str = ctx.params.serviceid.toString();
                        return Booking.insert(ctx, {
                            bookingno: this.randombookingnum(),
                            vendorid: ctx.params.vendorid,
                            customerid: ctx.params.customerid,
                            service_date: ctx.params.service_date,
                            service_time: ctx.params.service_time,
                            subtotal: ctx.params.subtotal,
                			actualrate: ctx.params.actualrate,
                            servicerate: ctx.params.servicerate,
                			vat_percent: ctx.params.vat_percent,
                			vat_amount: ctx.params.vat_amount,
                			totalcost: ctx.params.totalcost,
                            mincartvalue: res.data.mincartvalue,
                            voucher_code: res.data.vouchercode,
                            voucher_type: res.data.vouchertype,
                            discountvalue: res.data.vouchervalue,
                            payment_method: ctx.params.payment_method,
                            devicetype: ctx.params.devicetype,
                            devicetoken: ctx.params.devicetoken,
                            booking_status: 2,
                            categoryid: cat_str,
                            staffid: ctx.params.staffid,
                            serviceid: serv_str
                        })
                        .then(async(result)=>{
							// ctx.call("payment.completepayment",{eid:ctx.params.eid,checkoutid:ctx.params.checkoutid,bookingid:result.data.id,transactionkey:ctx.params.transactionkey})
							// .then(async (res) => {
							// 	if(res.data) {
									Uservoucher.updateBy(ctx, 1, {
										isused: 1
									},{query:{
										voucherid: ctx.params.voucherid,
										userid: ctx.params.customerid
									}})
									var hot_detail = [];
									await vendor.find(ctx, { query: {
										id: ctx.params.vendorid,
									} })
									.then(async (res) => {
										delete res.data[0]["password"];

										var arr = res.data;
										let language_val12 = await vendorlang.find(ctx, { query: {vendorid: ctx.params.vendorid}})
										.then((lan_res)=>{
											res.data[0]['language'] = lan_res.data;
										})
										hot_detail.push(res.data[0]);
									});
									var hotel_str = JSON.stringify(hot_detail);
									User_filt.find(ctx, { query: { id: ctx.params.customerid  }
									})
									.then(async (ans)=>{
										var fin_val = JSON.stringify(ans.data);
										Staff.find(ctx, { query: { id: ctx.params.staffid  }
										})
										.then((response)=>{
											var staff_val = JSON.stringify(response.data);
											Booking.updateBy(ctx, 1, {
												customerdetails:fin_val,
												vendor_details:hotel_str,
												staff_details: staff_val
											}, { query: {
												id: result.data.id
											}
											});
										})
									})
									var serv_arr = ctx.params.serviceid;
									var BookingIte = await serv_arr.map((service,index) => {
										var wherecon = {
											id: service.serviceid,
											status:1
										}
										Service.find(ctx, {filter:['id','vendorid', 'categoryid','availability', 'tax', 'service_staff','photopath','image_url'],query:wherecon})
										.then((resp)=>{
											var jim = [];
											resp.data.map(async(item)=>{

												let ServiceListlang = await db.sequelize.query('EXEC SP_serv_lang :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT})
												let ServiceListprice = await db.sequelize.query('EXEC SP_serv_price :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT})
												item['language'] = ServiceListlang;
												item['price'] = ServiceListprice;
												jim.push(item);
												if(jim.length == resp.data.length){
													var serv_str = JSON.stringify(jim);
													return Bookingtime.insert(ctx,{
														bookingid: result.data.id,
														service_id: item.id,
														service_date: service.service_date,
														service_time: service.service_time,
														service_details: serv_str,
														status:1
													}).then((res) => {
														//console.log('bookin time rea',res);
													}).catch((err) => {
														// console.log('Booking time error',err);
														return this.requestError(err);
													});
												}
											})
										})

									})
									return Promise.all(BookingIte).then(async () => {
										if(ctx.params.categoryid.length > 0){
											var cat_arr = ctx.params.categoryid;
											var wherecat = {
												id: cat_arr,
												status:1
											}
											Category.find(ctx, {filter:['id','categorykey', 'photopath','status', 'created_by', 'created_at', 'image_url'],query:wherecat})
											.then((resp)=>{
												var jim = [];
												resp.data.map(async(item)=>{
													let CategoryListlang = await db.sequelize.query('EXEC SP_categorylang :categoryid',{replacements: {categoryid: item.id},type: Sequ.QueryTypes.SELECT})
													item['language'] = CategoryListlang;
													jim.push(item);
													if(jim.length == resp.data.length){
														var cat_str = JSON.stringify(jim);
														Booking.updateBy(ctx, 1, {
															category_details: cat_str
														}, { query: {
															id: result.data.id
														}
														})
													}
												})
											})
											.catch((err)=>{
												return this.requestError(err);
											})
										}
										var vendordetails = [];
										var final_val = {};
										let vendordata = await vendor.find(ctx, { query: {
											id: ctx.params.vendorid,
										} })
										.then(async (res) => {
											delete res.data[0]["password"];
											var arr = res.data;
											let language_val12 = await vendorlang.findOne(ctx, { filter:['vendorname'],query: {vendorid: ctx.params.vendorid,languageid: ctx.options.parentCtx.params.req.headers.language}})
											.then((lan_res)=>{
												res.data[0]['language'] = lan_res.data;
											});
											vendordetails.push(res.data[0]);
											await sleep(2000)
											let servData = await Bookingtimefilt.find(ctx, {query: {bookingid:result.data.id,status:1}}).then((re) => {

												return re;
											});
											if(servData.data.length) {
												var serviceDetailArr = [];
												servData.data.map((service,i) => {
													let obj = {};
													const serv = JSON.parse(service.service_details);
													serv.map((service)=>{
														var serv_lan = [];
														service.language.map((val)=>{
															if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
																serv_lan.push(val);
															}
														})
														if(serv_lan.length > 0){
															service.language = serv_lan[0];
														}
														else {
															service.language = {};
														}
													})
													obj['service_id'] = service.service_id;
													obj['service_date'] = service.service_date;
													obj['service_time'] = service.service_time;
													obj['status'] = service.status;
													obj['service_details'] = serv;
													serviceDetailArr.push(obj);
												})
												final_val['service_details'] = serviceDetailArr;
											}
											final_val['vendor_name'] = vendordetails[0]['language']['vendorname'];
											final_val['image_url'] = vendordetails[0]['image_url'];
											final_val['bookingid'] = result.data.bookingno;
											final_val['bookingDetails'] = result.data;
											User_filt.find(ctx, { query: { id: ctx.params.customerid  }
											})
											.then(async (ans)=>{
												console.log(`
													-----------------
													${JSON.stringify(ans)}
													-----------------
												`)
												const qrString = `https://lamsat.app/bookingdetails/${result.data.id}`;
												const bufferImage = await qrcode.toDataURL(qrString,qrOption);
												console.log(bufferImage);
												const uploadDir = `${global.appRoot}/src/app/common/controllers/__uploads`;
												const QRFileName = `QR-${result.data.bookingno}.png`;
												var base64Data = bufferImage.replace(/^data:image\/png;base64,/, "");
												fs.writeFile(`${uploadDir}/${QRFileName}`, base64Data, 'base64', function(err) {
													console.log('file write error',err);
												});
												const URL = url.url;
												const LOGO = `${URL}logo.png`;
												const QRLink = `${URL}${QRFileName}`;
												const b_date = moment(vendordetails[0]["created_at"]).format('L');
												const b_time = moment(vendordetails[0]["created_at"]).format('LT');
												const map_location = `https://maps.google.com/?q=${vendordetails[0]['latitude']},${vendordetails[0]['longitude']}`
												var itemList = '<span>';
												if(itemArr && itemArr.length) {
													itemArr.map((item,i) => {
														let servDetailObj = JSON.parse(item.service_details);
														let servicename = servDetailObj[0]["language"][0].servicename;
														let serviceprice = servDetailObj[0]["price"][0].price;
														itemList +=	`
																<tr>
																	<td align="left">
																		${servicename}
																	</td>
																	<td align="right">
																		${serviceprice} SAR
																	</td>
																</tr>
														`;
													})
												}
												itemList += '</span>';
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
												readHTMLFile(mail_template + "/BookingEmail.html", function(err, html) {
													let template = handlebars.compile(html);
													let replacements = {
														logo: LOGO,
														saloon_name: vendordetails[0]['language']['vendorname'],
														saloon_image: vendordetails[0]['image_url'],
														saloon_address: vendordetails[0]['vendoraddress'],
														map_link: map_location,
														booking_date: b_date,
														booking_time: b_time,
														list: itemList,
														booking_id: result.data.bookingno,
														booking_cost: totcost,
														vat:vatamt,
														QRLink:QRLink,
														message12: "Your Booking Completed Successfully "
													};
													const htmlToSend = template(replacements);
													// this method call the mail service to send mail
													ctx.call("mail.send", {
														to: ans.data[0].email,
														subject: "Booking Details",
														html: htmlToSend
													}).then((res) => {
														return "Email send Successfully";
													})
												})
												console.log("11111111111111111111111111",hot_detail)
												let obj = {};
												obj.msg = {"en": `${ans.data[0].firstname +" "+ans.data[0].lastname} new booking`};
												obj.userkey = hot_detail[0].vendorkey;
												obj.heading = {"en": "new booking added"};
												let notObj = {
													title: JSON.stringify(obj.heading),
													content: JSON.stringify(obj.msg),
													isdelivered: 1,
													userid: ctx.params.vendorid,
													usertype: "vendor"
												}
												notifiction.sendAdmin(obj).then((r) => {
													console.log('----',r)
													r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
													notifiction.saveNotification(ctx,notObj);
												});
											})
											return this.requestSuccess("Your Service Booked Successfully", final_val);
										});
									})
							// 	}
							// })
							// .catch((err) => {
							// 	return this.requestError(err)
							// })
						})
                        .catch((err)=>{
                            return this.requestError(err);
                        })
                    }
                    else{
                        return "Not Enough Amount to use this Coupon";
                    }
                }
                else {
                    return "This coupon is already used by yourself";
                }
            })
            .catch((Err)=>{
                return this.requestError("Error Occurred",Err);
            })
        }
    },
    //Particular Booking list
    get: function(ctx) {
		let findbooking = {};
        findbooking['id'] = ctx.params.id ;
        findbooking['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Booking.find(ctx, { query: findbooking })
        .then( (res) => {
            const vend= JSON.parse(res.data[0].vendor_details);
            delete vend[0]["created_by"];
            delete vend[0]["created_at"];
            delete vend[0]["updated_by"];
            delete vend[0]["updated_at"];
			var ven_lan = [];
            vend[0].language.map((item)=>{
                if(item.languageid == ctx.options.parentCtx.params.req.headers.language) {
                    ven_lan.push(item);
                }
            });
            vend[0].language = ven_lan[0];
            res.data[0].vendor_details = vend[0];
            const cust = JSON.parse(res.data[0].customerdetails);
            res.data[0].customerdetails = cust[0];
			const cate = JSON.parse(res.data[0].category_details);

            if(cate !== null) {
                cate.map((category)=>{
                    var cat_lan = [];
                    category.language.map((val)=>{
                        if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
                            cat_lan.push(val);
                        }
                    })
                    if(cat_lan.length > 0){
                        category.language = cat_lan[0];
                    }
                    else {
                        category.language = {};
                    }
                })
            }
            res.data[0].category_details = cate;

            let findbooking = {};
        	findbooking['bookingid'] = ctx.params.id ;
        	findbooking['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
			return BookingtimefiltbyID.find(ctx, { query: findbooking }).then(async (da) => {
				// console.log('serv-----',da);
				let countryname = await CountryLang.find(ctx, { query: {countryid : vend[0].countryid, languageid:1} }).then(async (countrydata) => {
					res.data[0].countryname = countrydata.data.length ? countrydata.data[0].countryname : "";
					let cityname = await Citylang.find(ctx, { query: {cityid : vend[0].cityid, languageid:1} }).then(async (citydata) => {
						res.data[0].cityname = citydata.data.length ? citydata.data[0].cityname : "";
					});
				});
                const servicearr = da.data;
                let sar =  await servicearr.map(async (serviceData,j)=>{
                    const serv = JSON.parse(serviceData.service_details);
                    servicearr[j].services = serv;
                    var staff = JSON.parse(serviceData.staff_details)
                    console.log("serviceData",staff)
                    servicearr[j].staffname =  staff[0].firstname+" "+staff[0].lastname;
                });
				// const serv = JSON.parse(da.data[0].service_details);
				// let s = await serv.map(async (service,i)=>{
				// 	var serv_lan = [];
				// 	let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:service.service_staff}})
				// 	.then((resp)=>{
				// 		serv[i].staffname = `${resp.data[0].firstname} ${resp.data[0].lastname}`;
				// 	}).catch(err => console.log('err---',err));

				// 	service.language.map((val)=>{
				// 		if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
				// 			serv_lan.push(val);
				// 		}
				// 	})
				// 	if(serv_lan.length > 0){
				// 		service.language = serv_lan[0];
				// 	}
				// 	else {
				// 		service.language = {};
				// 	}
				// })
				return Promise.all(sar).then(() => {
					res.data[0].service_details = servicearr;
					return this.requestSuccess("Requested Booking", res.data);
				});
			});
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    // Booking list For admin
    getall: function(ctx) {
        let findbooking = {};
        findbooking['customerid'] = ctx.params.customerid;
		findbooking['status'] = 1; 
		findbooking['payment_status'] = { [Op.ne]: DELETE };
		console.log("1111111111111111111",findbooking)
        return Bookingfilt.find(ctx, { query: findbooking })
        .then(async (res) => {
            var arr = res.data;
            async function get_bookings(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    const vend= JSON.parse(arr[i].vendor_details);
                    delete vend[0]["created_by"];
                    delete vend[0]["created_at"];
                    delete vend[0]["updated_by"];
                    delete vend[0]["updated_at"];
                    var ven_lan = [];
                    vend[0].language.map((item)=>{
                        if(item.languageid == ctx.options.parentCtx.params.req.headers.language) {
                            ven_lan.push(item);
                        }
                    });
                    vend[0].language = ven_lan[0];
                    arr[i].vendor_details = vend[0];
                    const cust = JSON.parse(arr[i].customerdetails);
					arr[i].customerdetails = cust[0];

					let vendor_image = await Vendorimage.find(ctx,{ query: {vendorid:vend[0].id} })
					.then((res) => {
						arr[i]["vendor_images"] = res.data;
					});
					let isRating = await Review.find(ctx,{ query: {userid:ctx.params.customerid,vendorid:vend[0].id,status:1} }).then((r) => {
						if(r.data.length) {
							return true;
						} else {
							return false;
						}
					})
					arr[i]['israted'] = isRating;
					//console.log('---israted---',isRating);
                    /*
                    const cate = JSON.parse(arr[i].category_details);
                    cate.map((category)=>{
                        var cat_lan = [];
                        category.language.map((val)=>{
                            if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
                                cat_lan.push(val);
                            }
                        });
                        if(cat_lan.length > 0){
                            category.language = cat_lan[0];
                        }
                        else {
                            category.language = {};
                        }
                    });
                    arr[i].category_details = cate;
                    const staff_det = JSON.parse(arr[i].staff_details);
					arr[i].staff_details = staff_det[0];
                    */
					let servData = await Bookingtimefilt.find(ctx, {query: {bookingid:arr[i].id,status:1}});
					if(servData.data.length) {
						var serviceDetailArr = [];
						servData.data.map((service,i) => {
							let obj = {};
							const serv = JSON.parse(service.service_details);
							serv.map((service)=>{
								var serv_lan = [];
								service.language.map((val)=>{
									if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
										serv_lan.push(val);
									}
								})
								if(serv_lan.length > 0){
									service.language = serv_lan[0];
								}
								else {
									service.language = {};
								}
							})
							obj['service_id'] = service.service_id;
							obj['service_date'] = service.service_date;
							obj['service_time'] = service.service_time;
							obj['status'] = service.status;
							obj['service_details'] = serv;
							serviceDetailArr.push(obj);
						})
						arr[i].service_details = serviceDetailArr;
					}
                    final.push(arr[i]);
				}
                return final;
            }
            const vali =  get_bookings(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of Bookings", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //Booking delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Booking.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Booking.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            }).then((resp)=>{
                return this.requestSuccess("Your Booking has been successfully Deleted", ctx.params.id);
            })
        })

	},

	//Booking delete is used change the status and not complete delete
    cancel: function(ctx) {
        return  Booking.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Booking.updateBy(ctx, res.data.id, {
                status: 4
                }, { query: {
					id: ctx.params.id,
					canceledbyadmin: 0
                }
            }).then((resp)=>{
                return this.requestSuccess("Your Booking has been successfully canceled", ctx.params.id);
            })
        })

    },


    //Booking delete is used change the status and not complete delete
    dashboard: function(ctx) {
        return  Booking.find(ctx, { query: {
            booking_status: 3,
            customerid: ctx.params.id
        }
        })
        .then ((res1) =>{
            return Booking.find(ctx, { query: {
                booking_status: 2,
                customerid: ctx.params.id
            }
            }).then ((res2) =>{
                return Booking.find(ctx, { query: {
                    booking_status: 1,
                    customerid: ctx.params.id
                }
                }).then((res3) =>{
                    return Booking.find(ctx, { query: {
                        booking_status: 4,
                        customerid: ctx.params.id
                    }
                    }).then((res4) => {

                        var jsondata = {'Pending':res1.data.length,'Booked':res3.data.length,'Rejected':res2.data.length,'Cancel':res4.data.length}
                        return this.requestSuccess("Your Booking has been successfully Deleted",jsondata);
                    })
                })
            })



        })

    },

    activity_log: async function(ctx) {
        // let playersList = await sequelize12.query('EXEC SP_ActivityLog :searchmail',{replacements: {searchmail: ctx.params.name}, type: Sequ.QueryTypes.SELECT});
        // return this.requestSuccess("Booking Logs", playersList);
    },


    //Booking status
    update: function(ctx) {


        if(ctx.params.booking_status) {
			ctx.params['booking_status'] = ctx.params.booking_status
			ctx.params['canceledbyadmin'] = 0
            return Booking.updateBy(ctx, 1, ctx.params, { query: {
                id: ctx.params.id
            }
            })
            .then(async(res)=>{
				let Bookings = await Booking.find(ctx, { query: {id: ctx.params.id}}).then((res)=>{return res.data});
				var customer = Bookings.length ?  JSON.parse(Bookings[0].customerdetails) : "";
				let obj = {};
				obj.msg = {"en": `${customer.length ? customer[0].firstname +" "+customer[0].lastname : ""} booking was rejected`};
				obj.userkey = Bookings[0].bookingkey;
				obj.heading = {"en": "Booking Cancelled"};
				let notObj = {
					title: JSON.stringify(obj.heading),
					content: JSON.stringify(obj.msg),
					isdelivered: 1,
					userid: Bookings[0].vendorid,
					customerid: Bookings[0].customerid,
					usertype: "vendor"
				}
				notifiction.sendAdmin(obj).then((r) => {
					console.log('----',r)
					r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
					notifiction.saveNotification(ctx,notObj);
				});
                ctx.meta.log = "Booking Status Updated successfully by Customer";
                //activity.setLog(ctx);
                return this.requestSuccess("Status Changed");
            })
        }
        /*else {
            return Booking.updateBy(ctx, 1, ctx.params, { query: {
                id: ctx.params.id
            }
            })
            .then((res)=>{
                ctx.meta.log = "Booking Status Updated successfully by Admin";
                activity.setLog(ctx);
                return this.requestSuccess("Status Changed");
            })
        }*/
	},
	checkStaff: function (ctx) {
		return  Bookingtime.find(ctx, { query: {
			service_id: ctx.params.serviceid,
			service_date: ctx.params.service_date,
			staffid: ctx.params.staffid,
			service_time: ctx.params.service_time
			}
		})
		.then ((res) =>{
			if(res.data.length > 0) {
				return this.requestSuccess("Staff already alocated", false);
			} else {
				return this.requestSuccess("Staff not alocated", true);
			}

		})
		.catch( (err) => {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		});
	},

}

async function serv_cost(ctx, servid) {
    var subtotal = 0;
    if(servid.length > 0) {
		var servIDArr=[];
		servid.map(async (service,index) => {
			servIDArr.push(service.serviceid)
		});
        let wherecond = {
            serviceid: servIDArr,
            status: 1,
        };
        const costval = await Serviceprice.find(ctx,{query: wherecond})
        .then((response)=>{
            response.data.map((item)=>{
                subtotal = subtotal + parseInt(item.price);
			});
            return subtotal;
		});
        return costval;
    }
    else {
        return 0;
    }
}

async function pack_cost(ctx, packid) {
    var subtotal = 0;
    if(packid.length > 0) {
        let wherecond = {
            id: packid,
            status: 1,
        };
        const costval = await Package.find(ctx,{query: wherecond})
        .then((response)=>{
            response.data.map((item)=>{
                subtotal = subtotal + item.packagecost;
            });
            return subtotal;
        });
        return costval;
    }
    else {
        return 0;
    }
}

async function vat_val(ctx, vendorid) {
    if(vendorid) {
        let wherecond = {
            id: vendorid,
            status: 1
        };
        const vatval =  await vendor.find(ctx, {query: wherecond})
        .then((resp)=>{
            return resp.data[0].vat;
        });
        return vatval;
    }
}
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
