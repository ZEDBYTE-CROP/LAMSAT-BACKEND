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

module.exports = {

    // Coupon creation
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
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
                        isallvendor: 0,
                        isalluser: ctx.params.isalluser,
                        status: ctx.params.status
                    })
                    .then( (res) => {
                        Vendorvoucher.insert(ctx,{
                            voucherid: res.data.id,
                            vendorid: ctx.meta.user.id,
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
                            isallvendor: 0,
                            isalluser: ctx.params.isalluser,
                            status: ctx.params.status
                        })
                        

                        if(ctx.params.isalluser == 1)
                        {
                            User.find(ctx,{filter:['id'],query:{
                                status: 1
                            }})
                            .then((rest)=>{
                                rest.data.map((user_val)=>{
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
                                        isallvendor: 0,
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
                                            to: user_val.email,
                                            subject: "Voucher Created",
                                            html: htmlToSend
                                        }) 
                                    })

                                })
                            })
                        }
                        else if(ctx.params.isalluser == 0){
                            ctx.params.users.map((usrdet)=>{
                                User.findOne(ctx, { query: {
                                    id: usrdet,
                                    status: 1
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
                                        isallvendor: 0,
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
                        ctx.meta.log = 'Vendor Voucher Created successfully';
                        activity.setLog(ctx);
                        return this.requestSuccess("Coupon Successfly Created", ctx.params.vouchername);
                    })
                    .catch( (err) => {
                        ctx.meta.log = 'Vendor Voucher create Failed';
                        activity.setLog(ctx);
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
                    ctx.meta.log = 'Vendor Voucher create failed due to voucher value';
                    activity.setLog(ctx);
                    return this.requestError("Check the Voucher Value");
                }
			} else {
                ctx.meta.log = 'Vendor voucher create failed due to voucher code already exist';
                activity.setLog(ctx);
				return this.requestError(CodeTypes.ALREADY_EXIST);
			}
		});

    },
    //Voucher list
    getall: function(ctx) {
        let findcoupon = {};
        findcoupon['vendorid'] = ctx.meta.user.id;
        findcoupon['status'] =  { [Op.ne]: DELETE };
        return Vendorvoucher.find(ctx, { query: findcoupon })
        .then( (res) => {
            async function get_user_vendor(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    if(arr[i].isalluser == 1) {
                        arr[i]["users"] = [];
                    }
                    else if(arr[i].isallvendor != 1) {
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
        return  Vendorvoucher.findOne(ctx, { query: {
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
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
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
                findvoucher['vouchercode'] = ctx.params.vouchercode;
                findvoucher['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
                return Voucher.find(ctx,{
                    query: findvoucher
                })
            .then((result)=>{
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
                        isallvendor: 0,
                        isalluser: ctx.params.isalluser,
                        status: ctx.params.status
                    }, { query: {
                        vouchercode: ctx.params.vouchercode
                        }
                    })
                    .then( (res) => {
                            Vendorvoucher.removeMany(ctx, {
                                vouchercode: ctx.params.vouchercode
                            })
                            .then((res)=>{
                                Vendorvoucher.insert(ctx,{
                                    voucherid: result.data[0].id,
                                    vendorid: ctx.meta.user.id,
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
                                    isallvendor: 0,
                                    isalluser: ctx.params.isalluser,
                                    status: ctx.params.status
                                })
                            })
    
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
                                        voucherid: result.data[0].id,
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
                                        isallvendor: 0,
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
                                .then((rest)=>{
                                    Uservoucher.insert(ctx,{
                                        voucherid: result.data[0].id,
                                        userid: rest.data.id,
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
                                        isallvendor: 0,
                                        isalluser: ctx.params.isalluser,
                                        status: ctx.params.status
                                    })
                                })
                            })
                        }
                        ctx.meta.log = 'Vendor voucher updated successfully';
                        activity.setLog(ctx);
                        return this.requestSuccess("Coupon Successfly Created", ctx.params.vouchercouponname);
                    })
                    .catch( (err) => {
                        ctx.meta.log = 'Vendor Voucher update Failed';
                        activity.setLog(ctx);
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
                    ctx.meta.log = 'Vendor voucher update failed due to invalid voucher value';
                    activity.setLog(ctx);
                    return this.requestError("Check the Voucher Value");
                }
            })
            }
            else {
                ctx.meta.log = 'Vendor update failed due to voucher code already exist';
                activity.setLog(ctx);
                return this.requestError("Voucher already used unable to update");
            }
        })

	},

	//Remove voucher
	remove: function(ctx) {
        /*activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});*/
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
                    return Voucher.updateBy(ctx, res.data.id, {
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
                        ctx.meta.log = 'Vendor Voucher removed successfully';
                        activity.setLog(ctx);
                        return this.requestSuccess("Voucher Deleted Successfully");
                    })
                })
                .catch( (err) => {
                    ctx.meta.log = 'Attempt to remove vendor voucher failed';
                    activity.setLog(ctx);
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

}
