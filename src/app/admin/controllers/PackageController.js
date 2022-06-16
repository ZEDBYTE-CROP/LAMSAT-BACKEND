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
const db = require('../../../adapters/db');
const Sequ = require("sequelize");

//Models
const Package = new Database("Mpackage");
const Packagelang = new Database("Mpackagelang");
const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;
/**
 *
 * @annotation adminpackage
 * @permission create,update,remove,status
 * @whitelist getall,get
*/
module.exports = {

    // Service creation with multiple language
    create: async function(ctx) {

        var langid = [];
        var langname = [];
        var testname = "";
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.packagename);
        });
        let wherecond = {
            languageid: langid,
            packagename: langname,
            status: 1,
            vendorid: ctx.params.vendorid
        };
        return Packagelang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                var serv_str = ctx.params.service_id.toString();
                return Package.insert(ctx, {
                    vendorid:ctx.params.vendorid,
                    categoryid: ctx.params.categoryid,
                    package_available: ctx.params.package_available, // 1=> female, 2==> kids
                    service_id: serv_str,
                    packagecost: ctx.params.packagecost,
                    photopath: ctx.params.photopath,
                    image_url: ctx.params.image_url
                })
                .then( (res) => {
                        var serv_arr = ctx.params.service_id;
                        var wherecon = {
                            id: serv_arr,
                            status:1
                        }
                        Service.find(ctx, {filter:['id','vendorid', 'categoryid','availability', 'tax', 'service_staff','photopath',"image_url"],query:wherecon})
                        .then((resp)=>{
                        var jim = [];
                        resp.data.map(async(item)=>{
                            let ServiceListlang = await db.sequelize.query('EXEC SP_serv_lang :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT});
                            let ServiceListprice = await db.sequelize.query('EXEC SP_serv_price :serviceid',{replacements: {serviceid: item.id},type: Sequ.QueryTypes.SELECT});
                            item['language'] = ServiceListlang;
                            item['price'] = ServiceListprice;
                            jim.push(item);
                            if(jim.length == resp.data.length){
                                var serv_str = JSON.stringify(jim);
                                Package.updateBy(ctx, 1, {
                                    service_details: serv_str
                                }, { query: {
                                    id: res.data.id
                                }
                                })
                            }
                        })
                    })
                    ctx.params.language.map((lan_item)=>{
                        Packagelang.insert(ctx, {
                            languageid: lan_item.languageid,
                            langshortname: lan_item.langshortname,
                            packageid: res.data.id,
                            vendorid: ctx.params.vendorid,
                            packagename: lan_item.packagename,
                            package_description: ctx.params.package_description
                        })
                    })
                    return this.requestSuccess("Package Created", ctx.params.language[0].packagename);
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
            }
            else {
                return this.requestError(`Package Name ${ res.data[0].packagename } ${CodeTypes.ALREADY_EXIST}`);
            }
        })

    },
    // Package list with multiple language for respective vendor
    getall: function(ctx) {
        let findpackage = {};
        if(ctx.params.vendorid){
            findpackage['vendorid'] = ctx.params.vendorid;
        }
        findpackage['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Package.find(ctx, { query: findpackage })
        .then( (res) => {

            async function get_packages(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    const serv = JSON.parse(arr[i].service_details);
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
                    arr[i].service_details = serv;
                    final.push(arr[i]);
                }
                return final;
            }
			if(res.data.length > 0) {
				var arr = res.data;
				const vali =  get_packages(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess('Packages found!',resy);
				});
			} else {
				return this.requestSuccess('No packages found!',res.data);
			}
        })
        .catch( (err) => {
			console.log('errrrr',err);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

	},

    //status updation for Status in both language
    status: function(ctx) {
        return  Package.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Package.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = ctx.params.status;
                let des = {};
                des["packageid"] = ctx.params.id;
                return Packagelang.updateMany(ctx,des,update)
                .then((resp)=>{
                    return this.requestSuccess("Status Changed", ctx.params.id);
                })
            })
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
   //Particular package list in multiple language
    get: function(ctx) {
		let findpackage = {};
        findpackage['id'] = ctx.params.id;
        findpackage['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Package.find(ctx, { query: findpackage })
        .then( (res) => {
            async function get_packages(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    const serv = JSON.parse(arr[i].service_details);
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
                    arr[i].service_details = serv;
                    final.push(arr[i]);
                }
                return final;
            }
			if(res.data.length > 0) {
				var arr = res.data;
				const vali =  get_packages(ctx,arr);
				return vali.then((resy)=>{
					return this.requestSuccess('Packages found!',resy);
				});
			} else {
				return this.requestSuccess('No packages found!',res.data);
			}
        })
        .catch( (err) => {
			console.log('errrrr',err);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    //Package update for mutiple language (all fields are mandatory)
    update: async function(ctx) {
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.packagename);

        });
        let wherecond = {
            languageid: langid,
            packagename: langname,
            status: 1,
            vendorid: ctx.params.vendorid,
            packageid: {[Op.ne]: ctx.params.id}
        };
        return Packagelang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                var serv_str = ctx.params.service_id.toString();
				Package.updateBy(ctx, 1, {
                    vendorid:ctx.params.vendorid,
                    categoryid: ctx.params.categoryid,
                    package_available: ctx.params.package_available, // 1=> female, 2==> kids
                    service_id: serv_str,
                    packagecost: ctx.params.packagecost,
                    photopath: ctx.params.photopath,
                    image_url: ctx.params.image_url
				}, { query: {
						id: ctx.params.id
					}
				}).then((res)=>{
                    ctx.params.language.map((lan_item)=>{
                        Packagelang.find(ctx, { query: {packageid: ctx.params.id,languageid: lan_item.languageid} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            {
                                Packagelang.insert(ctx, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    packagename: lan_item.packagename,
                                    vendorid: ctx.params.vendorid,
                                    packageid: ctx.params.id,
                                    package_description: lan_item.package_description
                                })
                            }
                            else {
                                ctx.params.language.map((lan_item)=>{
                                    Packagelang.updateBy(ctx, 1, {
                                        languageid: lan_item.languageid,
                                        langshortname: lan_item.langshortname,
                                        packagename: lan_item.packagename,
                                        vendorid: ctx.params.vendorid,
                                        package_description: lan_item.package_description
                                }, { query: {
                                        languageid: lan_item.languageid,
                                        packageid: ctx.params.id
                                        }
                                    })
                                });
                            }
                        })
                    })
				})
				return this.requestSuccess("Package Updated", ctx.params.language[0].packagename);
            }
            else
            {
                return this.requestError(`Package Name ${ res.data[0].packagename } ${CodeTypes.ALREADY_EXIST}`);
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
    //Package delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Package.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Package.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = 2;
                let des = {};
				des["packageid"] = ctx.params.id;
				return Packagelang.updateMany(ctx,des,update)
                .then((res)=>{
                    return this.requestSuccess("Status Changed", ctx.params.id);
                })
            })
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

    }
}
