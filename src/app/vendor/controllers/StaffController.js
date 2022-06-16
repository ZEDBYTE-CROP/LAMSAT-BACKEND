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
const db = require("../../../adapters/db");
const Sequ = require("sequelize");
const moment = require('moment');
const Vendortiming = require("../../../helpers/vendortiming");
const activity = require("../../../helpers/activitylog");

//Models

const Staff = new Database("Mvendorstaff");
const Stafflang = new Database("Mvendorstafflang");
const Staffhours = new Database("Mvendorstaffhours");
const Staffservice = new Database("Mvendorstaffservice");
const Stafftime =  new Database("Mvendorstaffhours");
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

module.exports = {

    // Staff creation
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
            ctx.meta.username = res.data.email;
        });
        return Staff.find(ctx, { query: {
            [Op.or]: [
                { email: ctx.params.email, },
                { contactnumber: ctx.params.contactnumber }
              ],
            vendorid: ctx.params.vendorid,
            status: 1
        }})
        .then((res)=>{
            if(res.data.length === 0) {
                let serv_id = ctx.params.serviceid.toString();
                return Staff.insert(ctx, {
                    vendorid: ctx.params.vendorid,
                    email: ctx.params.email,
                    contactnumber: ctx.params.contactnumber,
                    employee_startdate: '2020/1/1',
                    employee_enddate: ctx.params.employee_enddate,
                    serviceid: serv_id,
                    photopath: ctx.params.photopath,
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    staff_title: ctx.params.staff_title,
                    notes: ctx.params.notes,
					image_url: ctx.params.image_url,
					status: ctx.params.status !== null ? ctx.params.status : 1
                })
                .then( (res) => {
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
                    })
                    ctx.meta.log = "Vendor staff Added successfully";
                    activity.setLog(ctx);
                   return this.requestSuccess("Vendor Staff Successfly Created");
                })
            }
            else {
                ctx.meta.username = ctx.params.email;
                ctx.meta.log = 'Create Staff failed with same email or Phone';
                activity.setLog(ctx);
                return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
        })
        .catch( (err) => {
            ctx.meta.log = 'Create Staff failed';
            activity.setLog(ctx);
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

    getall: function(ctx) {
        let findstaff = {};
        findstaff['vendorid'] = ctx.params.vendorid;
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

    getallTime: function(ctx) {
        let findstaff = {};
        findstaff['vendorid'] = ctx.params.vendorid;
        findstaff['staffid'] = ctx.params.staffid;
        findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Stafftime.find(ctx, { query: findstaff })
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

	getAvailaleStaff: async function(ctx) {
		var slotArr = [], i, j;
		// for(i=0; i<24; i++) {
		// 	let istr = i.toString();
		// 	let h = (istr.length === 1) ? `0${i}` : i;
		// 	slotArr.push(h + ":00");
		//}

        // for(var hours = 0; hours < 24; hours++){
        //     for(var minutes = 0; minutes < 60; minutes = minutes+30){
        //           var h = '';
        //           var m = '';
        //           if(hours<10){
        //              h = '0' + hours;
        //           }else{
        //               h = hours;
        //           }
        //           if(minutes<10){
        //              m = '0' + minutes;
        //           }else{
        //               m = minutes;
        //           }
        //         slotArr.push(h + ':' + m);
        //     }
        // }
        var hours, minutes, ampm;
        for(var i = 600; i <= 1380; i += 30){
            hours = Math.floor(i / 60);
            minutes = i % 60;
            if (minutes < 10){
                minutes = '0' + minutes; // adding leading zero
            }
            slotArr.push(hours + ':' + minutes); 
        }
		let staff_list = await db.sequelize.query(
			`SELECT b.id,bi.staffid,bi.service_time,bi.service_date,vs.firstname
			FROM tbooking AS b
			JOIN tbookingtime AS bi
			ON b.id = bi.bookingid
			JOIN mvendorstaff as vs
			ON bi.staffid = vs.id
			AND bi.service_date = '${ctx.params.service_date}'
			WHERE b.vendorid = ${ctx.params.vendorid} and bi.staffid IS NOT NULL
			`
		);

        console.log(slotArr)
        console.log(staff_list)

        let Check_staff = await db.sequelize.query(
			`select * from mvendorstaffhours where vendorid = ${ctx.params.vendorid} and day = '${ctx.params.service_date}' and status = 1`
		);

            console.log(Check_staff[0])
        let Availabilty = [];
        let Unavailabilty = [];
        let accArr = await Check_staff[0].map(async(slotcheck)=>{
            await staff_list[0].map((bookingslotcheck)=>{
                if(moment(bookingslotcheck.service_time).format("HH:mm") > moment(slotcheck.starttime).format("HH:mm") &&
                moment(bookingslotcheck.service_time).format("HH:mm") < moment(slotcheck.endtime).format("HH:mm") 
                && slotcheck.vendorstaffid == bookingslotcheck.staffid
                )
                {
                    let avachecktest = staff_list[0].filter(sdata => moment(sdata.service_time).format("HH:mm") == moment(bookingslotcheck.service_time).format("HH:mm") 
                    && sdata.staffid != bookingslotcheck.staffid)
                    if(avachecktest.length)
                    {
                        if(Unavailabilty.length)
                        {
                            let unavaldum = !Unavailabilty.includes(moment(bookingslotcheck.service_time).format("HH:mm"))
                            if(unavaldum)
                            {
                                Availabilty.push(moment(bookingslotcheck.service_time).format("HH:mm"))
                            }
                        } else {
                            Availabilty.push(moment(bookingslotcheck.service_time).format("HH:mm"))
                        }
                    }
                } 
                else if(moment(bookingslotcheck.service_time).format("HH:mm") > moment(slotcheck.starttime).format("HH:mm") &&
                moment(bookingslotcheck.service_time).format("HH:mm") < moment(slotcheck.endtime).format("HH:mm")
                ){
                    let checktest = staff_list[0].filter(sdata => moment(sdata.service_time).format("HH:mm") == moment(bookingslotcheck.service_time).format("HH:mm") 
                    && sdata.staffid == slotcheck.vendorstaffid)
                    if(checktest.length === 0)
                    {
                        let dumval = Availabilty.filter(val => moment(bookingslotcheck.service_time).format("HH:mm") != val);
                        Unavailabilty.push(moment(bookingslotcheck.service_time).format("HH:mm"))
                        if(dumval.length)
                        {
                            Availabilty = dumval;
                        } else {
                            Availabilty = [];
                        }
                    }
                }
                else {
                    console.log("staffunavaliable")
                    //Availabilty.push(moment(bookingslotcheck.service_time).format("HH:mm"));
                }
            })
        });

		// let slotOccupaid = [];
		// let accArr = staff_list[0].map((time) => {
		// 	slotOccupaid.push(moment(time.service_time).format("HH:mm"));
        // })
        console.log("---------------",Availabilty)
		return Promise.all(accArr).then(() => {
            let Arr
            if(Check_staff[0].length)
            {
                Arr = slotArr.filter(val => !Availabilty.includes(val));
            } else {
                Arr = [];
            }
			return this.requestSuccess('Available slots',Arr);
		})

	},

    getall_mob: function(ctx) {
        let findstaff = {};
        findstaff['vendorid'] = ctx.params.vendorid;
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
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
            ctx.meta.username = res.data.email;
        });
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
            ctx.meta.log = "Vendor staff Status updated successfully";
            activity.setLog(ctx);
            return this.requestSuccess("Status Changed", ctx.params.id);

        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update Vendor staff failed";
            activity.setLog(ctx);
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
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
            ctx.meta.username = res.data.email;
        });
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
                let serv_id = ctx.params.serviceid.toString();
                Staff.updateBy(ctx, 1, {
                    vendorid: ctx.params.vendorid,
                    email: ctx.params.email,
                    contactnumber: ctx.params.contactnumber,
                    employee_startdate: '2020/1/1',
                    employee_enddate: ctx.params.employee_enddate,
                    serviceid: serv_id,
                    photopath: ctx.params.photopath,
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    staff_title: ctx.params.staff_title,
                    notes: ctx.params.notes,
					image_url: ctx.params.image_url,
					status: ctx.params.status !== null ? ctx.params.status : 1
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    ctx.meta.log = "Vendor staff Updated successfully";
                    activity.setLog(ctx);
                    return this.requestSuccess("Staff Updated", ctx.params.email);
                })
            }
            else
            {
                ctx.meta.log = "Vendor staff Update failed";
                activity.setLog(ctx);
                return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
        })
        .catch( (err) => {
            ctx.meta.log = "Vendor staff Update failed";
            activity.setLog(ctx);
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
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
            ctx.meta.username = res.data.email;
        });
        return  Staff.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Staff.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            ctx.meta.log = "Vendor staff removed successfully";
            activity.setLog(ctx);
            return this.requestSuccess("Review Deleted", ctx.params.id);
    })

    },


	staff_timeget: async function(ctx) {
        let findStaff = {};
        findStaff['vendorid'] = ctx.params.vendorid;

        return Stafftime.find(ctx,{ query: findStaff })
        .then((res)=>{
            var i;
            if (res.data.length === 0){
                var i = 0;
                //return this.requestError(CodeTypes.NOTHING_FOUND);
                var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                async function get_TimeLists() {
                    for(i=0; i<days.length;i++)
                    {
                     Stafftime.insert(ctx, {
                        vendorid: ctx.params.vendorid,
                        status: 1,
                        days: days[i],
                        starttime: '10:00',
                        endtime: '22:00',
                        status: 1,
                        staffstatus: 1
                    })
                     }
                    }
                const vali =  get_TimeLists();
                    return vali.then((resy)=>{
                        return Stafftime.find(ctx,{ query: findStaff })
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
                //return res.data;

                            return this.requestSuccess("List of Timing", res.data);
                        })
                    })

                //return this.requestError(CodeTypes.NOTHING_FOUND);
                }
            else
               {
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
				date.starttime = d1.format();
                date.endtime = d2.format();
            });
           // return this.requestSuccess("List of Timing", res.data);

            return res.data;
        }
        })
    },
}
