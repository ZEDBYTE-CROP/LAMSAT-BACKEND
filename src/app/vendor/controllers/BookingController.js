"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const moment = require('moment');
const Config = require("../../../../config");
const url = Config.get('/url');
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const mail_template = __dirname;
const handlebars = require('handlebars');
const Sequ = require("sequelize");
const db = require('../../../adapters/db');
const activity = require("../../../helpers/activitylog");
const notifiction = require("../../../helpers/pushnotification");
const Booking = new Database("Tbooking");
const Voucher = new Database("Mvoucher");
const Apptype = new Database("Mapptype");
const Vouchertype = new Database("Mvouchertype");
const Vendorvoucher = new Database("Mvendorvoucher");
const Uservoucher = new Database("Muservoucher");
const Vendorfilt = new Database("Mvendor");
const Vendorlangfilt = new Database("Mvendorlang");
const Citylang = new Database("Mcitylang");
const CountryLang = new Database("Mcountrylang");
const User = new Database("Muser");
const Staff = new Database("Mvendorstaff");
const Bookingstatus = new Database("Mbookingstatus",[
    "id",
    "bookingstatuskey",
    "bookingstatus",
    "status"
]);

const Bookingtimefilt = new Database("Tbookingtime",[
	"service_id",
	"service_date",
	"service_time",
	"service_details",
    "status",
    "staffid",
    "booking_status",
    "payment_method",
    "payment_status"
]);
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // Booking creation
    create: async function(ctx) {

    },
	// Booking list For admin
	getall: async function(ctx) {
		try {
			let languageid = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1;
			let bookingList = await db.sequelize.query('EXEC SP_GetBookingForVenor :languageid,:vendorid',{replacements: {languageid: languageid,vendorid: ctx.params.vendorid},type: Sequ.QueryTypes.SELECT})
			let res = JSON.parse(bookingList[0].details);
			return this.requestSuccess("List of Bookings", res);
		} catch(err) {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(err);
		}
	},
    getall_o: function(ctx) {
        let findbooking = {};
        findbooking['status'] = 1;
        findbooking['payment_status'] = {[Op.ne]: 2};
        if(ctx.params.customerid) {
            findbooking['customerid'] = ctx.params.customerid;
        }
        findbooking['vendorid'] = ctx.params.vendorid;
        if(ctx.params.bookingstatus) {
            findbooking['booking_status'] = ctx.params.bookingstatus;
        }
        return Booking.find(ctx, { query: findbooking })
        .then( (res) => {
            var arr = res.data;
            console.log('res.data' , res.data);
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
                    arr[i].category_details = cate === null ? [] : cate;
                    //const staff_det = JSON.parse(arr[i].staff_details);
                    //arr[i].staff_details = staff_det[0];

					let servData = await Bookingtimefilt.find(ctx, {query: {bookingid:arr[i].id,status:1}});
					if(servData.data.length) {
						var serviceDetailArr = [];
						servData.data.map(async (service,i) => {
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
                            obj['booking_status'] = service.booking_status;
                            obj['payment_method'] = service.payment_method;
                            obj['payment_status'] = service.payment_status;
							obj['service_details'] = serv;
							serviceDetailArr.push(obj);
							// let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:service.staffid}})
                			// .then((resp)=>{
							// 	return resp;
							// });
							// obj['staffname'] = `${staffdata.data[0].firstname} ${staffdata.data[0].lastname}`
                        })
                        let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:servData.data[0].staffid}})
                		.then((resp)=>{
							return resp;
                        });
                        if(staffdata.data.length>0)
                        {
                            serviceDetailArr[0]['staffname'] = `${staffdata.data[0].firstname} ${staffdata.data[0].lastname}`;
                        } else {
                            serviceDetailArr[0]['staffname'] = "";
                        }
						arr[i].service_details = serviceDetailArr;
					}
                    /*const chk = serv != null>0?serv.map((service)=>{
                        var serv_lan = [];
                        var servicdata = service.language.length>0? service.language.map((val)=>{
                            if(val.languageid == ctx.options.parentCtx.params.req.headers.language){
                                serv_lan.push(val);
                            }
                        }):'';
                        if(serv_lan.length > 0){
                            service.language = serv_lan[0];
                        }
                        else {
                            service.language = {};
                        }
                    }):''*/
                   // arr[i].service_details = serv;
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
    get: async function(ctx) {
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
				let s = await serv.map(async (service,i)=>{
					var serv_lan = [];
					let staffdata = await Staff.find(ctx, {filter:['id','firstname', 'lastname'],query:{id:service.service_staff}})
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
				return Promise.all(s).then(() => {
					res.data[0].service_details = serv;
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
                ctx.meta.log = "Booking Status Updated successfully";
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
                ctx.meta.log = "Booking Status Updated successfully";
                activity.setLog(ctx);
                return this.requestSuccess("Status Changed");
            })
        }
    },

    //Booking delete is used change the status and not complete delete
    remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
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
            })
            .then((resp)=>{
                ctx.meta.log = "Booking deleted.";
                activity.setLog(ctx);
                return this.requestSuccess("Your Booking has been successfully Deleted", ctx.params.id);
            })
        })

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

    booking_count: function(ctx){
        var booking_count = {};
        if(ctx.params.booking_status) {
            booking_count['booking_status'] = ctx.params.booking_status;
        }
        if(ctx.params.customerid){
            booking_count['customerid'] =  ctx.params.customerid;
        }
        if(ctx.params.status){
            booking_count['status']= ctx.params.status;
        }
        booking_count['vendorid'] =  ctx.params.vendorid;
        return Booking.count(ctx, booking_count)
        .then((res) => {
            return this.requestSuccess("Total Booking Count",res.data)
        })
    },

    updateBookingStatus: function(ctx){


        console.log('------------------------------------');
        console.log('ctx.params' , ctx.params);
        console.log('------------------------------------');
        var booking_count = {};

        booking_count['booking_status'] = ctx.params.status;
        return Booking.updateBy(ctx,1, booking_count, { query: {
            id: ctx.params.id
        }
        })
        .then(async(res)=>{
            ctx.meta.log = "Booking Status Updated successfully";
            console.log('------------------------------------');
            console.log('res' , res);
			console.log('------------------------------------');
			var BookingData = res.data[0];
			const b_date = moment(BookingData.created_at).format('L');
			const b_time = moment(BookingData.created_at).format('LT');
			const URL = url.url;
			const LOGO = `${URL}logo.png`;
			var Currentstatus = ctx.params.status == 1 ? 'Completed' : ctx.params.status == 2 ? 'Accepted' : ctx.params.status == 3 ? 'Rejected':'Completed';
			// Sending username and password to customers mail
            let user_data = res.data[0];
            let userid = user_data.customerid;
            let email;
            await User.findOne(ctx, { query: {id: userid} })
            .then( (res) =>{
                console.log(res)
                email = res.data.email
            })
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
			//Reads the html template,body of the mail content
			readHTMLFile(mail_template + "/BookingStatustemplate.html", function(err, html) {
					let template = handlebars.compile(html);
					let replacements = {
						booking_id: BookingData.bookingno,
						booking_date: b_date,
						booking_time: b_time,
						logo:LOGO,
						booking_cost: BookingData.totalcost,
						booking_status: Currentstatus,
						name: ctx.params.name,
						message12: "Booking Status Updated"
					};
					const htmlToSend = template(replacements);
				// this method call the mail service to send mail
				ctx.call("mail.send", {
					to: email,
					subject: "Booking Updated",
					html: htmlToSend
				})
            })

            let Bookings = await Booking.find(ctx, { query: {id: ctx.params.id}}).then((res)=>{return res.data});
            if(ctx.params.status == 2 || ctx.params.status == 3)
            {
                var customer = Bookings.length ?  JSON.parse(Bookings[0].customerdetails) : "";
                let obj = {};
                obj.msg = {"en": `${customer.length ? customer[0].firstname +" "+customer[0].lastname : ""} booking was rejected`};
                obj.userkey = Bookings[0].bookingkey;
                obj.heading = {"en": "booking rejected"};
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
            }
            if(ctx.params.status == 4)
            {
                var customer = Bookings.length ?  JSON.parse(Bookings[0].customerdetails) : "";
                let obj = {};
                obj.msg = {"en": `${customer.length ? customer[0].firstname +" "+customer[0].lastname : ""} booking was completed`};
                obj.userkey = Bookings[0].bookingkey;
                obj.heading = {"en": "booking completed"};
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
            }

            return this.requestSuccess("Status Changed" , res);
        })


        /*if(ctx.params.booking_status) {
            booking_count['booking_status'] = ctx.params.booking_status;
        }
        if(ctx.params.customerid){
            booking_count['customerid'] =  ctx.params.customerid;
        }
        if(ctx.params.status){
            booking_count['status']= ctx.params.status;
        }
        booking_count['vendorid'] =  ctx.params.vendorid;
        return Booking.count(ctx, booking_count)
        .then((res) => {
            return this.requestSuccess("Total Booking Count",res.data)
        })*/
	},

	updatePaymentStatus: function(ctx){

        console.log('------------------------------------');
        console.log('ctx.params' , ctx.params);
        console.log('------------------------------------');
        var booking_count = {};
        booking_count['payment_status'] = ctx.params.payment_status;
        return Booking.updateBy(ctx,1, booking_count, { query: {
            id: ctx.params.id
        }
        })
        .then(async(res)=>{
            let Bookings = await Booking.find(ctx, { query: {id: ctx.params.id}}).then((res)=>{return res.data});
            if(ctx.params.payment_status == 0)
            {
                var customer = Bookings.length ?  JSON.parse(Bookings[0].customerdetails) : "";
                let obj = {};
                obj.msg = {"en": `${customer.length ? customer[0].firstname +" "+customer[0].lastname : ""} booking amount refund`};
                obj.userkey = Bookings[0].bookingkey;
                obj.heading = {"en": "booking refund"};
                let notObj = {
                    title: JSON.stringify(obj.heading),
                    content: JSON.stringify(obj.msg),
                    isdelivered: 1,
                    userid: Bookings[0].vendorid,
                    usertype: "vendor"
                }
                notifiction.sendAdmin(obj).then((r) => {
                    console.log('----',r)
                    r.recipients ? notObj.isdelivered = 1 : notObj.isdelivered = 0
                    notifiction.saveNotification(ctx,notObj);
                });
            }
            ctx.meta.log = "Payment Status Updated successfully";
            console.log('------------------------------------');
            console.log('res' , res);
            console.log('------------------------------------');

            return this.requestSuccess("Status Changed" , res);
        })
    },
}
