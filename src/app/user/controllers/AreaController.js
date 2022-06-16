"use strict";
// DEVELOPED ON 14-07-2020

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


//Models

const Area = new Database("Marea");
const Arealang = new Database("Marealang");
const Citylang = new Database("Mcitylang");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;


module.exports = {

    // City list with multiple language
    getall: function(ctx) {
        return Area.find(ctx, { filter:['id'],query: {
            cityid: ctx.params.cityid,
            status: 1,
        } })
        .then( (res) => {
            var arr = res.data;
            async function get_area(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let city_name = await Citylang.find(ctx, { filter:['cityname'],query: {cityid: ctx.params.cityid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["cityname"] = lan_res.data[0].cityname;
                        return arr[i];
                    })

                    let language_val = await Arealang.find(ctx, { filter:['areaname'],query: {areaid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["areaname"] = lan_res.data[0].areaname;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_area(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Area list", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
    
   //Particular City list in multiple language
    get: function(ctx) {
        let findarea = {};
        findarea['id'] = ctx.params.id;
        findarea['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Area.find(ctx, { query: findarea })
        .then( (res) => {
            var arr = res.data;
            async function get_area(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {

                    let city_name = await Citylang.find(ctx, { query: {cityid: arr[i].cityid,langshortname: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["cityname"] = lan_res.data[0].cityname;
                        return arr[i];
                    })

                    let language_val = await Arealang.find(ctx, { query: {areaid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_area(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Area", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    }
}
