"use strict";
// DEVELOPED ON 23-10-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const activity = require("../../../helpers/activitylog");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const mail_template = __dirname;
const randomstring = require("randomstring");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
var dateTime = require('node-datetime');
const handlebars = require('handlebars');

//Models
const Voucher = new Database("Mvoucher");
const Vendorvoucher = new Database("Mvendorvoucher");
const Uservoucher = new Database("Muservoucher");
const Vendor = new Database("Mvendor");
const User = new Database("Muser");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation voucher
 * @permission create,update,remove,status
 * @whitelist  getall,get,getall_mob,coupon_get,voucher_code
 */
module.exports = {

    // Coupon creation
    create: async function(ctx) {

		return Voucher.findOne(ctx, { query: {
			vouchercode: ctx.params.vouchercode
		}})
		.then((res)=> {
			if (res.name === "Nothing Found")
            {
                if((ctx.params.vouchertype==1) || ((ctx.params.vouchertype==2) && (ctx.params.vouchervalue < 100)))
                {
                    return Voucher.insert(ctx, {
                        vouchername: ctx.params.vouchername,
                        vouchercode: ctx.params.vouchercode,
                        maxredeem_amt: ctx.params.maxredeem_amt,
                        vouchertype: ctx.params.vouchertype,
                        vouchervalue: ctx.params.vouchervalue,
                        mincartvalue: ctx.params.mincartvalue,
                        description: ctx.params.description,
                        startdate: ctx.params.startdate,
                        enddate: ctx.params.enddate,
                        usertype: ctx.params.usertype,
                        isallvendor: ctx.params.isallvendor,
                        isalluser: ctx.params.isalluser,
                        status: ctx.params.status
                    })
                    .then( (res) => {
                        if(ctx.params.isallvendor == 1) {
                            Vendor.find(ctx,{filter:["id"],query:{
                                status: 1
                            }})
                            .then((response)=>{
                                response.data.map((val)=>{
                                    Vendorvoucher.insert(ctx,{
                                        voucherid: res.data.id,
                                        vendorid: val.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }
                        else if(ctx.params.isallvendor == 0)
                        {
                            ctx.params.vendors.map((vdrdet)=>{
                                Vendor.findOne(ctx, { query: {
                                    id: vdrdet,
                                    status: 1
                                }
                                })
                                .then((result)=>{

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
                                    readHTMLFile(mail_template + "/Vouchertemplate.html", function(err, html) {
                                            let template = handlebars.compile(html);
                                            let replacements = {
                                                voucher_id: ctx.params.vouchercode,
                                                voucher_cost: ctx.params.vouchervalue,
                                                name: ctx.params.vouchername,
                                                message12: "Voucher Created"
                                            };
                                            const htmlToSend = template(replacements);
                                        // this method call the mail service to send mail
                                        ctx.call("mail.send", {
                                            to: result.data.email,
                                            subject: "Voucher Created",
                                            html: htmlToSend
                                        })
                                    })


                                    Vendorvoucher.insert(ctx,{
                                        voucherid: res.data.id,
                                        vendorid: result.data.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }

                        if(ctx.params.isalluser == 1)
                        {
                            User.find(ctx,{filter:['id'],query:{
                                status: 1,
                                isverified: 1
                            }})
                            .then((rest)=>{
                                rest.data.map((user_val)=>{

                                    try {
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
                                        readHTMLFile(mail_template + "/Vouchertemplate.html", function(err, html) {
                                                let template = handlebars.compile(html);
                                                let replacements = {
                                                    voucher_id: ctx.params.vouchercode,
                                                    voucher_cost: ctx.params.vouchervalue,
                                                    name: ctx.params.vouchername,
                                                    message12: "Voucher Created"
                                                };
                                                const htmlToSend = template(replacements);
                                            // this method call the mail service to send mail
                                            /*
                                            ctx.call("mail.send", {
                                                to: user_val.data.email,
                                                subject: "Voucher Created",
                                                html: htmlToSend
                                            });
                                            */
                                        })

                                        Uservoucher.insert(ctx,{
                                            voucherid: res.data.id,
                                            userid: user_val.id,
                                            vouchername: ctx.params.vouchername,
                                            vouchercode: ctx.params.vouchercode,
                                            maxredeem_amt: ctx.params.maxredeem_amt,
                                            vouchertype: ctx.params.vouchertype,
                                            vouchervalue: ctx.params.vouchervalue,
                                            mincartvalue: ctx.params.mincartvalue,
                                            description: ctx.params.description,
                                            startdate: ctx.params.startdate,
                                            enddate: ctx.params.enddate,
                                            usertype: ctx.params.usertype,
                                            isallvendor: ctx.params.isallvendor,
                                            isalluser: ctx.params.isalluser,
                                            status: ctx.params.status
                                        });

                                    } catch (error) {
                                        console('error voucher' , error)
                                    }
                                })
                            })
                        }
                        else if(ctx.params.isalluser == 0){
                            ctx.params.users.map((usrdet)=>{
                                User.findOne(ctx, { query: {
                                    id: usrdet,
                                    status: 1,
                                    isverified: 1

                                }
                                })
                                .then((result)=>{
                                    Uservoucher.insert(ctx,{
                                        voucherid: res.data.id,
                                        userid: result.data.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
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
                                    readHTMLFile(mail_template + "/Vouchertemplate.html", function(err, html) {
                                            let template = handlebars.compile(html);
                                            let replacements = {
                                                voucher_id: ctx.params.vouchercode,
                                                voucher_cost: ctx.params.vouchervalue,
                                                name: ctx.params.vouchername,
                                                message12: "Voucher Created"
                                            };
                                            const htmlToSend = template(replacements);
                                        // this method call the mail service to send mail
                                        ctx.call("mail.send", {
                                            to: result.data.email,
                                            subject: "Voucher Created",
                                            html: htmlToSend
                                        })
                                    })
                                })
                            })
                        }
                        return this.requestSuccess("Coupon Successfly Created", ctx.params.vouchername);
                    })
                    .catch( (err) => {
                        if (err.name === 'Database Error' && Array.isArray(err.data)){
                            if (err.data[0].type === 'unique' && err.data[0].field === 'voucherkey')
                                return this.requestError(CodeTypes.VOUCHER_KEY_CONSTRAINT);
                        }
                        else if (err instanceof MoleculerError)
                            return Promise.reject(err);
                        else
                            return this.requestError(err);
                    });
                }
                else {
                    return this.requestError("Check the Voucher Value");
                }
			} else {
				return this.requestError(CodeTypes.ALREADY_EXIST);
			}
		});

    },
    //Voucher list
    getall: function(ctx) {
        let findcoupon = {};
        findcoupon['status'] =  { [Op.ne]: DELETE };
        return Voucher.find(ctx, { query: findcoupon })
        .then( (res) => {
            async function get_user_vendor(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {

                    if(arr[i].isallvendor == 1) {
                        arr[i]["vendors"] = [];
                    }
                    else if(arr[i].isallvendor != 1) {
                        await Vendorvoucher.find(ctx, { filter: ['vendorid'],query: {vouchercode: arr[i].vouchercode}})
                        .then((lan_res)=>{
                            var venarr = [];
                            lan_res.data.map((item)=>{
                                venarr.push(item.vendorid);
                            })
                            arr[i]["vendors"] = venarr;
                            return arr[i];
                        })
                    }

                    if(arr[i].isalluser == 1) {
                        arr[i]["users"] = [];
                    }
                    else if(arr[i].isalluser != 1) {
                        await Uservoucher.find(ctx, { filter: ['userid'],query: {vouchercode: arr[i].vouchercode}})
                        .then((lan_res)=>{
                            var usrarr = [];
                            lan_res.data.map((item)=>{
                                usrarr.push(item.userid);
                            })
                            arr[i]["users"] = usrarr;
                            return arr[i];
                        })
                    }
                    final.push(arr[i]);
                }
                return final;
            }

            const vali =  get_user_vendor(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Voucher Details",resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

	},

	//Get voucher
	get: function(ctx) {
        return  Voucher.findOne(ctx, { query: {
            id: ctx.params.id,
            status: 1
        }
        })
        .then((res)=>{
            let voucher_arr = [];
            voucher_arr.push(res.data);

            async function get_user_vendor(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {

                    if(arr[i].isallvendor == 1) {
                        arr[i]["vendors"] = [];
                    }
                    else if(arr[i].isallvendor != 1) {
                        await Vendorvoucher.find(ctx, { filter: ['vendorid'],query: {vouchercode: arr[i].vouchercode}})
                        .then((lan_res)=>{
                            arr[i]["vendors"] = lan_res.data;
                            return arr[i];
                        })
                    }

                    if(arr[i].isalluser == 1) {
                        arr[i]["users"] = [];
                    }
                    else if(arr[i].isallvendor != 1) {
                        await Uservoucher.find(ctx, { filter: ['userid'],query: {vouchercode: arr[i].vouchercode}})
                        .then((lan_res)=>{
                            arr[i]["users"] = lan_res.data;
                            return arr[i];
                        })
                    }

                    final.push(arr[i]);
                }
                return final;
            }

            const vali =  get_user_vendor(ctx,voucher_arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Voucher Details",resy);
            })
          //  return image_arr;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(err);
            }
        });

    },

    //Get voucher
	coupon_get: function(ctx) {
        return  Voucher.findOne(ctx, { query: {
            vouchercode: ctx.params.vouchercode,
            status: 1
        }
        })
        .then((res)=>{
            return  this.requestSuccess("Voucher Code", res.data);
            //return res.data;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(err);
            }
        });

	},

	//update voucher
	update: async function(ctx) {

        let findvoucher = {};
        findvoucher['isused'] = 1;
        findvoucher['vouchercode'] = ctx.params.vouchercode;
        findvoucher['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Voucher.find(ctx,{
            query: findvoucher
        })
        .then((rest)=>{
            if (rest.name === "Nothing Found")
            {
                let findvoucher = {};
                findvoucher['id'] = ctx.params.id;
                findvoucher['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
                return Voucher.find(ctx,{
                    query: findvoucher
                })
            .then((result)=>{
                console.log("333333333333333333333333333",result.data);
                if((ctx.params.vouchertype==1) || ((ctx.params.vouchertype==2) && (ctx.params.vouchervalue < 100)))
                {
                    return Voucher.updateBy(ctx, 1, {
                        vouchername: ctx.params.vouchername,
                        maxredeem_amt: ctx.params.maxredeem_amt,
                        vouchertype: ctx.params.vouchertype,
                        vouchervalue: ctx.params.vouchervalue,
                        mincartvalue: ctx.params.mincartvalue,
                        description: ctx.params.description,
                        startdate: ctx.params.startdate,
                        enddate: ctx.params.enddate,
                        usertype: ctx.params.usertype,
                        isallvendor: ctx.params.isallvendor,
                        isalluser: ctx.params.isalluser,
                        status: ctx.params.status
                    }, { query: {
                        id: ctx.params.id
                        }
                    })
                    .then( (res) => {
                        if(ctx.params.isallvendor == 1) {
                            Vendorvoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode
                            })
                            Vendorvoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode,
                                isallvendor: 1
                            })
                            Vendor.find(ctx,{filter:["id"],query:{
                                status: 1
                            }})
                            .then((response)=>{
                                response.data.map((val)=>{
                                    Vendorvoucher.insert(ctx,{
                                        voucherid: ctx.params.id,
                                        vendorid: val.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }
                        else if(ctx.params.isallvendor == 0)
                        {
                            Vendorvoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode,
                                isallvendor: 1
                            })
                            Vendorvoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode
                            })

                            ctx.params.vendors.map((vdrdet)=>{
                                Vendor.findOne(ctx, { query: {
                                    id: vdrdet,
                                    status: 1
                                }
                                })
                                .then((result)=>{
                                    Vendorvoucher.insert(ctx,{
                                        voucherid: ctx.params.id,
                                        vendorid: result.data.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                                .catch((err)=>{
                                    console.log("dddddddddddd",err);
                                })
                            })
                        }

                        if(ctx.params.isalluser == 1)
                        {
                            Uservoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode
                            })
                            Uservoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode,
                                isallvendor: 1
                            })
                            User.find(ctx,{filter:['id'],query:{
                                status: 1
                            }})
                            .then((rest)=>{
                                rest.data.map((user_val)=>{
                                    Uservoucher.insert(ctx,{
                                        voucherid: ctx.params.id,
                                        userid: user_val.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }
                        else if(ctx.params.isalluser == 0){
                            Uservoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode,
                                isallvendor: 1
                            })
                            Uservoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode
                            })

                            ctx.params.users.map((usrdet)=>{
                                User.findOne(ctx, { query: {
                                    id: usrdet,
                                    status: 1
                                }
                                })
                                .then((result)=>{
                                    Uservoucher.insert(ctx,{
                                        voucherid: ctx.params.id,
                                        userid: result.data.id,
                                        vouchername: ctx.params.vouchername,
                                        vouchercode: ctx.params.vouchercode,
                                        maxredeem_amt: ctx.params.maxredeem_amt,
                                        vouchertype: ctx.params.vouchertype,
                                        vouchervalue: ctx.params.vouchervalue,
                                        mincartvalue: ctx.params.mincartvalue,
                                        description: ctx.params.description,
                                        startdate: ctx.params.startdate,
                                        enddate: ctx.params.enddate,
                                        usertype: ctx.params.usertype,
                                        isallvendor: ctx.params.isallvendor,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }
                        return this.requestSuccess("Coupon Successfly Created", ctx.params.vouchercouponname);
                    })
                    .catch( (err) => {
                        if (err.name === 'Database Error' && Array.isArray(err.data)){
                            if (err.data[0].type === 'unique' && err.data[0].field === 'vouchercouponkey')
                                return this.requestError(CodeTypes.VOUCHER_KEY_CONSTRAINT);
                        }
                        else if (err instanceof MoleculerError)
                            return Promise.reject(err);
                        else
                            return this.requestError(err);
                    });
                }
                else {
                    return this.requestError("Check the Voucher Value");
                }
            })
            }
            else {
                return this.requestError("Voucher already used unable to update");
            }
        })

	},

	//Remove voucher
	remove: function(ctx) {
        let findvoucher = {};
        findvoucher['isused'] = 1;
        findvoucher['id'] = ctx.params.id;
        findvoucher['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Voucher.find(ctx,{
            query: findvoucher
        })
        .then((rest)=>{
            if (rest.name === "Nothing Found")
            {
                return  Voucher.findOne(ctx, { query: {
                    id: ctx.params.id
                }
                })
                .then ((res) => {
                    Voucher.updateBy(ctx, res.data.id, {
                        status: 2
                        }, { query: {
                            id: ctx.params.id
                        }
                    })
                    .then((response)=>{
                        let update = {};
                        update["status"] = 2;
                        let des = {};
                            des["voucherid"] = ctx.params.id;
                        Vendorvoucher.updateMany(ctx,des,update);

                        let userupdate = {};
                            userupdate["status"] = 2;
                        let vouc_id = {};
                            vouc_id["voucherid"] = ctx.params.id;
                        Uservoucher.updateMany(ctx,vouc_id,userupdate);
                    })
                })
                .catch( (err) => {
                    if (err.name === 'Nothing Found')
                        return this.requestError(CodeTypes.NOTHING_FOUND);
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(err);
                });
            }
            else {
                return this.requestError("Voucher already used unable to update");
            }
        })

    },

    status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        // let findvoucher = {};
        // findvoucher['isused'] = 1;
        // findvoucher['vouchercode'] = ctx.params.vouchercode;
        // findvoucher['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        // return Voucher.find(ctx,{
        //     query: findvoucher
        // })
        // .then((rest)=>{
        //     if (rest.name === "Nothing Found")
        //     {
        //     }
        // })
        return  Voucher.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) => {
			Voucher.updateBy(ctx, res.data.id, {
                startdate: ctx.params.startdate,
                enddate: ctx.params.enddate,
				status: ctx.params.status
				}, { query: {
					id: ctx.params.id
				}
			});
            let update = {};
                update["startdate"] = ctx.params.startdate;
                update["enddate"] = ctx.params.enddate;
                update["status"] = ctx.params.status;
            let des = {};
				des["voucherid"] = ctx.params.id;
            Vendorvoucher.updateMany(ctx,des,update);

            let userupdate = {};
                userupdate["startdate"] = ctx.params.startdate;
                userupdate["enddate"] = ctx.params.enddate;
                userupdate["status"] = ctx.params.status;
            let vouc_id = {};
                vouc_id["voucherid"] = ctx.params.id;
            Uservoucher.updateMany(ctx,vouc_id,userupdate);
            ctx.meta.log = "Voucher status changed.";
			activity.setLog(ctx);
            return this.requestSuccess("Status updated");

		})
        .catch( (err) => {
			ctx.meta.log = "Attempt to change voucher status failed.";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });
    },
    //random voucher code generations

    voucher_code: function(ctx) {
        let VC_code = randomstring.generate(9);
        return this.requestSuccess("Voucher Code", VC_code.toUpperCase());
    },

    validate_voucher: function(ctx) {
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d');
        return  Voucher.findOne(ctx, { query: {
            vouchercode: ctx.params.vouchercode,
            status: 1,
            startdate: {
                [Op.lte]: formatted
            },
            enddate:{
                [Op.gte]: formatted
            },
        }
        })
        .then((res) => {
            if(res.data){
                return Uservoucher.findOne(ctx,{ query: {
                    voucherid: res.data.id,
                    status: 1,
                    userid: ctx.params.userid,
                    isused: 0
                }
                })
                .then(async (resp)=>{
                    if(resp.data) {
                        if(resp.data.mincartvalue <= ctx.params.totalamount){
                            var subcost = ctx.params.totalamount;
                            var discount = resp.data.vouchervalue;
                            var finalamount = subcost - discount;
                            var voucher_obj = {};
                            voucher_obj["subcost"] = subcost;
                            voucher_obj["discount"] = discount;
                            voucher_obj["finalamount"] = finalamount;
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
                })
            }
            else{
                return this.requestSuccess("Invalid Voucher");
            }
        })
        .catch((err=>{
            return this.requestError("Error Occurred", err);
        }))
    }
}
