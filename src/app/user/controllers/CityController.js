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
const activity = require("../../../helpers/activitylog");
const db = require('../../../adapters/db');


//Models

const City = new Database("Mcity");
const Citylang = new Database("Mcitylang");
const Country = new Database("Mcountrylang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;


module.exports = {

	getall: async function(ctx) {
		let languageid = ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : 1;
		let CityList = await db.sequelize.query(`select mcountry.id, mcity.id, mcitylang.*
			from mcity left join mcitylang on
			mcity.id = mcitylang.cityid
			left join mcountry on
			mcountry.id = mcity.countryid
			where mcountry.id = ${ctx.params.countryid} and mcitylang.cityname IS NOT NULL and mcitylang.languageid = ${languageid}`);
			return this.requestSuccess("Requested City",CityList[0]);
	},

    // City list with multiple language for mobile app
    getall_old: function(ctx) {

        return City.find(ctx, { filter:['id'],query: {
            countryid: ctx.params.countryid,
            status: 1
        }})
        .then( (res) => {
            var arr = res.data;
            async function get_city(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let country_name = await Country.find(ctx, { filter:['countryname'],query: {countryid: ctx.params.countryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
						if(lan_res.data.length) {
							arr[i]["countryname"] = lan_res.data[0].countryname;
							return arr[i];
						}
                    })
                    let language_val = await Citylang.find(ctx, { filter:['cityname'],query: {cityid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
						console.log(lan_res);
						if(lan_res.data.length) {
							arr[i]["cityname"] = lan_res.data[0].cityname;
							return arr[i];
						}
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_city(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested City",resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

//    //Particular City list in multiple language
//     get: function(ctx) {
//         return City.find(ctx, { filter:['id'],query: {
//             countryid: ctx.params.countryid,
//             id: ctx.params.id,
//             status: 1
//         }})
//         .then( (res) => {
//             var arr = res.data;
//             async function get_city(ctx, arr) {
//                 let final = [];
//                 for(var i = 0;i<arr.length;i++) {
//                     let country_name = await Country.find(ctx, { filter:['countryname'],query: {countryid: ctx.params.countryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
//                     .then((lan_res)=>{
//                         arr[i]["countryname"] = lan_res.data[0].countryname;
//                         return arr[i];
//                     })
//                     let language_val = await Citylang.find(ctx, { filter:['cityname'],query: {cityid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
//                     .then((lan_res)=>{
//                         arr[i]["cityname"] = lan_res.data[0].cityname;
//                         return arr[i];
//                     })
//                     final.push(language_val);
//                 }
//                 return final;
//             }
//             const vali =  get_city(ctx,arr);
//             return vali.then((resy)=>{
//                 return this.requestSuccess("Requested City",resy);
//             })
//         })
//         .catch( (err) => {
//             if (err.name === 'Nothing Found')
//                 return this.requestError(CodeTypes.NOTHING_FOUND);
//             else
//                 return this.requestError(err);
//         });
//     },
}
