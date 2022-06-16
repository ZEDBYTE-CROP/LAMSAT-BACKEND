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

const Bookingaddress = new Database("Mbookingaddress");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;


module.exports = {

    create: async function(ctx) {
        return Bookingaddress.insert(ctx, {
            userid: ctx.params.userid,
            fullname: ctx.params.fullname,
            country: ctx.params.country,
            city: ctx.params.city,
            flatno: ctx.params.flatno,
            landmark: ctx.params.landmark,
            address: ctx.params.address,
            mobile: ctx.params.mobile,
            postal: ctx.params.postal
        })
        .then( (res) => {          
            return this.requestSuccess("Bookingaddress Created");
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

    },
    // Bookingaddress list 
    getall: function(ctx) {
        return Bookingaddress.find(ctx, { query: {
            status: 1,
        } })
        .then( (res) => {
            return this.requestSuccess("List of Bookingaddress", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
    
   //Particular Bookingaddress list
    get: function(ctx) {
        let findbookingaddress = {};
        findbookingaddress['id'] = ctx.params.id;
        findbookingaddress['status'] = 1;
        return Bookingaddress.find(ctx, { query: findbookingaddress })
        .then( (res) => {
            return this.requestSuccess("List of Bookingaddress", res.data);            
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },
  
    //City update 
    update: async function(ctx) {
		
        return Bookingaddress.updateBy(ctx, 1, {
            userid: ctx.params.userid,
            fullname: ctx.params.fullname,
            country: ctx.params.country,
            city: ctx.params.city,
            flatno: ctx.params.flatno,
            landmark: ctx.params.landmark,
            address: ctx.params.address,
            mobile: ctx.params.mobile,
            postal: ctx.params.postal
        }, { query: {
                id: ctx.params.id
            }
        })
        .then((res)=>{
            return this.requestSuccess("Booking Address Updated");
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
    //City delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Bookingaddress.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Bookingaddress.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                return this.requestSuccess("Status Changed", ctx.params.id);
            })
        })
    }
    
}
