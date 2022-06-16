"use strict";
// DEVELOPED ON 14-07-2020

const jwt = require("jsonwebtoken");
const passwordHash = require('password-hash');
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } = require("moleculer").Errors;
const { log } = require("util");
const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const Op = require('sequelize').Op;
const CodeTypes = require("../../../fixtures/error.codes");
const Config = require("../../../../config");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const mail_template = __dirname;
const moment = require("moment");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Sequ = require("sequelize");
var googleAuth = require('./googleAuth.js');
var facebookAuth = require('./facebookAuth.js');
const { Console } = require("console");
const db = require('../../../adapters/db');
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',

    // Optional depending on the providers
    //fetch: customFetchImplementation,
    apiKey: Config.get('/googleAPI'), // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Logins = {
    security: ["id", "password", "usertypeid", "email"],
    admin_security: ["id", "password", "usertypeid"],
    admin_security1: ["id", "password", "usertypeid"],
    encode: ["id", "usertypeid"],
    admin_encode: ["id", "usertypeid"]
};
const Filters_Tokens = {
    empty: ["id", "login_type"]
};
const Favvendor = new Database("Mfavourite");
const {
    DELETE,
    ACTIVE,
    INACTIVE,
    ADMIN_ROLE,
    USER_ROLE
} = Constants;
const Roles = [ADMIN_ROLE, USER_ROLE];
//Models
// Create Promisify encode & verify methods
const encode = Promise.promisify(jwt.sign);
const verify = Promise.promisify(jwt.verify);
const User = new Database("Muser");
const User_filter = new Database("Muser", [
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

const Category = new Database("Mcategory");
const Categoryfilt = new Database("Mcategory", [
    "id",
    "categorykey",
    "image_url",
    "photopath",
    "status",
    "created_by",
    "created_at",
]);
const vendortime = new Database("Mvendorhours", [
    "id",
    "vendorhourskey",
    "vendorid",
    "days",
    "starttime",
    "endtime",
    "vendorstatus",
    "status"
]);
const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");

const Serviceprice = new Database("Mserviceprice");
const Servicestaff = new Database("Mservicestaff");
const Categorylang = new Database("Mcategorylang");
const Categorylangfilt = new Database("Mcategorylang", [
    "id",
    "mcategorylangkey",
    "languageid",
    "langshortname",
    "categoryid",
    "categoryname",
    "created_by",
    "created_at",
]);

//vendor tables and its fields
const vendor = new Database("Mvendor");
const vendorfilt = new Database("Mvendor", [
    "id",
    "isfeatured",
    "vendorkey",
    "firstname",
    "lastname",
    "username",
    "email",
    "latitude",
    "longitude",
    "countryid",
    "cityid",
    "areaid",
    "commissiontype",
    "contactnumber",
    "sortorder",
    "vat",
    "vendorstatus",
    "servicelocation",
    "paymentoption",
    "usertypeid",
    "socialtypeid",
    "socialkey",
    "devicetype",
    "devicetoken",
    "photopath",
    "status",
    "categoryid",
    "image_url",
    "service_available",
    "vatnumber",
    "gender",
    "crdocument_url",
    "vatdocument_url",
    "ratingavg",
    "ratingcount"
]);

const vendorlang = new Database("Mvendorlang");
const vendorlangfilt = new Database("Mvendorlang", [
    "id",
    "languageid",
    "languageshortname",
    "vendorid",
    "vendorname",
    "vendordescription",
    "vendoraddress",
    "status"
]);
const vendorimage = new Database("Mvendorimage", [
    'id',
    "vendorimagekey",
    "vendorid",
    "image_url",
    "vendorimagepath",
    "status"
]);
const Staff = new Database("Mvendorstaff");
const Stafflang = new Database("Mvendorstafflang");
const Staffhours = new Database("Mvendorstaffhours");
const Staffservice = new Database("Mvendorstaffservice");
const Servicelangfilt = new Database("Mservicelang", [
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
const Review = new Database("Treview");
const favourite = new Database("Mfavourite");
const Vat = new Database("Mvat");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE


module.exports = {

    //location based saloons
    instant_sallon: async function (ctx) {
        let playersList = await db.sequelize.query('EXEC SP_NearVendor :latitude,:longitude,:languageid', { replacements: { latitude: ctx.params.latitude, longitude: ctx.params.longitude, languageid: ctx.options.parentCtx.params.req.headers.language }, type: Sequ.QueryTypes.SELECT });
        return this.requestSuccess("Near By Vendors List", playersList);
    },

    near_vendor: async function(ctx) {
        const LocationData = (ctx.params.latitude != 0 && ctx.params.longitude != 0 )?await geocoder.reverse({ lat: ctx.params.latitude, lon: ctx.params.longitude }):[];
        let playersList = await db.sequelize.query('EXEC SP_NearVendor :latitude,:longitude,:languageid',{replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT});
        async function get_fav(ctx, arr) {
            let total_array = [];
            for(let i = 0;i< arr.length;i++){

                let review_val = await db.sequelize.query('EXEC SP_Avgreview :vendorid',{replacements: {vendorid: arr[i].id},type: Sequ.QueryTypes.SELECT});
                arr[i]["reviews"] = review_val[0];
                total_array.push(arr[i]);
            }
            return total_array;
        }
        var list = get_fav(ctx, playersList);

        return list.then((resy)=>{
           var location=  (LocationData.length>0)?LocationData[0].administrativeLevels.level2long+','+LocationData[0].administrativeLevels.level1long+','+LocationData[0].country:'';
            return this.requestSuccess("Vendor Detail", [resy,location]);
        })
	},
	getvendorbyname: async function (ctx) {
		let query = 'EXEC SP_GetVendorByName :languageid,:vendorname';
		let queryBind = {replacements: {languageid: ctx.options.parentCtx.params.req.headers.language,vendorname: ctx.params.vendorname},type: Sequ.QueryTypes.SELECT}
        let playersList = await db.sequelize.query(query,queryBind);
		console.log('log-------',playersList);
		async function get_fav(ctx, arr) {
            let total_array = [];
            for(let i = 0;i< arr.length;i++) {
				var jim = arr[i].paymentoption;
				if(jim) {
					const spil = jim.split(",");
					arr[i].paymentoption = spil;
				} else {
					arr[i].paymentoption = [];
				}

				let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
					.then((lan_res) => {
						arr[i]["vendorname"] = lan_res.data[0].vendorname;
						arr[i]["address"] = lan_res.data[0].vendoraddress;
						arr[i]['vendordescription'] = lan_res.data[0].vendordescription;
						return arr[i];
					});

				let vendor_image = await vendorimage.find(ctx, { filter: ['id', 'image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
					.then((images) => {
						arr[i]["images"] = images.data;
						return arr[i];
					});
				let vendortimings = await vendortime.find(ctx, { filter: ['id', 'days', 'starttime', 'endtime'], query: { vendorid: arr[i].id } })
					.then((time) => {
						arr[i]["timings"] = time.data;
						return arr[i];
					});

				if (ctx.params.userid) {
					let vendorFavourite = await Favvendor.find(ctx, { filter: ['id', 'status', 'created_at'], query: { vendorid: arr[i].id, status: 1, userid : ctx.params.userid } })
					.then((fav) => {
						console.log('fav', fav.data)
						if (fav.data.length > 0) { arr[i]["favourite"] = 1; } else { arr[i]["favourite"] = 0; }
						return arr[i];
					});
				}


				let ratings_count = await Review.count(ctx,{
					status: 1,
					vendorid: arr[i].id
				}).then((resy) => {
					arr[i]['review_count'] = resy.data.toFixed(2);
					return arr[i];
				})

				//,status:1,isreview:1
				let ratings = await Review.find(ctx, { filter: ['id', 'name', 'vendorid', 'rating', 'review'], query: { vendorid: arr[i].id} })
				.then((res) => {
					var arrCnt = [];
					const tes = res.data.filter(res1 => arrCnt.push(res1.rating));
					arrCnt.reduce((a, b) => a + b, 0)
					var finalout = arrCnt.reduce((a, b) => a + b, 0) > 0 ? arrCnt.reduce((a, b) => a + b, 0) / arrCnt.length : 0;
					console.log(arrCnt.reduce((a, b) => a + b, 0), '===========rating', arrCnt.length, finalout)
					arr[i]['rating_review'] = finalout.toFixed(2);
					return arr[i];
				})
				total_array.push(language_val_filter);
            }
            return total_array;
        }
        var list = get_fav(ctx, playersList);

        return list.then((resy)=>{
            return this.requestSuccess("Vendor Detail",resy);
		});
	},

    getvendors: async function (ctx) {

		let query = 'EXEC SP_NearVendor :latitude,:longitude,:languageid'; let queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT};
		if(ctx.params.categoryid){
			query = `EXEC SP_NearVendor :latitude,:longitude,:languageid,:categoryid`;
			queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,categoryid:ctx.params.categoryid,languageid: ctx.options.parentCtx.params.req.headers.language,service_available:ctx.params.service_available},type: Sequ.QueryTypes.SELECT}
		}
		console.log('--------------');
		console.log(query);
		console.log(queryBind);
		console.log('--------------');
		if(ctx.params.service_available){
			query = 'EXEC SP_NearVendor :latitude,:longitude,:languageid,:service_available';
			queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language,service_available:ctx.params.service_available},type: Sequ.QueryTypes.SELECT};
		}
		if (ctx.params.isfeatured) {
			query = 'EXEC SP_Featured :latitude,:longitude,:languageid';
			queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT};
		}
		if(ctx.params.vendoraddress) {
			query = 'EXEC SP_NearVendor :latitude,:longitude,:languageid';
			queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT};
		}
        if (ctx.params.sortby) {
            let sortby = ctx.params.sortby
            switch (sortby) {
                case "nearest":
                    query = 'EXEC SP_NearVendor :latitude,:longitude,:languageid';
			        queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT};
                    break;
                case "toprated":
					query = 'EXEC SP_TopRatingVendor :languageid';
			        queryBind = { replacements: { languageid: ctx.options.parentCtx.params.req.headers.language }, type: Sequ.QueryTypes.SELECT };
                    break;
				case "newest":
					query = 'EXEC SP_Newest :languageid';
			        queryBind = {replacements: {languageid: ctx.options.parentCtx.params.req.headers.language },type: Sequ.QueryTypes.SELECT};
					break;
				case "lowprice":
					query = 'EXEC SP_LowPrice :languageid';
					queryBind = {replacements: {languageid: ctx.options.parentCtx.params.req.headers.language} ,type: Sequ.QueryTypes.SELECT};
					break;
                case "date":
                    let lang = ctx.options.parentCtx.params.req.headers.language ? parseInt(ctx.options.parentCtx.params.req.headers.language) : 1;
                    var mydate = ctx.params.fromdate;
                    var timestr;
                    var weekDayName;
                    if(Array.isArray(mydate)) {
                        timestr = mydate[1].substr(mydate[1].indexOf(' ')+1);
                        weekDayName =  moment(mydate[1]).format('dddd');
                    } else {
                        weekDayName =  moment(mydate).format('dddd');
                    }
                    console.log('------time dtring',weekDayName)
                    if(timestr) {
                        query = 'EXEC SP_Bytime :languageid,:day,:time';
                        queryBind = {replacements: {languageid: lang, day: weekDayName, time:timestr} ,type: Sequ.QueryTypes.SELECT};    
                    } else {
                        query = 'EXEC SP_Bydate :languageid,:day';
                        queryBind = {replacements: {languageid: lang, day: weekDayName} ,type: Sequ.QueryTypes.SELECT}; 
                    }
                    break;
                default:
					break;
            }
		}
		if (ctx.params.sortby && ctx.params.service_available) {
            let sortby = ctx.params.sortby
            switch (sortby) {
                case "nearest":
                    query = 'EXEC SP_NearVendor :latitude,:longitude,:service_available,:languageid';
			        queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,service_available:ctx.params.service_available,languageid: ctx.options.parentCtx.params.req.headers.language?ctx.options.parentCtx.params.req.headers.language:1},type: Sequ.QueryTypes.SELECT};
                    break;
                case "toprated":
					console.log('---called toprated')
                    //query = 'EXEC SP_TopRatingVendor :languageid,:latitude,:longitude';
                    query = 'EXEC SP_TopRatingVendorLocation :languageid,:latitude,:longitude,:service_available,:vendorloc';
			        queryBind = { replacements: { latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language?ctx.options.parentCtx.params.req.headers.language:1,service_available:ctx.params.service_available,vendorloc: ctx.params.vendorlocation }, type: Sequ.QueryTypes.SELECT };
                    break;
				case "newest":
                    //query = 'EXEC SP_Newest :latitude,:service_available,:longitude,:languageid';
                    query = 'EXEC SP_Newest_Location :languageid,:service_available,:vendorloc';
			        queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,service_available:ctx.params.service_available,languageid: ctx.options.parentCtx.params.req.headers.language?ctx.options.parentCtx.params.req.headers.language:1,vendorloc: ctx.params.vendorlocation },type: Sequ.QueryTypes.SELECT};
					break;
				case "lowprice":
					query = 'EXEC SP_LowPrice :latitude,:service_available,:languageid';
					queryBind = {replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,service_available:ctx.params.service_available,languageid: ctx.options.parentCtx.params.req.headers.language?ctx.options.parentCtx.params.req.headers.language:1} ,type: Sequ.QueryTypes.SELECT};
					break;
				default:
					break;
            }
		}
		const LocationData = (ctx.params.latitude != 0 && ctx.params.longitude != 0 )?await geocoder.reverse({ lat: ctx.params.latitude, lon: ctx.params.longitude }):[];
        let playersList = await db.sequelize.query(query,queryBind);
		console.log('log-------',playersList);
		async function get_fav(ctx, arr) {
            let total_array = [];
            for(let i = 0;i< arr.length;i++) {
				var jim = arr[i].paymentoption;
				if(jim) {
					const spil = jim.split(",");
					arr[i].paymentoption = spil;
				} else {
					arr[i].paymentoption = [];
				}

				let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
					.then((lan_res) => {
						arr[i]["vendorname"] = lan_res.data[0].vendorname;
						arr[i]["address"] = lan_res.data[0].vendoraddress;
						arr[i]['vendordescription'] = lan_res.data[0].vendordescription;
						return arr[i];
					});

				let vendor_image = await vendorimage.find(ctx, { filter: ['id', 'image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
					.then((images) => {
						arr[i]["images"] = images.data;
						return arr[i];
					});
				let vendortimings = await vendortime.find(ctx, { filter: ['id', 'days', 'starttime', 'endtime'], query: { vendorid: arr[i].id } })
					.then((time) => {
						arr[i]["timings"] = time.data;
						return arr[i];
					});

				if (ctx.params.userid) {
					let vendorFavourite = await Favvendor.find(ctx, { filter: ['id', 'status', 'created_at'], query: { vendorid: arr[i].id, status: 1, userid : ctx.params.userid } })
					.then((fav) => {
						console.log('fav', fav.data)
						if (fav.data.length > 0) { arr[i]["favourite"] = 1; } else { arr[i]["favourite"] = 0; }
						return arr[i];
					});
				}

				total_array.push(language_val_filter);
            }
            return total_array;
        }
        var list = get_fav(ctx, playersList);

        return list.then((resy)=>{
           var location=  (LocationData.length>0)?LocationData[0].administrativeLevels.level2long+','+LocationData[0].administrativeLevels.level1long+','+LocationData[0].country:'';
            return this.requestSuccess("Vendor Detail", [resy,location]);
		});
    },
    // category getall for website home page
    category_getall: async function (ctx) {
        let findcategory = {};
        if (ctx.params.vendorid) {
            findcategory['vendorid'] = ctx.params.vendorid;
        }
        if (ctx.params.is_admin) {
            findcategory['is_admin'] = ctx.params.is_admin;
        }
        findcategory['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Categoryfilt.find(ctx, { query: findcategory })
            .then((res) => {
                var arr = res.data;
                async function get_category(ctx, arr) {
                    let final = [];
                    for (var i = 0; i < arr.length; i++) {

                        let subject_lang = await Categorylangfilt.find(ctx, { query: { categoryid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["categoryname"] = lan_res.data[0].categoryname;
                                return arr[i];
                            })

                        final.push(subject_lang);
                    }
                    return final;
                }
                const vali = get_category(ctx, arr);
                return vali.then((resy) => {
                    return resy;
                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });

    },

	saloon_getall: async function(ctx) {
		const languageid = 1;
		let category_list = await db.sequelize.query('EXEC SP_GetFeaturedVendors :languageid',{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid },type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess('Services found!', category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : '');
	},

    // Featured saloon only
    saloon_getall_old: async function (ctx) {
        const array = [];
        let findvendor = {};
        findvendor['isfeatured'] = ctx.params.isfeatured;
        findvendor['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorfilt.find(ctx, { query: findvendor })
            .then((res) => {
                //TO Get categories of vendor
                async function get_category(ctx, arr) {
                    // log("Ssss",arr);
                    let total_array = [];
                    for (var i = 0; i < arr.length; i++) {

                        //to get language data of the vendor
                        let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["vendorname"] = lan_res.data[0].vendorname;
                                arr[i]["address"] = lan_res.data[0].vendoraddress;
                                return arr[i];
                            });
                        // to get vendor images
                        let vendor_image = await vendorimage.find(ctx, { filter: ['image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
                            .then((images) => {
                                arr[i]["images"] = images.data;
                                return arr[i];
                            });
                        let vendortimings = await vendortime.find(ctx, { filter: ['days', 'starttime', 'endtime'], query: { vendorid: arr[i].id } })
                            .then((time) => {
                                arr[i]["timings"] = time.data;
                                return arr[i];
                            });
                        total_array.push(language_val_filter);
                    }
                    return total_array;
                }
                let array = [];
                array.push(res.data);
                const vali = get_category(ctx, res.data);
                return vali.then((resy) => {
                    return this.requestSuccess("Vendor Detail", resy);
                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });

    },

    // Featured saloon only
    category_saloons: async function (ctx) {

        return vendorfilt.find(ctx, { query: { status: 1 } })
            .then((response) => {
				var vendor_id = [];
				if(response.data.length){
					response.data.map((item) => {
                       // var temp = item.admincategoryid;
                        var temp = item.categoryid;
						if(temp) {
							var temp_arr = temp.split(",");
							if(ctx.params.categoryid){
								if (temp_arr.includes(ctx.params.categoryid) == true) {
									vendor_id.push(item.id);
								}
							} else {
								vendor_id.push(item.id);
							}
						}
					})
					let wherecond = {
						id: vendor_id,
                        status: 1,
                        isaccepted: 1
					};
					return vendorfilt.find(ctx, { query: wherecond })
						.then((res) => {
							//TO Get categories of vendor
							async function get_category(ctx, arr) {
								// log("Ssss",arr);
								let total_array = [];
								for (var i = 0; i < arr.length; i++) {

									//to get language data of the vendor
									let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
										.then((lan_res) => {

											arr[i]["vendorname"] = lan_res.data[0].vendorname ? lan_res.data[0].vendorname : 'test';
											arr[i]["address"] = lan_res.data[0].vendoraddress ? lan_res.data[0].vendoraddress : 'test address';
											return arr[i];

										});
									// to get vendor images
									let vendor_image = await vendorimage.find(ctx, { query: { vendorid: arr[i].id } })
										.then((images) => {
											arr[i]["images"] = images.data;
											return arr[i];
										});
									let vendortimings = await vendortime.find(ctx, { filter: ['days', 'starttime', 'endtime'], query: { vendorid: arr[i].id } })
										.then((time) => {
											arr[i]["timings"] = time.data;
											return arr[i];
										});
									total_array.push(language_val_filter);
								}
								return total_array;
							}

							const vali = get_category(ctx, res.data);
							return vali.then((resy) => {
								return this.requestSuccess("Vendor Detail", resy);
							})
						})
						.catch((err) => {
							if (err.name === 'Nothing Found')
								return this.requestError(CodeTypes.NOTHING_FOUND);
							else
								return this.requestError(err);
						});
				} else {
					return this.requestSuccess("No Vendor Detail Found!", []);
				}
			});
    },

    toprating_getall: async function (ctx) {
		let lang = ctx.options.parentCtx.params.req.headers.language ? parseInt(ctx.options.parentCtx.params.req.headers.language) : 1;
        let playersList = await db.sequelize.query('EXEC SP_TopRatingVendor :languageid', { replacements: { languageid: lang}, type: Sequ.QueryTypes.SELECT });
        //return this.requestSuccess("Hotel List", playersList);
        let imgarr = playersList.map(async(vendotdata,i)=>{
        await vendorimage.find(ctx, { query: { vendorid : vendotdata.id} })
            .then((img_res) => {
                playersList[i].images = [{"url":img_res.data.length ? img_res.data[0].image_url : ""}]
                return playersList[i];
            });
        })
        return Promise.all(imgarr).then(() => {
            return this.requestSuccess("Top Rating Detail", playersList);
        });
    },

    // Service list with multiple language for respective vendor
    service_getall: function (ctx) {
        let findservice = {};
        if (ctx.params.vendorid) {
            findservice['vendorid'] = ctx.params.vendorid;
        }
        if (ctx.params.categoryid) {
            findservice['categoryid'] = ctx.params.categoryid;
        }
        findservice['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Service.find(ctx, { query: findservice })
            .then((res) => {
                var arr = res.data;
                async function get_services(ctx, arr) {
                    let final = [];
                    for (var i = 0; i < arr.length; i++) {
						let serv_staff = arr[i].service_staff;
						if(serv_staff) {
							let staff_arr = serv_staff.split(",");
                        	arr[i]['service_staff'] = staff_arr;
						}
                        let subject_lang = await Categorylangfilt.find(ctx, { query: { categoryid: arr[i].categoryid, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["categoryname"] = lan_res.data[0].categoryname;
                                return arr[i];
                            });

                        let language_val = await Servicelangfilt.find(ctx, { query: { serviceid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["servicename"] = lan_res.data[0].servicename;
                                return arr[i];
                            });

                        let language_val1 = await Servicelangfilt.find(ctx, { filter: ['languageid', 'servicename', 'description'], query: { serviceid: arr[i].id } })
                            .then((lan_res) => {
                                arr[i]["language"] = lan_res.data;
                                return arr[i];
                            });

                        let price_option = await Serviceprice.find(ctx, { filter: ['pricing_name', 'duration', 'pricetype', 'price', 'special_price'], query: { serviceid: arr[i].id } })
                            .then(async (lan_res) => {
								arr[i]["price"] = lan_res.data;
                                return arr[i];
                            })


                        final.push(language_val);
                    }
                    return final;
                }
                const vali = get_services(ctx, arr);
                return vali.then((resy) => {
                    return this.requestSuccess('Services found!', resy);

                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });

    },
    staff_getall: function (ctx) {
        let findstaff = {};
        findstaff['vendorid'] = ctx.params.vendorid;
        findstaff['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Staff.find(ctx, { query: findstaff })
            .then((res) => {
                var arr = res.data;
                async function get_staff(ctx, arr) {
                    let final = [];
                    for (var i = 0; i < arr.length; i++) {
                        let subject_lang = await Stafflang.find(ctx, { query: { vendorstaffid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["firstname"] = lan_res.data[0].firstname;
                                arr[i]["lastname"] = lan_res.data[0].lastname;
                                arr[i]["staff_title"] = lan_res.data[0].staff_title;
                                arr[i]["notes"] = lan_res.data[0].notes;
                                return arr[i];
                            });


                        let language_val1 = await Stafflang.find(ctx, { filter: ['languageid', 'firstname', 'lastname', 'staff_title', 'notes'], query: { vendorstaffid: arr[i].id } })
                            .then((lan_res) => {
                                arr[i]["language"] = lan_res.data;
                                return arr[i];
                            });

                        let price_option = await Staffservice.find(ctx, { filter: ['serviceid'], query: { vendorstaffid: arr[i].id } })
                            .then((lan_res) => {
                                var arry = [];
                                lan_res.data.map((item) => {
                                    arry.push(item.serviceid);
                                })
                                let wherecond = {
                                    languageid: ctx.options.parentCtx.params.req.headers.language,
                                    serviceid: arry,
                                    status: 1
                                };
                                return Servicelangfilt.find(ctx, { filter: ['id', 'serviceid', 'languageid', 'servicename', 'description', 'status'], query: wherecond })
                                    .then((resp) => {
                                        arr[i]["service"] = resp.data;
                                        return arr[i];
                                    })

                            });

                        let service_staff = await Staffhours.find(ctx, { filter: ['id', 'vendorstaffid', 'day',  'status'], query: { vendorstaffid: arr[i].id } })
                            .then((lan_res) => {
                                arr[i]["hours"] = lan_res.data;
                                return arr[i];
                            });
                        final.push(service_staff);
                    }
                    return final;
                }
                const vali = get_staff(ctx, arr);
                return vali.then((resy) => {
                    return this.requestSuccess('Staff found!', resy);

                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });

    },


    //To get vendor details
    get: function (ctx) {
        const array = [];
        let findvendor = {};
        findvendor['id'] = ctx.params.id;
        findvendor['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorfilt.findOne(ctx, { query: findvendor })
            .then((res) => {
                //TO Get categories of vendor
                async function get_category(ctx, arr) {

                    let total_array = [];
                    for (var i = 0; i < arr.length; i++) {

                        //to get language data of the vendor
                        let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["vendorname"] = lan_res.data[0].vendorname;
                                arr[i]["address"] = lan_res.data[0].vendoraddress;
                                return arr[i];
                            });
                        // to get vendor images
                        let vendor_image = await vendorimage.find(ctx, { filter: ['image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
                            .then((images) => {
                                arr[i]["images"] = images.data;
                                return arr[i];
                            });
                        total_array.push(language_val_filter);
                    }
                    return total_array;
                }
                let array = [];
                array.push(res.data);
                const vali = get_category(ctx, array);
                return vali.then((resy) => {
                    return this.requestSuccess("Vendor Detail", resy);
                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });
    },

    vendor_get: async function (ctx) {
        const array = [];
        let findvendor = {};
        findvendor['id'] = ctx.params.id;
        findvendor['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorfilt.find(ctx, { query: findvendor })
            .then((res) => {
                //TO Get categories of vendor
                async function get_category(ctx, arr) {
                    // log("Ssss",arr);
                    let total_array = [];
                    for (var i = 0; i < arr.length; i++) {
                        //to get language data of the vendor
                        let language_val_filter = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id, languageid: ctx.options.parentCtx.params.req.headers.language } })
                            .then((lan_res) => {
                                arr[i]["vendorname"] = lan_res.data[0].vendorname;
                                arr[i]["address"] = lan_res.data[0].vendoraddress;
                                return arr[i];
                            });

                        let language_val_filter1 = await vendorlangfilt.find(ctx, { query: { vendorid: arr[i].id } })
                            .then((lan_res) => {
                                arr[i]["language"] = lan_res.data;
                                return arr[i];
                            });
                        // to get vendor images
                        let vendor_image = await vendorimage.find(ctx, { filter: ['image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
                            .then((images) => {
                                arr[i]["images"] = images.data;
                                return arr[i];
                            });
                        let vendortimings = await vendortime.find(ctx, { filter: ['days', 'starttime', 'endtime', 'status'], query: { vendorid: arr[i].id} })
                            .then((time) => {
                                arr[i]["timings"] = time.data;
                                return arr[i];
                            });

                        let saloon_service = await Service.find(ctx, { filter: ['id'], query: { vendorid: arr[i].id, status: 1 } })
                            .then((res) => {
                                let serv_arr = [];
                                res.data.map((item) => {
                                    serv_arr.push(item.id);
                                })
                                arr[i]["services"] = serv_arr;
                                return arr[i];
                            });

                        let saloon_staff = await Staff.find(ctx, { filter: ['id'], query: { vendorid: arr[i].id, status: 1 } })
                            .then((res) => {
                                let staff_arr = [];
                                res.data.map((item) => {
                                    staff_arr.push(item.id);
                                })
                                arr[i]["staff"] = staff_arr;
                                return arr[i];
                            });
                            let ratingsData = await Review.find(ctx, { filter: ['id', 'name', 'vendorid', 'rating', 'review'], query: { vendorid: arr[i].id, status: 1, isreview: 1 } })
                            .then((res) => {
                                arr[i]['rating_review'] = res.data;
                                return arr[i];
                            })
                            let ratings_count = await Review.count(ctx,{
                                status: 1,
                                vendorid: arr[i].id
                            }).then((resy) => {
                                arr[i]['review_count'] = resy.data.toFixed(2);
                                return arr[i];
                            })
                            //,status:1,isreview:1
                            let ratings = await Review.find(ctx, { filter: ['id', 'name', 'vendorid', 'rating', 'review'], query: { vendorid: arr[i].id} })
                            .then((res) => {
                                var arrCnt = [];
                                const tes = res.data.filter(res1 => arrCnt.push(res1.rating));
                                arrCnt.reduce((a, b) => a + b, 0)
                                var finalout = arrCnt.reduce((a, b) => a + b, 0) > 0 ? arrCnt.reduce((a, b) => a + b, 0) / arrCnt.length : 0;
                                console.log(arrCnt.reduce((a, b) => a + b, 0), '===========rating', arrCnt.length, finalout)
                                arr[i]['rating_review_overalls'] = finalout.toFixed(2);
                                return arr[i];
                            })

                            if (ctx.params.userid) {
                                let vendorFavourite = await Favvendor.find(ctx, { filter: ['id', 'status', 'created_at'], query: { vendorid: arr[i].id, status: 1, userid : ctx.params.userid } })
                                    .then((fav) => {
                                        console.log('fav', fav.data)
                                        if (fav.data.length > 0) { arr[i]["favourite"] = 1; } else { arr[i]["favourite"] = 0; }
                                        return arr[i];
                                    });
                            }

                        total_array.push(language_val_filter);
                    }
                    return total_array;
                }
                let array = [];
                array.push(res.data);
                const vali = get_category(ctx, res.data);
                return vali.then((resy) => {
                    return this.requestSuccess("Vendor Detail", resy);
                })
            })
            .catch((err) => {
                if (err.name === 'Nothing Found')
                    return this.requestError(CodeTypes.NOTHING_FOUND);
                else
                    return this.requestError(err);
            });
    },

	vendor_dates: async function (ctx) {
		let dates = await db.sequelize.query("EXEC SP_GetVendorDates :vendorid",{replacements: {vendorid: ctx.params.id},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess('Vendor dates', dates && dates.length > 0 ? JSON.parse(dates[0].details) : []);
	},

    //************************************vendor Operational hours Creations ******************************** */
    timeupdate: async function (ctx) {
        return vendortime.updateBy(ctx, 1, {
            starttime: ctx.params.starttime,
            endtime: ctx.params.endtime,
            vendorstatus: ctx.params.vendorstatus
        }, {
            query: {
                id: ctx.params.id
            }
        })
            .then((res) => {
                return "vendor timings Updated";
            })

    },

    timestatus: async function (ctx) {
        return vendortime.updateById(ctx, ctx.params.id, {
            vendorstatus: ctx.params.vendorstatus
        })
            .then((res) => {
                return "vendor Status Updated";
            })
    },

    timeget: async function (ctx) {
        let findvendor = {};
        findvendor['vendorid'] = ctx.params.vendorid;
        return vendortime.find(ctx, { query: findvendor })
            .then((res) => {
                res.data.map((date) => {
                    let strDate = date.starttime;
                    let sarr = strDate.split(':');
                    let shour = parseInt(sarr[0]);
                    let smin = parseInt(sarr[1]);
                    let d1 = moment({
                        year: 2010, month: 3, day: 5,
                        hour: shour, minute: smin, second: 3, millisecond: 123
                    });
                    let endDate = date.endtime;
                    let earr = endDate.split(':');
                    let ehour = parseInt(earr[0]);
                    let emin = parseInt(earr[1]);
                    let d2 = moment({
                        year: 2010, month: 3, day: 5,
                        hour: ehour, minute: emin, second: 3, millisecond: 123
                    });
                    date.starttime = d1;
                    date.endtime = d2;
                });

                return res.data;
            })
            .catch((err) => {
                return err;
            })
    },

    images: async function (ctx) {
        let findvendor = {};
        findvendor['vendorid'] = ctx.params.vendorid;
        return vendorimage.find(ctx, { query: findvendor })
            .then((res) => {

                async function get_images(ctx, arr) {

                    let total_array = [];
                    for (var i = 0; i < arr.length; i++) {
                        let vendor_image = await vendorimage.find(ctx, { filter: ['image_url', 'vendorimagepath'], query: { vendorid: arr[i].id } })
                            .then((images) => {
                                return arr[i];
                            });
                        total_array.push(vendor_image);
                    }
                    return total_array;
                }
                const vali = get_images(ctx, res.data);
                return vali.then((resy) => {
                    return resy;
                })
            })
    },

    imageremove: async function (ctx) {
        return vendorimage.removeById(ctx, ctx.params.id)
            .then((res) => {
                return "Image Successfully Removed";
            })
    }
}
