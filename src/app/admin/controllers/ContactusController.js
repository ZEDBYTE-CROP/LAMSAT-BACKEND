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

const Contactus = new Database("Mcontactus");


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation contactus
 * @permission create,status,remove,get
 * @whitelist getall
 */
module.exports = {

    // Country creation with multiple language
    create: async function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return Contactus.insert(ctx, ctx.params)
        .then( (res) => {
            ctx.meta.log = "Enquiry Added by Admin";
			activity.setLog(ctx);
            return this.requestSuccess("Enquiry Registered");
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to add new enquiry failed by admin";
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


    },
    // country list with multiple language
    getall: function(ctx) {
        let findcoupon = {};
        findcoupon['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Contactus.find(ctx, { query: findcoupon })
        .then( (res) => {
            return this.requestSuccess("Enquiry List",res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //status updation for country in both language
    status: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Contactus.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            ctx.meta.log = "Enquiry Status updated successfully";
			activity.setLog(ctx);
            return Contactus.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                return this.requestSuccess("Status Updated Successfully");
            })
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to update enquiry status failed by user";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });

    },
    //Particular Contactus list in multiple language
    get: function(ctx) {
        return  Contactus.findOne(ctx, { query: {
            id: ctx.params.id,
        }
        })
        .then((res)=>{
            return  this.requestSuccess("Requested Enquiry", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(err);
            }
        })
    },

    //Contactus delete is used change the status and not complete delete
    remove: function(ctx) {
        activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  Contactus.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            return Contactus.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            .then((res)=>{
                ctx.meta.log = "Enquiry deleted successfully by admin";
				activity.setLog(ctx);
                return this.requestSuccess("Enquiry Deleted");
            })
    })

    }
}
