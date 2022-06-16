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


//Models

const Country = new Database("Mcountry");
const CountryLang = new Database("Mcountrylang");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // country list with multiple language
    getall: function(ctx) {
        
        return Country.find(ctx, { filter:['id','countrycode','countryiso'],query: {
            status: 1
        } })
        .then( (res) => {
            var arr = res.data;
            async function get_country(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CountryLang.find(ctx, { filter:['countryname','countryshortname'],query: {countryid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_country(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of Countries", resy);
            })

        })
        .catch( (err) => {

            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    // //Particular country list in multiple language
    // get: function(ctx) {
    //     let findcountry = {};
    //     findcountry['id'] = ctx.params.id ;
    //     findcountry['status'] = 1;
    //     return Country.find(ctx, { filter:['id','countrycode','countryiso'],query: findcountry })
    //     .then( (res) => {
    //         var arr = res.data;
    //         async function get_country(ctx, arr) {
    //             let final = [];
    //             for(var i = 0;i<arr.length;i++) {
    //                 let language_val = await CountryLang.find(ctx, { filter:['countryname','countryshortname'],query: {countryid: arr[i].id}})
    //                 .then((lan_res)=>{
    //                     arr[i]["language"] = lan_res.data;
    //                     return arr[i];
    //                 })

    //                 final.push(language_val);
    //             }
    //             return final;
    //         }
    //         const vali =  get_country(ctx,arr);
    //         return vali.then((resy)=>{
    //             return this.requestSuccess("Requested Country", resy);
    //         })

    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });
    // },
}
