"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const passwordHash = require('password-hash');
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const Sequ = require("sequelize");
const activity = require("../../../helpers/activitylog");
const db = require('../../../adapters/db');

//Models

const Admin = new Database("Madmin");
const Adminfilt = new Database("Madmin",[
    "id",
    "adminkey",
    "firstname",
    "lastname",
    "username",
    "password",
    "email",
    "usertypeid",
    "devicetype",
    "devicetoken",
    "status",
    "created_by",
    "created_at",
    "updated_at",
    "updated_by",
    "roleid",
    "prefix",
    "contactnumber"
]);
const Permission = new Database("Mpermission");
const Permissionfilt = new Database("Mpermission",[
    "id",
    "permissionkey",
    "roleid",
    "moduleid",
    "access",
    "status"
]);

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;


/**
 *
 * @annotation administrator
 * @permission create,update,remove
 * @whitelist getall,getone
*/
module.exports = {

    // Admin creation
    create: async function(ctx) {
      /*  console.log('ctx.meta' , ctx.meta);
        activity.getUser(ctx,ctx.meta.user.id,ctx.mete.user.usertypeid).then((res)=>{
            ctx.meta.username = res.data.email;
        });*/

        let findemail = {};
        findemail['email'] = ctx.params.email;
        return Adminfilt.find(ctx, { query: findemail }).then((res) => {
            if(res.data.length == 0 && ctx.params.password.localeCompare(ctx.params.confirmpassword) == 0)
            {
                return Adminfilt.insert(ctx,{
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    username: ctx.params.username,
                    password:passwordHash.generate(ctx.params.password,{algorithm: 'sha256'}),
                    email: ctx.params.email,
                    prefix: ctx.params.prefix,
                    contactnumber: ctx.params.contactnumber,
                    usertypeid:ctx.params.usertypeid,
                    status:ctx.params.status,
                    created_by: ctx.params.created_by,
                    roleid:ctx.params.roleid,
                    created_at : new Date()
                });
            }else{
                ctx.meta.log = "Attempt to added New Administration failed due to Invalid Email by Admin";
                activity.setLog(ctx);
                return this.requestError("Email is already exists!" , res );
            }
        }).then((res) => {
            ctx.meta.log = "New Administration Added by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("New Administration Added by Admin!",res);
        });
    },

    // Admin update
    update: async function(ctx) {
        /*activity.getUser(ctx,ctx.meta.user.id,ctx.mete.user.usertypeid).then((res)=>{
            ctx.meta.username = res.data.email;
        });*/
        let findemail = {};
        findemail['email'] = ctx.params.email;
        findemail['id'] = { [Op.ne]: ctx.params.id };
        return Adminfilt.find(ctx, { query: findemail }).then((res) => {
            if(res.data.length == 0 )
            {
                return Adminfilt.updateBy(ctx,1,{
                    firstname: ctx.params.firstname,
                    lastname: ctx.params.lastname,
                    username: ctx.params.username,
                    //password:passwordHash.generate(ctx.params.password,{algorithm: 'sha256'}),
                    email: ctx.params.email,
                    contactnumber: ctx.params.contactnumber,
                    prefix: ctx.params.prefix,
                    usertypeid:ctx.params.usertypeid,
                    status:ctx.params.status,
                    updated_by: ctx.params.created_by,
                    roleid:ctx.params.roleid,
                    updated_at : new Date()
                },{ query: {
                    id: ctx.params.id
                    }
                });
            }else{
                ctx.meta.log = "Attempt to added New Administration failed due to Invalid Email by Admin";
                activity.setLog(ctx);
                return this.requestError("Email is already exists!" , res );
            }
        }).then((res) => {
            ctx.meta.log = "Administration Updated successfully by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("Admin details updated successfully!",res);
        });
    },

    // Admin getall
    getall: function(ctx) {
        let condition = {};
        condition['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE }
        //let condition = {'created_by' : ctx.params.user_id};
        return Adminfilt.find(ctx , {query : condition }).then((res) => {
                return this.requestSuccess("Admin details updated successfully!",res);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    // Admin getall
    getone: function(ctx) {
        let condition = {'id' : ctx.params.id};
        return Adminfilt.find(ctx , {query : condition }).then((res) => {
            return this.requestSuccess("Admin details updated successfully!",res);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    admin_profile: function(ctx) {
        // activity.getUser(ctx,ctx.meta.user.id,ctx.mete.user.usertypeid).then((res)=>{
        //     ctx.meta.username = res.data.email;
        // });
        return Adminfilt.updateBy(ctx, 1, {
            firstname: ctx.params.firstname,
            lastname: ctx.params.lastname,
            email: ctx.params.email,
        }, { query: {
                id:ctx.params.id
            }
        })
        .then((res)=>{
            ctx.meta.log = "Admin Profile Updated successfully by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("Admin Updated", res.data);
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to Udated Admin Profile failed by Admin";
            activity.setLog(ctx);
            return this.requestError(err);
        });
    },


    remove: function(ctx) {
       /* activity.getUser(ctx,ctx.meta.user.id,ctx.mete.user.usertypeid).then((res)=>{
            ctx.meta.username = res.data.email;
        });*/
        return Adminfilt.updateBy(ctx, 1, {
            status:2
        }, { query: {
                id: ctx.params.id
            }
        })
        .then((res)=>{
            ctx.meta.log = "Attempt to Remove Adminisration Successfull by Admin";
            activity.setLog(ctx);
            return this.requestSuccess("Admin Deleted successfully", res.data);
        })
        .catch( (err) => {
            ctx.meta.log = "Attempt to Remove Adminisration failed by Admin";
            activity.setLog(ctx);
            return this.requestError(err);
        });
    },

    booking_counts: async function(ctx){
        let booking_counts = await db.sequelize.query("EXEC SP_BookingCountByPeriod", {type: Sequ.QueryTypes.SELECT});
        return this.requestSuccess("Booking Count", booking_counts);
    }

/*
    getall: function(ctx) {
        let findrole = {'created_by' : 1};
        return Adminfilt.find(ctx, { query: findrole })
        .then( (res) => {
                return this.requestSuccess("List of Administrator", res.data);

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
	},
*/

}
