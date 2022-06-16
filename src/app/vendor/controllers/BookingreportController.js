"use strict";

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const moment = require('moment');
const db = require("../../../adapters/db");

//Models
const ActivityLog = new Database("Mactivitylog");
const Booking = new Database("Tbooking");
const Commission = new Database("Madmincommission");
const Settings = new Database("Msettings");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {
	// getAll: async function(ctx) {
	// 	var metadata = {};
	// 	var finalObj = {};
	// 	var finalArr = [];
	// 	var where ={};
	// 	const commission = await  Commission.find(ctx,{query:{status:1}}).then((res) => {
	// 		return res.data[0].commission;
	// 	});
	// 	var page = parseInt(ctx.params.skip);
	// 	var limit = parseInt(ctx.params.limit);
	// 	page = (page-1) * limit;
	// 	var start = moment(ctx.params.startdate,"DD/MM/YYYY");
	// 	var startDate = start.toDate();
	// 	var end = moment(ctx.params.enddate,"DD/MM/YYYY");
	// 	if(ctx.params.startdate === ctx.params.enddate) {end = moment(end).add(1,'d')}
	// 	var endDate = end.toDate();
	// 	let findlog = {};
	// 	findlog['created_at']= {
	// 		[Op.between]: [startDate, endDate],
	// 	 }
	// 	findlog['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
	// 	findlog['booking_status'] = { [Op.ne]: DELETE };
    //     return Booking.find(ctx, { query: findlog, limit:limit, offset:page, sort:"id"})
    //     .then( (res) => {
	// 		//console.log('res',res);
	// 		return Booking.count(ctx,{
	// 			status: 1
	// 		}).then((resy) => {
	// 			metadata.page = ctx.params.skip;
	// 			metadata.per_page = limit;
	// 			metadata.total_count = resy.data;
	// 			finalObj.metadata = metadata;
	// 			res.data.map((data) => {
	// 				let finData = {};
	// 				let vprofit = data.actualrate - (data.actualrate * commission/100);
	// 				finData.bookingid = data.id;
	// 				finData.bookingtotal = data.totalcost;
	// 				finData.tax = data.vat_amount;
	// 				let admincommission = (data.actualrate - vprofit).toFixed(2);
	// 				let vendorprofit = vprofit.toFixed(2)
	// 				finData.admincommission = parseFloat(admincommission);
	// 				finData.vendorprofit = parseFloat(vendorprofit);
	// 				finData.date = data.created_at;
	// 				finalArr.push(finData);
	// 			});
	// 			finalObj.data = finalArr;
	// 			return this.requestSuccess("Booking list", finalObj);
	// 		});
    //     })
    //     .catch( (err) => {
	// 		console.log('errr',err);
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });
	// },

	getAll: async function(ctx) {
		var metadata = {};
		var finalObj = {};
		var finalArr = [];
		var where ={};
		const commission = await  Settings.find(ctx,{query:{}}).then((res) => {
			return res.data[0].settingsvalue; 
		});
		var start = moment(ctx.params.startdate,"DD/MM/YYYY");
		var startDate = start.toDate();
		var end = moment(ctx.params.enddate,"DD/MM/YYYY");
		if(ctx.params.startdate === ctx.params.enddate) {end = moment(end).add(1,'d')}
		var endDate = end.toDate();
		let findlog = {};
		findlog['created_at']= {
			[Op.between]: [startDate, endDate],
		 }
		findlog['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		const QUERY = `select b.*,bi.id as bookingtimeid,bi.service_details
					from tbooking b inner join tbookingtime bi on b.id = bi.bookingid
					where  vendorid=${ctx.params.id} and b.booking_status = 4  and b.payment_status = 1
					order by b.id desc`;
        return db.sequelize.query(QUERY)
        .then( (res) => {
				res[0].map((data) => {
					let finData = {};
				//	let vprofit = data.actualrate - (data.actualrate * commission/100);
					finData.id = data.id;
					finData.bookingdate = data.service_date;
					finData.bookingno = data.bookingno;
					finData.service_details = JSON.parse(data.service_details);
					finData.customerdetails = JSON.parse(data.customerdetails);
					finData.vendor_details = JSON.parse(data.vendor_details);
					var AdminCommision = (parseInt(commission)/100) * (data.servicerate ? parseInt(data.servicerate): 0);
					var saloonPrice = parseInt(data.actualrate)-AdminCommision;					
					finData.service_price = saloonPrice;
					var saloonVAT = ((data.vat_percent ? parseInt(data.vat_percent) : 0)/100) * saloonPrice;
					finData.vat = saloonVAT;
					finData.total_amount = parseInt(saloonVAT) + parseInt(saloonPrice);
					finData.paymentmethod = data.payment_method;
					finalArr.push(finData);
				});
				//finalObj.data = res;
				return this.requestSuccess("Report list", finalArr);
        })
        .catch( (err) => {
			console.log('errr',err);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
	},		
	getFilterDate: async function(ctx) {
		var metadata = {};
		var finalObj = {};
		var finalArr = [];
		var where ={};
		const commission = await  Settings.find(ctx,{query:{}}).then((res) => {
			return res.data[0].settingsvalue; 
		});
		var start = moment(ctx.params.startdate,"DD/MM/YYYY");
		var startDate = start.toDate();
		var end = moment(ctx.params.enddate,"DD/MM/YYYY");
		if(ctx.params.startdate === ctx.params.enddate) {end = moment(end).add(1,'d')}
		var endDate = end.toDate();
		let findlog = {};
		findlog['created_at']= {
			[Op.between]: [startDate, endDate],
		 }
		findlog['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		const QUERY = `select b.*,bi.id as bookingtimeid,bi.service_details
					from tbooking b inner join tbookingtime bi on b.id = bi.bookingid
					where  vendorid=${ctx.params.id} and ( b.service_date  BETWEEN '${ctx.params.fromdate}' and '${ctx.params.todate}') and b.booking_status = 4  and b.payment_status = 1
					order by b.id desc`;
        return db.sequelize.query(QUERY)
        .then( (res) => {
				res[0].map((data) => {
					let finData = {};
				//	let vprofit = data.actualrate - (data.actualrate * commission/100);
					finData.id = data.id;
					finData.bookingdate = data.service_date;
					finData.bookingno = data.bookingno;
					finData.service_details = JSON.parse(data.service_details);
					finData.customerdetails = JSON.parse(data.customerdetails);
					finData.vendor_details = JSON.parse(data.vendor_details);
					var AdminCommision = (parseInt(commission)/100) * (data.servicerate ? parseInt(data.servicerate): 0);
					var saloonPrice = parseInt(data.actualrate)-AdminCommision;					
					finData.service_price = saloonPrice;
					var saloonVAT = ((data.vat_percent ? parseInt(data.vat_percent) : 0)/100) * saloonPrice;
					finData.vat = saloonVAT;
					finData.total_amount = parseInt(saloonVAT) + parseInt(saloonPrice);
					finData.paymentmethod = data.payment_method;
					finalArr.push(finData);
				});
				//finalObj.data = res;
				return this.requestSuccess("Report list", finalArr);
        })
        .catch( (err) => {
			console.log('errr',err);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
	},
	remove: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  ActivityLog.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            ActivityLog.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            });
			ctx.meta.log = "Activity log deleted.";
			activity.setLog(ctx);
            return this.requestSuccess("Activity log has been successfully Deleted", ctx.params.id);
    	})
	},
	getCounts: async function(ctx) {
		var totalAmtArr =[];
		var hotelAmtArr = [];
		var finalObj = {};
		const commission = await  Commission.find(ctx,{query:{status:1}}).then((res) => {
			return res.data[0].commission;
		});
		//console.log('comm',commission);
		async function arr_sum(arr) {
			return arr.reduce(function(acc, val) { return acc + val; }, 0);
		}
		const totalAmount = await Booking.find(ctx,{query:{status:1}}).then((res) => {
			res.data.map(element => {
				let hotelErn = element.actualrate - (element.actualrate * commission/100);
				hotelAmtArr.push(hotelErn);
				totalAmtArr.push(element.totalcost);
			});
			let tot = arr_sum(totalAmtArr);
			let hot = arr_sum(hotelAmtArr);
			return {TotalAmt:tot,HotelTot:hot}
		});
		return Booking.count(ctx, {
			status: 1
		}).then((res) => {
			finalObj.totalcount= res.data;
			totalAmount.TotalAmt.then((res) => {
				finalObj.totalamount = res;
			});
			totalAmount.HotelTot.then((res) => {
				finalObj.hotelearnings = res;
			})
			//return finalObj;
			return this.requestSuccess("Records found", finalObj);
		});
	}
}
