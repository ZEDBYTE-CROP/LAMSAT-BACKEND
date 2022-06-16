"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const Cities = require("../../../../data/cities.json");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const activity = require("../../../helpers/activitylog");
const db = require('../../../adapters/db');
//Models

const City = new Database("Mcity");
const Citylang = new Database("Mcitylang");
const Country = new Database("Mcountrylang");
const CountryTbl = new Database("Mcountry");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation city
 * @permission create,update,status,remove
 * @whitelist get,getall
 */
module.exports = {
	importcity: async function(ctx) {
		let countryiso = 'SA';
		let countryData = await CountryTbl.find(ctx, {query:{countryiso:countryiso}})
		var countryID = countryData.data[0].id;
		let importStatus = await Cities.map((c,i) => {
			let langArr = [];
			let arObj = {};
			let enObj = {};
			arObj["languageid"] = 2;
			arObj["cityname"] = c.name_ar;
			arObj["langshortname"] = 'ar';
			langArr.push(arObj);
			enObj["languageid"] = 1;
			enObj["cityname"] = c.name_en;
			enObj["langshortname"] = 'en';
			langArr.push(enObj);
			c["language"] = langArr;
			var langid = [];
			var langname = [];
			c.language.map((item)=>{
				langid.push(item.languageid);
				langname.push(item.cityname);
			});
			let wherecond = {
				languageid: langid,
				cityname: langname,
				status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
			};

			return Citylang.find(ctx, { query: wherecond })
			.then((res) => {
				if (res.data.length === 0) {
					return City.insert(ctx, {
						countryid: countryID,
						status: 1
					})
					.then( (resp) => {
						c.language.map((lan_item)=>{
							lan_item['cityid'] = resp.data.id;
							return Citylang.insert(ctx, lan_item).then((res1) => {
								console.log(res1)
							}).catch((err) => console.log('--->',err))
						})

					})
					.catch( (err) => {
						console.log('----error---',err);
					});
				}
			})
		});
		Promise.all(importStatus).then(() => {
			return "Import success";
		})
	},
    // City creation with multiple language
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.cityname);
        });
        let wherecond = {
            languageid: langid,
            cityname: langname,
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
        };

        return Citylang.find(ctx, { query: wherecond })
        .then((res) => {
            if (res.data.length === 0) {
                return City.insert(ctx, {
					countryid: ctx.params.countryid,
					status: ctx.params.status
                })
                .then( (res) => {

                    ctx.params.language.map((lan_item)=>{
                        lan_item['cityid'] = res.data.id;
                        Citylang.insert(ctx, lan_item)
                    })
                    ctx.meta.log = "New City added by Admin";
				    activity.setLog(ctx);
                    return this.requestSuccess("City Created", ctx.params.language[0].cityname);
                })
                .catch( (err) => {
                    ctx.meta.log = "Attempt to add city failed by Admin";
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
            }
            else {
                ctx.meta.log = "Attempt to add city failed by Admin";
				activity.setLog(ctx);
               return this.requestError(`City Name ${ res.data[0].cityname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })

    },
	// City list with multiple language for mobile app
	getall: async function(ctx) {
		let languageid = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1;
        let QUERY;
        if(ctx.params.countryid) {
            QUERY = `select mcountry.id, mcity.id, mcitylang.*
			from mcity left join mcitylang on
			mcity.id = mcitylang.cityid
			left join mcountry on
			mcountry.id = mcity.countryid
			where mcountry.id = ${ctx.params.countryid} and mcitylang.cityname IS NOT NULL and mcitylang.languageid = ${languageid}`;
        } else {
            QUERY = `select mcountry.id, mcity.id, mcitylang.*
			from mcity left join mcitylang on
			mcity.id = mcitylang.cityid
			left join mcountry on
			mcountry.id = mcity.countryid
			where mcitylang.cityname IS NOT NULL and mcitylang.languageid = ${languageid}`;
        }
		let CityList = await db.sequelize.query(QUERY);
			return this.requestSuccess("Requested City",CityList[0]);
	},
    
    //status updation for City in both language
    status: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  City.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return City.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            }).then((res)=>{
                let update = {};
                update["status"] = ctx.params.status;
                let des = {};
                    des["cityid"] = ctx.params.id;
                return Citylang.updateMany(ctx,des,update)
                .then((resp)=>{
                    ctx.meta.log = "City status updated by Admin";
				    activity.setLog(ctx);
                    return this.requestSuccess("Status Changed", ctx.params.id);
                })
            })
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update status of city failed by Admin";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;
        });

    },
   //Particular City list in multiple language
    get: function(ctx) {
        let findcity = {};
        findcity['id'] = ctx.params.id;
        findcity['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return City.find(ctx, { query: findcity })
        .then( (res) => {
            var arr = res.data;
            async function get_city(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {

                    let country_name = await Country.find(ctx, { query: {countryid: arr[i].countryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["countryname"] = lan_res.data[0].countryname;
                        return arr[i];
                    })

                    let language_val = await Citylang.find(ctx, { query: {cityid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_city(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested City", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
    //City update for mutiple language (all fields are mandatory)
    update: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        var langid = [];
        var langname = [];
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.cityname);
        });
        let wherecond = {
            languageid: langid,
            cityname: langname,
            status: ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE },
            cityid: { [Op.ne]: ctx.params.id }
        };
        return Citylang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                City.updateBy(ctx, ctx.params.id, {
					countryid: ctx.params.countryid,
					status: ctx.params.status
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    ctx.params.language.map((lan_item)=>{
                        Citylang.find(ctx, { query: {cityid: ctx.params.id,languageid: lan_item.languageid} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            {
                                Citylang.insert(ctx, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    cityname: lan_item.cityname,
                                    cityshortname: lan_item.cityshortname,
                                    cityid: ctx.params.id,
                                    status: ctx.params.status
								})
								//.then((res) => console.log('citylang',res)).catch((err) => console.log('error-----citylang',err));
                            }
                            else {
                                Citylang.updateBy(ctx, 1, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    cityname: lan_item.cityname,
                                    cityshortname: lan_item.cityshortname,
                                }, { query: {
                                    languageid: lan_item.languageid,
                                    cityid: ctx.params.id
                                    }
								})
								//.then((res) => console.log('citylang',res)).catch((err) => console.log('error-----citylang',err));
                            }
                        }).catch((err) => console.log('error-----citylang',err));
                    })
				})
				.catch((err) => {
					console.log('error------city',err);
				})
                ctx.meta.log = "City updated by Admin";
				activity.setLog(ctx);
                return this.requestSuccess("City Updated", ctx.params.language[0].cityname);

            }
            else
            {
                ctx.meta.log = "Attempt to update city failed by Admin";
				activity.setLog(ctx);
                return this.requestError(`City Name ${ res.data[0].cityname } ${CodeTypes.ALREADY_EXIST}`);
            }
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update city failed by Admin";
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
    //City delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  City.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return City.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                let update = {};
                update["status"] = 2;
                let des = {};
                    des["cityid"] = ctx.params.id;
                Citylang.updateMany(ctx,des,update)
                .then((resp)=>{
                    ctx.meta.log = "City removed by Admin";
                    activity.setLog(ctx);
                    return this.requestSuccess("City Deleted", ctx.params.id);
                })
            })
        })
    }
}
