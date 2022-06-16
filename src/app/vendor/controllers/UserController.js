"use strict";
// DEVELOPED ON 14-07-2020

const jwt	= require("jsonwebtoken");
const passwordHash = require('password-hash');
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;
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
const db = require('../../../adapters/db');
const mail_template = __dirname;
const moment = require("moment");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Sequ = require("sequelize");
var googleAuth = require( './googleAuth.js' );
var facebookAuth = require( './facebookAuth.js' );
const { Console } = require("console");
const haversine =  require("haversine");
const otpGenerator =  require("otp-generator");
// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Logins = {
    security: ["id", "password", "usertypeid","email","isverified"],
    admin_security: ["id", "password", "usertypeid"],
    admin_security1: ["id", "password", "usertypeid"],
    encode: ["id", "usertypeid"],
    admin_encode: ["id", "usertypeid"]
};
const Filters_Tokens = {
	empty: ["id","login_type"]
};

const JWT_SECRET = "TOP SECRET!!!";

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
const User_filter = new Database("Muser",[
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
const Categorylang = new Database("Mcategorylang");
const Favvendor = new Database("Mfavourite");
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const vendorcategory = new Database("Mvendorcategory");
const vendorimage = new Database("Mvendorimage");
const Tokens = new Database("Mtoken");
const Citylang = new Database("Mcitylang");
const CountryLang = new Database("Mcountrylang");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE



module.exports = {

    get: function(ctx) {
        const array = [];
        let findvendor = {};
        findvendor['id'] = ctx.params.id;
        findvendor['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendor.findOne(ctx, { query: findvendor })
        .then( (res) =>{
            //TO Get categories of vendor
            async function get_category(ctx, arr) {
               
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    const split_image = arr[i].photopath.split("__uploads");
                    const image = split_image[1];
                    const slice_image = image.slice(1);
                    arr[i]['photopath'] = slice_image;
                    //image_arr.push(slice_image);                    
               
                    //to get language data of the vendor
                    let language_val_filter = await vendorlang.find(ctx, { query: {vendorid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                    arr[i]["vendorname"] = lan_res.data[0].vendorname;
                    arr[i]["address"] = lan_res.data[0].vendoraddress;
                        return arr[i];
                    });
                    // to get vendor images
                    let vendor_image = await vendorimagefilt.find(ctx, { query: {vendorid: arr[i].id}})
                    .then((images)=>{
                        let image_arr = [];
                        images.data.map((item) => {
                            const split_image = item.vendorimagepath.split("__uploads");
                            const image = split_image[1];
                            const slice_image = image.slice(1);
                            //item['vendorimages'] = slice_image;
                            image_arr.push(slice_image);
                        });
                        arr[i]["images"] = image_arr;
                        return arr[i];
                    });
                    total_array.push(language_val_filter);
                }
                return total_array;
            }
            let array = [];
            array.push(res.data);
            const vali =  get_category(ctx,array);
            return vali.then((resy)=>{
                return this.requestSuccess("Vendor Detail", resy);;
            })
        } )
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    getall: function(ctx) {
        const array = [];
        let findUser = {};
        findUser['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Userfilt.find(ctx, { query: findUser })
        .then( (res) =>{
            async function get_favvendor(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get Fav vendors of the user
                    let fav_vendor = await Favvendorfilt.find(ctx, { query: {userid:arr[i].id}})
                    .then((response)=>{
                        let vendor_id = [];
                    response.data.map((item) => {
                        vendor_id.push(item.vendorid);
                    });
                        arr[i]["fav_vendors"] = vendor_id;
                        return arr[i];
                    })

                    total_array.push(fav_vendor);
                    }
                    return total_array;
                }
            const vali =  get_favvendor(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Users",resy);
            })
        } )
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    favuser_count: function(ctx) {

        return this.verifyIfLogged(ctx)
            .then( () => Tokens.count(ctx, {
                userId: ctx.meta.user.id
            }))
            .then( (res) => this.requestSuccess("Count Complete", res.data) )
            .catch( (err) => {
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
    },

    favuser: function(ctx){
        return Favvendor.find(ctx, { filter:['vendorid'],query: {userid:ctx.params.userid}})
        .then((res)=>{
            var vendor_array = [];
            res.data.map((ven_id)=>{
                vendor_array.push(ven_id.vendorid);
            })
            let wherecond = {
                status: 1,
                id: vendor_array
            };
            return vendor.find(ctx, { query: wherecond})
            .then((response)=>{
                async function get_hoteldetails(ctx, arr) {

                    let total_array = [];
                    for(var i = 0;i<arr.length;i++) {
                        //to get language data of the hotel
                        let language_val_filter = await vendorlang.find(ctx, { query: {vendorid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                        .then((lan_res)=>{
                            arr[i]["vendorname"] = lan_res.data[0].vendorname;
                            arr[i]["vendoraddress"] = lan_res.data[0].vendoraddress;
                            arr[i]["vendordescription"] = lan_res.data[0].vendordescription;
                            return arr[i];
                        });
                        if((arr[i].photopath.search("__uploads") != -1) && ((arr[i].photopath.search(".png") != -1)||(arr[i].photopath.search(".jpeg") != -1) || (arr[i].photopath.search(".jpg") != -1))){
                            let image_obj = {};
                            const split_image = arr[i].photopath.split("__uploads");
                            const image = split_image[1];
                            const slice_image = image.slice(1);   
                            arr[i]['photopath'] = slice_image;
                        }

                        let review_val = await db.sequelize.query('EXEC SP_Avgreview :vendorid',{replacements: {vendorid: arr[i].id},type: Sequ.QueryTypes.SELECT});
                        if(review_val[0])
                        {
                            arr[i]["reviews"] = review_val[0];
                        }
                        else {
                            var review = {
                                'count': 0,
                                'rating':0
                            };
                            arr[i]['reviews'] = review;                          
                        }       
                        var cat_arr = arr[i].categoryid.split(",");
                        var wherecondition = {
                            categoryid: cat_arr,
                            languageid: ctx.options.parentCtx.params.req.headers.language,
                            status: 1
                        }
                        let category_lan = await Categorylang.find(ctx,{filter:['categoryid','categoryname'],query:wherecondition})
                        .then((res)=>{
                            arr[i]['categories'] = res.data;
                        })
                        total_array.push(language_val_filter);
                    }
                    return total_array;
                }
    
                const vali =  get_hoteldetails(ctx,response.data);
                return vali.then((resy)=>{
                    return resy;
                })
            })            
        })
    },
}
