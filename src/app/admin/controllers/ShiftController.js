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
const Sequ = require("sequelize");
const Vendortiming = require("../../../helpers/vendortiming");
const moment = require("moment");
const db = require('../../../adapters/db');
//Models

const Staff = new Database("Mvendorstaff");
const Shift = new Database("Mvendorstaffhours")
const Stafflang = new Database("Mvendorstafflang");
//const Staffhours = new Database("Mvendorstaffhours");
const Staffservice = new Database("Mvendorstaffservice");
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

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation adminshift
 * @permission create,update,remove,status
 * @whitelist getall,get,getall_mob
*/
module.exports = {

    // Shift creation
    create: async function(ctx) {
        var listDate = [];
        var startDate = ctx.params.startday;
        var endDate = ctx.params.endday;
        var dateMove = new Date(startDate);
        var strDate = startDate;
    
        while (strDate < endDate){
          var strDate = dateMove.toISOString().slice(0,10);
          listDate.push(moment(strDate).format('DD-MM-YYYY'));
          dateMove.setDate(dateMove.getDate()+1);
        };
  
        let shiftfunc = await listDate.map(async (dates)=>{
        let wherecond = {
        [Op.and]:[
            {vendorid: ctx.params.vendorid},
            {vendorstaffid: ctx.params.vendorstaffid},
            {day: dates},
        ],
        status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
        };
        let shiftCount = await Shift.count(ctx,wherecond);
        if(shiftCount.data < 1) {
        return Shift.find(ctx, { query: {
            [Op.or]: [
                { endtime: ctx.params.endtime, },
                { starttime: ctx.params.starttime }
            ],
            [Op.and]:[
                {vendorid: ctx.params.vendorid},
                {vendorstaffid: ctx.params.vendorstaffid},
                {day: dates},
            ],
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE }
        }})
        .then(async(res)=>{
            if(res.data.length === 0) {
            let statrttime = moment(ctx.params.starttime, "h:mm A").format("HH:mm");
            let endtime = moment(ctx.params.endtime, "h:mm A").format("HH:mm");
                        console.log(`-----${statrttime}---${endtime}`)
            return await Shift.insert(ctx, {
                vendorid: ctx.params.vendorid,
                vendorstaffid: ctx.params.vendorstaffid,
                day: dates,
                starttime: statrttime,
                endtime: endtime,
                status:1
            })
            .then( (res) => {
                //return this.requestSuccess("Shift Successfly Created");
                console.log("Shift Successfly Created");
            }).catch(err => console.log('insert error',err));
            }
            else {
                //console.log(`----${ctx.meta.log}-----`)
                ctx.meta.log = 'Create Shift failed with same date or time';
                //activity.setLog(ctx);
                //return this.requestError(CodeTypes.START_END_TIME_EXIST);
                console.log('Create Shift failed with same date or time')
            }
        })
        .catch( (err) => {
            return this.requestError(err);
        });
        } else {
                //return this.requestError(CodeTypes.MAX_SHIFT_EXCEED);
                console.log(CodeTypes.MAX_SHIFT_EXCEED)
        }
    }) 
    return Promise.all(shiftfunc).then(() => {
        return this.requestSuccess("Shift Successfly Created");
    });   
  },

    //Shift List based on vendor
    getall: function(ctx) {
        let findshift = {};
        if(ctx.params.vendorid) {
            findshift['vendorid'] = ctx.params.vendorid;
		}
		if(ctx.params.startdate) {
            findshift['day'] = ctx.params.startdate;
		}
		if(ctx.params.startdate && ctx.params.enddate) {
			findshift['day'] = {[Op.between] : [
				ctx.params.startdate,
				ctx.params.enddate
			]}
		}
        findshift['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        var QUERY;
        if(ctx.params.vendorid)
        {
            QUERY = `select vsh.* from mvendorstaffhours vsh left join mvendorstaff vs on
            vsh.vendorstaffid = vs.id 
                    where vsh.vendorid = ${ctx.params.vendorid}
                    and vs.status != 2`;
        }
        if(ctx.params.startdate && ctx.params.enddate) {
            var sday = moment(ctx.params.startdate,'DD-MM-YYYY').format('YYYY-MM-DD');
            var eday = moment(ctx.params.enddate,'DD-MM-YYYY').format('YYYY-MM-DD');
            QUERY = `select vsh.* from mvendorstaffhours vsh left join mvendorstaff vs on
            vsh.vendorstaffid = vs.id 
                    where (convert(date, vsh.day, 105) BETWEEN '${sday}' AND '${eday}') 
                    and vsh.status !=2 and vs.status != 2`;
        }
        if(ctx.params.vendorid && ctx.params.startdate && ctx.params.enddate) {
            var sday = moment(ctx.params.startdate,'DD-MM-YYYY').format('YYYY-MM-DD');
            var eday = moment(ctx.params.enddate,'DD-MM-YYYY').format('YYYY-MM-DD');
            QUERY = `select vsh.* from mvendorstaffhours vsh left join mvendorstaff vs on
            vsh.vendorstaffid = vs.id 
                    where vsh.vendorid = ${ctx.params.vendorid}
                    and (convert(date, vsh.day, 105) BETWEEN '${sday}' AND '${eday}') 
                    and vsh.status !=2 and vs.status != 2`;
        }
        
        //return Shift.find(ctx, { query: findshift })
        return db.sequelize.query(QUERY)
        .then( (res) => {
            let staffData;
            if(res[0].length) {
                staffData = res[0].map(async (d,i) => {
					let staffname = await Staff.find(ctx,{ filter: ['firstname', 'lastname'],query: {id: d.vendorstaffid}}).then((res) => {return res});
					let staff = staffname.data[0];
					d["stfaffname"] = `${staff.firstname} ${staff.lastname}`;
				});
				return Promise.all(staffData).then((re) => {
					return this.requestSuccess('Staff found!',res[0]);
				});
			} else {
				return this.requestSuccess(res[0]);
			}
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    // getall_mob: function(ctx) {
    //     let findstaff = {};
    //     if(ctx.params.vendorid) {
    //         findstaff['vendorid'] = ctx.params.vendorid;
    //     }
    //     findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
    //     return Staff.find(ctx, { query: findstaff })
    //     .then( (res) => {
    //         var arr = res.data;
    //         async function get_staff(ctx, arr) {
    //             let final = [];
    //             for(var i = 0;i<arr.length;i++) {
    //                 const split_image = arr[i].photopath.split("__uploads");
    //                 const image = split_image[1];
    //                 const slice_image = image.slice(1);
    //                 arr[i]['photopath'] = slice_image;

    //                 let ser_staff = arr[i].serviceid.split(",");

    //                 let wherecond = {
    //                     languageid: ctx.options.parentCtx.params.req.headers.language,
    //                     serviceid: ser_staff,
    //                     status: 1
    //                 };
    //                 let service_lan = await Servicelangfilt.find(ctx, {filter: ['servicename'],query: wherecond})
    //                 .then((resp)=>{
    //                     var temp_arr = [];
    //                     resp.data.map((item)=>{
    //                         temp_arr.push(item.servicename);
    //                     })
    //                     arr[i]["service"] = temp_arr;
    //                     return arr[i];
    //                 })
    //                 final.push(service_lan);
    //             }
    //             return final;
    //         }
    //         const vali =  get_staff(ctx,arr);
    //         return vali.then((resy)=>{
    //             return this.requestSuccess('Staff found!',resy);

    //         })
    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });

    // },

    //Particular Staff list
    // get: function(ctx) {
    //     let findstaff = {};
    //     findstaff['id'] = ctx.params.id;
    //     findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
    //     return Staff.find(ctx, { query: findstaff })
    //     .then( (res) => {
    //         var arr = res.data;
    //         async function get_staff(ctx, arr) {
    //             let final = [];
    //             for(var i = 0;i<arr.length;i++) {
    //                 const split_image = arr[i].photopath.split("__uploads");
    //                 const image = split_image[1];
    //                 const slice_image = image.slice(1);
    //                 arr[i]['photopath'] = slice_image;
    //                 let ser_staff = arr[i].serviceid.split(",");

    //                 let wherecond = {
    //                     languageid: ctx.options.parentCtx.params.req.headers.language,
    //                     serviceid: ser_staff,
    //                     status: 1
    //                 };
    //                 let service_lang = await Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
    //                 .then((resp)=>{
    //                     arr[i]["service"] = resp.data;
    //                     return arr[i];
    //                 })

    //                 // let price_option = await Staffservice.find(ctx, { filter: ['serviceid'],query: {vendorstaffid: arr[i].id}})
    //                 // .then((lan_res)=>{
    //                 //     var arry = [];
    //                 //     lan_res.data.map((item)=>{
    //                 //         arry.push(item.serviceid);
    //                 //     })
    //                 //     let wherecond = {
    //                 //         languageid: ctx.options.parentCtx.params.req.headers.language,
    //                 //         serviceid: arry,
    //                 //         status: 1
    //                 //     };
    //                 //     return Servicelangfilt.find(ctx, {filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'],query: wherecond})
    //                 //     .then((resp)=>{
    //                 //         arr[i]["service"] = resp.data;
    //                 //         return arr[i];
    //                 //     })

    //                 // });

    //                 // let service_staff = await Staffhours.find(ctx, { filter: ['id', 'vendorstaffid', 'day', 'starttime', 'endtime', 'staffstatus', 'status'],query: {vendorstaffid: arr[i].id}})
    //                 // .then((lan_res)=>{
    //                 //     arr[i]["hours"] = lan_res.data;
    //                 //     return arr[i];
    //                 // });
    //                 final.push(service_lang);
    //             }
    //             return final;
    //         }
    //         const vali =  get_staff(ctx,arr);
    //         return vali.then((resy)=>{
    //             return this.requestSuccess('Staff found!',resy);

    //         })
    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });
    // },

     //status updation
    // status: function(ctx) {
    //     return  Staff.findOne(ctx, { query: {
    //         id: ctx.params.id
    //     }
    //     })
    //     .then ((res) =>{
    //         Staff.updateBy(ctx, res.data.id, {
    //             status: ctx.params.status
    //             }, { query: {
    //                 id: ctx.params.id
    //             }
    //         })
    //         return this.requestSuccess("Status Changed", ctx.params.id);

    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else if (err instanceof MoleculerError)
    //             return Promise.reject(err);
    //         else
    //             return err;

    //     });

    // },
    //Staff update
    update: function(ctx) {

        let wherecond = {
            status: 1,
			day: ctx.params.day,
            id: ctx.params.id
        };

        return Shift.find(ctx, { query: wherecond })
        .then ((res) => {
			console.log('shift data',res);
            if (res.data.length > 0) {
                Shift.updateBy(ctx, 1, {
					starttime: ctx.params.starttime,
					endtime: ctx.params.endtime,
                }, { query: {
						id: ctx.params.id
                    }
                });
                return this.requestSuccess("Shift Updated",  ctx.params.day);

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

    //shift delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Shift.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Shift.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Shift Deleted", ctx.params.id);
    })

    }
}
