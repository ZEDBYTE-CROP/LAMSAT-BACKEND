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
const Op = require('sequelize').Op;
const Sequ = require("sequelize");
const Vendortiming = require("../../../helpers/vendortiming");
const moment = require("moment");
const db = require('../../../adapters/db');
//database connections for store Procedures (admin review list api)


//Models
const Booking = new Database("Tbooking");
const Bookingtime = new Database("Tbookingtime");
const Staff = new Database("Mvendorstaff");
const Stafflang = new Database("Mvendorstafflang");
const Staffhours = new Database("Mvendorstaffhours");
const Staffservice = new Database("Mvendorstaffservice");
const vendorlang = new Database("Mvendorlang");
const vendor = new Database("Mvendor");
const Servicelangfilt = new Database("Mservicelang",[
    "id",
    "servicelangkey",
    "vendorid",
    "serviceid",
    "languageid",
    "langshortname",
    "servicename",
    "description",
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
    "isreview",
    "created_by",
    "created_at"
]);
const Service = new Database("Mservice");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation adminstaff
 * @permission create,update,remove,status
 * @whitelist  getall,get,getall_mob,getall_service
 */
module.exports = {

    // Staff creation
    create: async function(ctx) {
        return Staff.find(ctx, { query: {
            [Op.or]: [
                { email: ctx.params.email, },
                //{ contactnumber: ctx.params.contactnumber }
              ],
            vendorid: ctx.params.vendorid,
            status: 1
        }})
        .then(async(res)=>{
            if(res.data.length === 0) {
				let serv_id;
				if(ctx.params.serviceid) {
					serv_id = ctx.params.serviceid.toString();
				}
                return Staff.insert(ctx, {
                    vendorid: ctx.params.vendorid,
                    email: ctx.params.email,
                    contactnumber: ctx.params.contactnumber,
                    employee_startdate: ctx.params.employee_startdate ? ctx.params.employee_startdate : '2020/1/1',
                    employee_enddate: ctx.params.employee_enddate,
                    serviceid: serv_id ? serv_id : null,
                    photopath: ctx.params.photopath,
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    staff_title: ctx.params.staff_title,
                    notes: ctx.params.notes,
					image_url: ctx.params.image_url,
					status: ctx.params.status
                })
                .then(async(res) => {
					if( ctx.params.serviceid) {
						ctx.params.serviceid.map(async(serv)=>{
							let serv_det = await Service.findOne(ctx,{query: {
								id: serv
							}})
							var temp = serv_det.data.service_staff;
							if(temp != null){
								var temp_arr = temp.split(",");
								var stf_id  = res.data.id.toString();
								if(temp_arr.includes(stf_id) != true){
									temp_arr.push(stf_id);
									var jam = temp_arr.toString();
									Service.updateBy(ctx, 1, {
										service_staff: jam
										}, { query: {
											id: serv
										}
									})
								}
							}
						});
                    }
                var vendorupdate = await vendor.find(ctx, { query: {id: ctx.params.vendorid} })
					.then(async(res)=> {
                        if(res.data.length)
                        {
                            await vendor.updateBy(ctx, 1, {
                                isstaffaccepted: 1
                            }, { query: {
                                id:res.data[0].id
                            }
                            });
                        }
                    })
                   return this.requestSuccess("Vendor Staff Successfly Created");
                })
            }
            else {
                ctx.meta.username = ctx.params.email;
                ctx.meta.log = 'Create Staff failed with same email or Phone';
                //activity.setLog(ctx);
                return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
        })
        .catch( (err) => {
            if (err.name === 'Database Error' && Array.isArray(err.data)){
                if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                    return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);
        });
	},
	getall_service: function (ctx) {
		let findshift = {};
        if(ctx.params.vendorid) {
            findshift['vendorid'] = ctx.params.vendorid;
		}
		if(ctx.params.date) {
			findshift['day'] = {[Op.eq] : [
				ctx.params.date
			]}
		}
		findshift['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		let time = moment(ctx.params.time, "h:mm A").format("HH:mm");
		console.log('time-----',time)
		return Staffhours.find(ctx, { query:
			{
				[Op.and]: [
					{ endtime: {[Op.gt]: time} },
					{ starttime: {[Op.lte]: time} }
				],
				status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
				vendorid: ctx.params.vendorid,
				day:ctx.params.date
			}
		})
        .then( async (res) => {
			//console.log('------',res)
            let staffData;
            if(res.data.length) {
				var staffarr = [];
                staffData = res.data.map(async (d,i) => {
					staffarr.push(d.vendorstaffid);
				});
				let bookingData = await Booking.find(ctx,{query:{vendorid:ctx.params.vendorid,status:{[Op.ne]:DELETE},payment_status:{[Op.ne]:DELETE}}}).then((res) => {return res.data})
				if(bookingData.length) {
					return Promise.all(staffData).then((re) => {
						//return this.requestSuccess('Staff found!',res);
						//console.log('starr----',staffarr)
						var unBookedStaffArr=[]
						let isBookingStaff = staffarr.map((id,i) => {
							return Bookingtime.find(ctx,{query:{
								staffid:id,
								service_time:time,
                                service_date:ctx.params.date,
                                payment_status:{[Op.ne]:DELETE}
							}})
							.then(async (bires) => {
								if(bires.data.length) {
									console.log('booked staff------',bires.data)
								} else {
									unBookedStaffArr.push(id);
								}
							})
							.catch((err) => console.log('--bookingitemerr',err))
						})
						return Promise.all(isBookingStaff).then((n) => {
							var arr = [];
							let staffArrData = unBookedStaffArr.map(async (d,i) => {
								let staffname = await Staff.find(ctx,{query: {id: d,status:{ [Op.ne]: DELETE }}}).then((res) => {return res});
								let staff = staffname.data[0];
                                if(staff) {
                                    arr.push(staff);
                                }
							});
							return Promise.all(staffArrData).then((r) => {
								async function get_staff(ctx, arr) {
									let final = [];
									for(var i = 0;i<arr.length;i++) {
										let wherecond = {
											languageid: ctx.options.parentCtx.params.req.headers.language ?ctx.options.parentCtx.params.req.headers.language : 1,
											serviceid: [ctx.params.serviceid],
											status: 1
										};
										let service_lan = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
										.then((resp)=>{
											arr[i]["service"] = resp.data;
											return arr[i];
										})
										final.push(service_lan);
									}
									return final;
								}
								const vali =  get_staff(ctx,arr);
								return vali.then((resy)=>{
									return this.requestSuccess('Staff found!',resy);

								})
							})
						})
					});
				} else {
					var arr = [];
					let staffData = staffarr.map(async (d,i) => {
						let staffname = await Staff.find(ctx,{query: {id: d}}).then((res) => {return res});
						let staff = staffname.data[0];
						arr.push(staff);
					});
					return Promise.all(staffData).then((r) => {
						async function get_staff(ctx, arr) {
							let final = [];
							for(var i = 0;i<arr.length;i++) {
								let wherecond = {
									languageid: ctx.options.parentCtx.params.req.headers.language ?ctx.options.parentCtx.params.req.headers.language : 1,
									serviceid: [ctx.params.serviceid],
									status: 1
								};
								let service_lan = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
								.then((resp)=>{
									arr[i]["service"] = resp.data;
									return arr[i];
								})
								final.push(service_lan);
							}
							return final;
						}
						const vali =  get_staff(ctx,arr);
						return vali.then((resy)=>{
							return this.requestSuccess('Staff found!',resy);

						})
					})
				}
			} else {
				return this.requestSuccess(res);
			}
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

	getall_service_timeslot: async function (ctx) {
        console.log("data")
    },

	getall_service_old: function(ctx) {
        let findstaff = {};
        if(ctx.params.vendorid) {
            findstaff['vendorid'] = ctx.params.vendorid;
        }
        findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Staff.find(ctx, { query: findstaff })
        .then( (res) => {
            var arr = res.data;
            async function get_staff(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let wherecond = {
                        languageid: ctx.options.parentCtx.params.req.headers.language,
                        serviceid: [ctx.params.serviceid],
                        status: 1
                    };
                    let service_lan = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
                    .then((resp)=>{
                        arr[i]["service"] = resp.data;
                        return arr[i];
                    })
                    final.push(service_lan);
                }
                return final;
            }
            const vali =  get_staff(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Staff found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
    // Staff List based on vendor
    getall: function(ctx) {
        // let findstaff = {};
        // if(ctx.params.vendorid) {
        //     findstaff['vendorid'] = ctx.params.vendorid;
        // }

        // findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		// return Staff.find(ctx, { query: findstaff })
		const languageid = ctx.options.parentCtx.params.req.headers.language;
        let QUERY =``;
        if(ctx.params.vendorid) {
			QUERY = `select mvendorstaff.*, mvendorlang.languageid,  mvendorlang.vendorname from mvendorstaff
			left join
			mvendor on mvendorstaff.vendorid = mvendor.id
			left join
			mvendorlang on mvendorlang.vendorid = mvendor.id and mvendorlang.languageid = ${languageid}
            where mvendor.id = ${ctx.params.vendorid} and mvendorstaff.status != 2 and mvendorstaff.lastname != 'Preference'
            order by mvendorstaff.id desc`;
        } else {
            QUERY = `select mvendorstaff.* from mvendorstaff left join
            mvendor on mvendorstaff.vendorid = mvendor.id
            where mvendorstaff.status = ${ctx.params.status ? ctx.params.status : 1} and  mvendor.isaccepted = 1 and mvendor.status != 2 and mvendorstaff.status !=2 and mvendorstaff.lastname != 'Preference'
            order by mvendorstaff.id desc`;
        }
        return db.sequelize.query(QUERY)
        .then( (res) => {
            console.log(res[0])
            var arr = res[0];
            //var arr = res.data;
            async function get_staff(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
					let ser_staff =[];
					if(arr[i].serviceid) {
						ser_staff = arr[i].serviceid.split(",");
                    	arr[i]["serviceid"] = ser_staff;
					}
                    let wherecond = {
                        languageid: ctx.options.parentCtx.params.req.headers.language,
                        serviceid: ser_staff,
                        status: 1
                    };
                    let service_lan = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
                    .then((resp)=>{
                        arr[i]["service"] = resp.data;
                        return arr[i];
                    })
                    let vendor_lan = await vendorlang.find(ctx, {filter: ['id', 'languageid', 'vendorid', 'vendorname', 'status'],query: {languageid:ctx.options.parentCtx.params.req.headers.language,vendorid:arr[i].vendorid}})
                    .then((vendorresp)=>{
                        arr[i]["vendor_details"] = vendorresp.data;
                        return arr[i];
                    })
                    final.push(service_lan);
                }
                return final;
            }
            const vali =  get_staff(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Staff found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },



    // Staff List based on vendor
    getalltime: function(ctx) {
        let findstaff = {};
        if(ctx.params.vendorid) {
			findstaff['vendorid'] = ctx.params.vendorid;
        }
		findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		findstaff['email'] = {[Op.ne]:'nopreference@lamsta.com'};
        return Staffhours.find(ctx, { query: findstaff })
        .then( (res) => {
            var arr = res.data;
            console.log('------------------------------------');
            console.log('arr' , arr);
            console.log('------------------------------------');
            //const vali =  get_staff(ctx,arr);
           // return vali.then((resy)=>{
                return this.requestSuccess('Staff found!',arr);

           // })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    getall_mob: function(ctx) {
        let findstaff = {};
        if(ctx.params.vendorid) {
            findstaff['vendorid'] = ctx.params.vendorid;
        }
        findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Staff.find(ctx, { query: findstaff })
        .then( (res) => {
            var arr = res.data;
            async function get_staff(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let ser_staff = arr[i].serviceid.split(",");
                    arr[i]["serviceid"] = ser_staff;
                    let wherecond = {
                        languageid: ctx.options.parentCtx.params.req.headers.language,
                        serviceid: ser_staff,
                        status: 1
                    };
                    let service_lan = await Servicelangfilt.find(ctx, {filter: ['servicename'],query: wherecond})
                    .then((resp)=>{
                        var temp_arr = [];
                        resp.data.map((item)=>{
                            temp_arr.push(item.servicename);
                        })
                        arr[i]["service"] = temp_arr;
                        return arr[i];
                    })
                    final.push(service_lan);
                }
                return final;
            }
            const vali =  get_staff(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Staff found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //Particular Staff list
    get: function(ctx) {
        let findstaff = {};
        findstaff['id'] = ctx.params.id;
        findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Staff.find(ctx, { query: findstaff })
        .then( (res) => {
            var arr = res.data;
            async function get_staff(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let ser_staff = arr[i].serviceid.split(",");
                    arr[i]["serviceid"] = ser_staff;
                    let wherecond = {
                        languageid: ctx.options.parentCtx.params.req.headers.language,
                        serviceid: ser_staff,
                        status: 1
                    };
                    let service_lang = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
                    .then((resp)=>{
                        arr[i]["service"] = resp.data;
                        return arr[i];
                    })

                    // let price_option = await Staffservice.find(ctx, { filter: ['serviceid'],query: {vendorstaffid: arr[i].id}})
                    // .then((lan_res)=>{
                    //     var arry = [];
                    //     lan_res.data.map((item)=>{
                    //         arry.push(item.serviceid);
                    //     })
                    //     let wherecond = {
                    //         languageid: ctx.options.parentCtx.params.req.headers.language,
                    //         serviceid: arry,
                    //         status: 1
                    //     };
                    //     return Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
                    //     .then((resp)=>{
                    //         arr[i]["service"] = resp.data;
                    //         return arr[i];
                    //     })

                    // });

                    // let service_staff = await Staffhours.find(ctx, { filter: ['id', 'vendorstaffid', 'day', 'starttime', 'endtime', 'staffstatus', 'status'],query: {vendorstaffid: arr[i].id}})
                    // .then((lan_res)=>{
                    //     arr[i]["hours"] = lan_res.data;
                    //     return arr[i];
                    // });
                    final.push(service_lang);
                }
                return final;
            }
            const vali =  get_staff(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Staff found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

     //status updation
     status: function(ctx) {
        return  Staff.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Staff.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Status Changed", ctx.params.id);

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        });

    },
    //Staff update
    update: function(ctx) {
        // Condition to find whether already email and contact number exist or not
        let wherecond = {
            [Op.or]: [
                { email: ctx.params.email, },
                { contactnumber: ctx.params.contactnumber }
            ],
            status: 1,
            vendorid: ctx.params.vendorid,
            id: {[Op.ne]: ctx.params.id}
        };

        return Staff.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                let serv_id;
				if(ctx.params.serviceid) {
					serv_id = ctx.params.serviceid.toString();
				}
                Staff.updateBy(ctx, 1, {
                    vendorid: ctx.params.vendorid,
                    email: ctx.params.email,
                    contactnumber: ctx.params.contactnumber,
                    employee_startdate: ctx.params.employee_startdate,
                    employee_enddate: ctx.params.employee_enddate,
                    serviceid: serv_id ? serv_id : "" ,
                    photopath: ctx.params.photopath,
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    staff_title: ctx.params.staff_title,
                    notes: ctx.params.notes,
					image_url: ctx.params.image_url,
					status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    return this.requestSuccess("Staff Updated", ctx.params.email);
                })
            }
            else
            {
                return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
        })
        .catch( (err) => {
            if (err.name === 'Database Error' && Array.isArray(err.data)){
                if (err.data[0].type === 'unique' && err.data[0].field === 'first')
                    return this.requestError(CodeTypes.T1_FIRST_CONSTRAINT);
            }
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Review delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Staff.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Staff.updateById(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Staff Deleted", ctx.params.id);
    })

    }
}
