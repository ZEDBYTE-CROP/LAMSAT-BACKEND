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
const db = require('../../../adapters/db');


//Models
const favourite = new Database("Mfavourite");
const vendor = new Database("Mvendor");
const vendorfilt = new Database("Mvendor", [
    "id",
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
    "service_available"
]);
const vendorlang = new Database("Mvendorlang");
const vendorlangfilt = new Database("Mvendorlang",[
    "id",
    "languageid",
    "languageshortname",
    "vendorid",
    "vendorname",
    "vendordescription",
    "vendoraddress",
    "status"
]);
const vendorcategory = new Database("Mvendorcategory");
const vendorcategoryfilt = new Database("Mvendorcategory", [
    "id",
   "vendorid",
   "categoryid",
   "status"
]);
const vendorimage = new Database("Mvendorimage");
const vendorimagefilt = new Database("Mvendorimage", [
    'id',
    "vendorimagekey",
    "vendorid",
    "image_url",
    "vendorimagepath",
    "status"
]);
const Categorylangfilt = new Database("Mcategorylang", [
    "id",
    "mcategorylangkey",
    "languageid",
    "langshortname",
    "categoryid",
    "categoryname"
]);
const User = new Database("Muser");
//vendor tables and its fields
const vendortime =  new Database("Mvendorhours",[
    "id",
    "vendorhourskey",
    "vendorid",
    "days",
    "starttime",
    "endtime",
    "vendorstatus",
    "status"
]);
const Tokens = new Database("Mtoken");




//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // vendorstatus creation for defining the status of vendor
    create: async function(ctx) {

    },
    // vendorstatus list
    getvendors: async function(ctx) {
        let playersList = await db.sequelize.query('EXEC SP_NearVendor :latitude,:longitude,:languageid',{replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT});
        //return this.requestSuccess("Vendors List", playersList);
        async function get_fav(ctx, arr) {
            let total_array = [];
            for(let i = 0;i< arr.length;i++){
                let language_val_filter = await favourite.find(ctx, { query: {vendorid: arr[i].id,userid: ctx.meta.user.id}})
                .then((lan_res)=>{
                    if(lan_res.data.length != 0) {
                        arr[i]["favourite"] =  1;
                    }
                    else {
                        arr[i]["favourite"] = 0;
                    }
                    return arr[i];
                });

                let review_val = await db.sequelize.query('EXEC SP_Avgreview :vendorid',{replacements: {vendorid: arr[i].id},type: Sequ.QueryTypes.SELECT});
                arr[i]["reviews"] = review_val[0];

                total_array.push(language_val_filter);
            }
            return total_array;
        }
        var list = get_fav(ctx, playersList);

        return list.then((resy)=>{
            return this.requestSuccess("Vendor Detail", resy);
        })
    },

    //status updation
    status: function(ctx) {
    },
    //Particular vendorstatus list
    vendor_detail: function(ctx) {
        const array = [];
        let findvendor = {};
        findvendor['id'] = ctx.params.id;
        findvendor['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendorfilt.findOne(ctx, { query: findvendor })
        .then( (res) =>{
            //TO Get categories of vendor
            async function get_category(ctx, arr) {

                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
					var jim =  arr[i].paymentoption;
					if(jim) {
						const spil = jim.split(",");
                    	arr[i].paymentoption = spil;
					} else {
						arr[i].paymentoption = [];
					}
                    //to get language data of the vendor
                    let language_val_filter = await vendorlangfilt.find(ctx, { query: {vendorid: arr[i].id,languageshortname: ctx.options.parentCtx.params.req.headers.language}})
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
							if(typeof image === 'undefined') {
								image_arr.push(item.vendorimagepath);
							} else {
								const slice_image = image.slice(1);
								//item['vendorimages'] = slice_image;
								image_arr.push(slice_image);
							}
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

    //vendorstatus update (all fields are mandatory)
    update: function(ctx) {

    },

    //vendorstatus delete is used change the status and not complete delete
    remove: function(ctx) {
    }
}
