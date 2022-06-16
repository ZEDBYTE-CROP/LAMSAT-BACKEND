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
const Sequ = require("sequelize");
var dateTime = require('node-datetime');
const activity = require("../../../helpers/activitylog");

//Models

const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");
const Serviceprice = new Database("Mserviceprice");
const Servicestaff = new Database("Mservicestaff");
const Package = new Database("Mpackage");
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const Booking = new Database("Tbooking");
const Bookingsublist = new Database("Tbookingsublist");
const Bookingstatus = new Database("Mbookingstatus")
const Category = new Database("Mcategory");
const Categorylang = new Database("Mcategorylang");
const Staff = new Database("Mvendorstaff");
const Voucher = new Database("Mvoucher");
const Vendorvoucher = new Database("Mvendorvoucher");
const Uservoucher = new Database("Muservoucher");
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
    "status"
]);
const Bookingtimefilt = new Database("Tbookingtime",[
	"service_id",
	"service_date",
	"service_time",
	"service_details",
    "status",
    "staffid"
]);
const Settings = new Database("Msettings");
const db = require('../../../adapters/db');
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;
/**
 *
 * @annotation adminbooking
 * @permission create,update,remove,
 * @whitelist get,getall,booking_status
 */
module.exports = {

    // Booking creation
    create: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});

        if(!ctx.params.vouchercode){
            var sercost = await serv_cost(ctx, ctx.params.serviceid);
            var packcost = await pack_cost(ctx, ctx.params.packageid);
            var vatval = await vat_val(ctx, ctx.params.vendorid);
            var subcost =  sercost + packcost;
            var vatamt =  (subcost/100) * vatval;
            var totcost =   subcost + vatamt;
            var cat_str = ctx.params.categoryid.toString();
            var serv_str = ctx.params.serviceid.toString();
            return Booking.insert(ctx, {
                bookingno: this.randombookingnum(),
                vendorid: ctx.params.vendorid,
                customerid: ctx.params.customerid,
                service_date: ctx.params.service_date,
                service_time: ctx.params.service_time,
                subtotal: subcost,
                actualrate: subcost,
                vat_percent: vatval,
                vat_amount: vatamt,
                totalcost: totcost,
                payment_method: ctx.params.payment_method,
                devicetype: ctx.params.devicetype,
                devicetoken: ctx.params.devicetoken,
                booking_status: 1,   //1 -> confirmed,2 -> late cancelled,3 -> cancelled
                categoryid: cat_str,
                staffid: ctx.params.staffid,
                serviceid: serv_str
            })
            .then(async(result)=>{
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
                var wherecon = {
                    id: serv_arr,
                    status:1
                }
                Service.find(ctx, {filter:['id','vendorid', 'categoryid','availability', 'tax', 'service_staff','photopath', 'image_url'],query:wherecon})
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
                            Booking.updateBy(ctx, 1, {
                                service_details: serv_str
                            }, { query: {
                                id: result.data.id
                            }
                            });
                        }
                    })
                })
                if(ctx.params.categoryid.length > 0){
                    var cat_arr = ctx.params.categoryid;
                    var wherecat = {
                        id: cat_arr,
                        status:1
                    }
                    Category.find(ctx, {filter:['id','categorykey', 'photopath', 'image_url', 'status', 'created_by', 'created_at'],query:wherecat})
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

                ctx.meta.log = "Booking created successfully by Admin";
                activity.setLog(ctx);
                var vendordetails = [];
                return await vendor.find(ctx, { query: {
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
                    var final_val = {};
                    final_val['vendor_name'] = vendordetails[0]['language']['vendorname'];
                    final_val['image_url'] = vendordetails[0]['image_url'];
                    final_val['booking number'] = result.data.bookingno;
                    return this.requestSuccess("Your Service Booked Successfully", final_val);
                });
            })
            .catch((err)=>{
                ctx.meta.log = "Attempt to create new booking failed by Admin";
                activity.setLog(ctx);
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
                        if(res.data.mincartvalue <= ctx.params.subtotal){
                            var actualrate = 0 , vatamt = 0 , totalcost = 0 ,sercost = 0, packcost = 0;
                            if(ctx.params.serviceid) {
                                 sercost = await serv_cost(ctx, ctx.params.serviceid);
                            }
                            if(ctx.params.packageid){
                                 packcost = await pack_cost(ctx, ctx.params.packageid);
                            }
                            var vatval = await vat_val(ctx, ctx.params.vendorid);
                            var subcost =  sercost + packcost;
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
                                subtotal: subcost,
                                actualrate: actualrate,
                                vat_percent: vatval,
                                vat_amount: vatamt,
                                totalcost: totalcost,
                                mincartvalue: res.data.mincartvalue,
                                voucher_code: res.data.vouchercode,
                                voucher_type: res.data.vouchertype,
                                discountvalue: res.data.vouchervalue,
                                payment_method: ctx.params.payment_method,
                                devicetype: ctx.params.devicetype,
                                devicetoken: ctx.params.devicetoken,
                                booking_status: 3,
                                categoryid: cat_str,
                                staffid: ctx.params.staffid,
                                serviceid: serv_str
                            })
                            .then(async(result)=>{
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
                                var wherecon = {
                                    id: serv_arr,
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
                                            Booking.updateBy(ctx, 1, {
                                                service_details: serv_str
                                            }, { query: {
                                                id: result.data.id
                                            }
                                            });
                                        }
                                    })
                                })
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


                                ctx.meta.log = "Booking created successfully by Admin";
                                activity.setLog(ctx);
                                var vendordetails = [];
                                return await vendor.find(ctx, { query: {
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
                                    var final_val = {};
                                    final_val['vendor_name'] = vendordetails[0]['language']['vendorname'];
                                    final_val['image_url'] = vendordetails[0]['image_url'];
                                    final_val['booking number'] = result.data.bookingno;
                                    return this.requestSuccess("Your Service Booked Successfully", final_val);
                                });
                            })
                            .catch((err)=>{
                                ctx.meta.log = "Attempt to create new booking failed by Admin";
                                activity.setLog(ctx);
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
    getall: async function(ctx) {
		try {
			let languageid = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1;
        	let bookingList = await db.sequelize.query('EXEC SP_GetBookingForAdmin :languageid',{replacements: {languageid: languageid},type: Sequ.QueryTypes.SELECT})
			let res = JSON.parse(bookingList[0].details);
			return this.requestSuccess("List of Bookings", res);
		} catch(err) {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		}
    },
    // Booking list For admin
    getall_o: async function(ctx) {
		let findbooking = {};
		let commission = 0;
        findbooking['status'] = 1;
        findbooking['payment_status'] = {[Op.ne]: 2};
        if(ctx.params.customerid) {
            findbooking['customerid'] = ctx.params.customerid;
        }
        if(ctx.params.vendorid) {
			findbooking['vendorid'] = ctx.params.vendorid;
			commission = await Settings.find(ctx, {settingskey:'comissionpercentage'})
			.then( (res) => {
				return res.data[0].settingsvalue;
			});
        }
        if(ctx.params.bookingstatus) {
            findbooking['booking_status'] = ctx.params.bookingstatus;
		}

        return Booking.find(ctx, { query: findbooking })
        .then( (res) => {
            var arr = res.data;
            async function get_bookings(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    const vend= JSON.parse(arr[i].vendor_details);
                    delete vend[0]["created_by"];
                    delete vend[0]["created_at"];
                    delete vend[0]["updated_by"];
					delete vend[0]["updated_at"];
					if(ctx.params.vendorid) {
						let vprofit = arr[i].actualrate - (arr[i].actualrate * commission/100);
						arr[i].vendorproffit = vprofit;
					}

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
                    const cate = JSON.parse(arr[i].category_details);
                    if(cate !== null) {
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
                    }
                    arr[i].category_details = cate;
                    //const staff_det = JSON.parse(arr[i].staff_details);
                    //arr[i].staff_details = staff_det[0];

					let servData = await Bookingtimefilt.find(ctx, {query: {bookingid:arr[i].id,status:1}});
					if(servData.data.length) {
						var serviceDetailArr = [];
						let getSerData = servData.data.map(async (service,i) => {
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
							obj['staffid'] = service.staffid;
							obj['service_date'] = service.service_date;
							obj['service_time'] = service.service_time;
							obj['status'] = service.status;
							obj['service_details'] = serv;
							let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:service.staffid}})
                			.then((resp)=>{
								return resp;
							});
							obj['staffname'] = `${staffdata.data[0].firstname} ${staffdata.data[0].lastname}`
							serviceDetailArr.push(obj);
						})
						await sleep(1000)
						arr[i].service_details = serviceDetailArr;
					}
                    /*const serv = JSON.parse(arr[i].service_details);
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
                    arr[i].service_details = serv;*/
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
			return Bookingtimefilt.find(ctx, { query: findbooking }).then(async (da) => {
				// console.log('serv-----',da);
                const serv = JSON.parse(da.data[0].service_details);

                var serviceDetailArr = [];
                let getSerData = da.data.map(async (service,i) => {
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
                    obj['staffid'] = service.staffid;
                    obj['service_date'] = service.service_date;
                    obj['service_time'] = service.service_time;
                    obj['status'] = service.status;
                    obj['service_details'] = serv;
                    let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:service.staffid}})
                    .then((resp)=>{
                        return resp;
                    });
                    obj['staffname'] = `${staffdata.data[0].firstname} ${staffdata.data[0].lastname}`
                    serviceDetailArr.push(obj);
                })
                serv[0].service_time = da.data[0].service_time;
				let s = await serv.map(async (service,i)=>{
					var serv_lan = [];
					let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:da.data[0].staffid}})//service.service_staff
					.then((resp)=>{
						serv[i].staffname = `${resp.data[0].firstname} ${resp.data[0].lastname}`;
					}).catch(err => console.log('err---',err));

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
                return Promise.all(getSerData).then(() => {
				return Promise.all(s).then(() => {
                    res.data[0].service_details = serv;
                    res.data[0].newservice_details = serviceDetailArr;
					return this.requestSuccess("Requested Booking", res.data);
                });
            })
			});
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Booking status
    update: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
            ctx.meta.username = res.data.email;
        });


        if(ctx.params.booking_status == 1) {
            ctx.params['payment_status'] = 1
            return Booking.updateBy(ctx, 1, ctx.params, { query: {
                id: ctx.params.id
            }
            })
            .then((res)=>{
                ctx.meta.log = "Booking Status Updated successfully by Admin";
                activity.setLog(ctx);
                return this.requestSuccess("Status Changed");
            })
        }
        else {
            return Booking.updateBy(ctx, 1, ctx.params, { query: {
                id: ctx.params.id
            }
            })
            .then((res)=>{
                ctx.meta.log = "Booking Status Updated successfully by Admin";
                activity.setLog(ctx);
                return this.requestSuccess("Status Changed");
            })
        }
    },

    //Booking delete is used change the status and not complete delete
    remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Booking.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            if(res.data.booking_status == 3 && res.data.payment_status == 0){
                return Booking.updateBy(ctx, res.data.id, {
                    status: 2
                    }, { query: {
                        id: ctx.params.id
                    }
                }).then((resp)=>{
                    if(resp.data[0].voucher_code) {
                        var dt = dateTime.create();
                        var formatted = dt.format('Y-m-d');
                        Uservoucher.updateBy(ctx, 1, {
                            isused: 1
                        }, {
                            query:{
                                userid: resp.data[0].customerid,
                                vouchercode: resp.data[0].voucher_code,
                                startdate: {
                                    [Op.lte]: formatted
                                },
                                enddate:{
                                    [Op.gte]: formatted
                                }
                            }
                        })
                        ctx.meta.log = "Booking deleted.";
                        activity.setLog(ctx);
                        return this.requestSuccess("Your Booking has been successfully Deleted", ctx.params.id);
                    }
                })
            }
            else {
                return `Unable to delete Booking${res.data.bookingno}`;
            }
    })

    },

    activity_log: async function(ctx) {
        // let playersList = await sequelize12.query('EXEC SP_ActivityLog :searchmail',{replacements: {searchmail: ctx.params.name}, type: Sequ.QueryTypes.SELECT});
        // return this.requestSuccess("Booking Logs", playersList);
    },

    booking_status: function(ctx) {
        let findstatus = {};
        findstatus['status'] = 1;
        return Bookingstatus.find(ctx, { query: findstatus })
        .then( (res) => {
            return this.requestSuccess("Requested Booking Status list", res.data);
        })
        .catch( (err) => {

            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    earnings: async function(ctx) {
        // let earnings_obj = {};
        // let playersList = await sequelize12.query('EXEC sp_totalcustomerdiscount :customerid',{replacements: {customerid: ctx.params.customerid}, type: Sequ.QueryTypes.SELECT});
        // console.log("EEEEEEEEEEEEEEEEEEEEe",playersList[0]['total_customer_discount'])
        // earnings_obj['Total Earnings'] = playersList[0]['total_customer_discount'];

        // let playersList1 = await sequelize12.query('EXEC sp_customerdiscountlist :customerid',{replacements: {customerid: ctx.params.customerid}, type: Sequ.QueryTypes.SELECT});
        // earnings_obj['Total Earnings list'] = playersList1;

        // return this.requestSuccess("Total Earnings", earnings_obj);
    },

    earnings_list: async function(ctx) {

    }
}

async function serv_cost(ctx, servid) {
    var subtotal = 0;
    if(servid.length > 0) {
        let wherecond = {
            serviceid: servid,
            status: 1,
        };
        const costval = await Serviceprice.find(ctx,{query: wherecond})
        .then((response)=>{
            response.data.map((item)=>{
                subtotal = subtotal + item.price;
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
