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

//Models
const Roleuser = new Database("Mroleuser");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {

    // Role creation
    create: async function(ctx) {
		let findrole = {};
		findrole['roleid'] = ctx.params.roleid ;
		findrole['userid'] = ctx.params.userid ;
        findrole['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Roleuser.find(ctx, { query: findrole })
        .then((res) => {
            if (res.data.length === 0) {
                return Roleuser.insert(ctx, {
					roleid: ctx.params.roleid,
					userid: ctx.params.userid,
                    status: ctx.params.status
                })
                .then( (res) => {
                    return this.requestSuccess("Role Assigned", ctx.params.userid);
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
            }
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })

	},
	// getAll: function(ctx) {
    //     let findrole = {};
    //     findrole['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
    //     return Role.find(ctx, { query: findrole })
    //     .then( (res) => {
    //         return this.requestSuccess("List of Roles", res);
    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });

	// },
	//status updation for role
    status: function(ctx) {
        return  Roleuser.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Roleuser.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Status Changed", ctx.params.id);

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;

        });

	},
	// get: function(ctx) {
    //     let findrole = {};
    //     findrole['id'] = ctx.params.id;
    //     findrole['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
    //     return Role.find(ctx, { query: findrole })
    //     .then( (res) => {
	// 		return this.requestSuccess("Requested Role", res);
    //     })
    //     .catch( (err) => {
    //         if (err.name === 'Nothing Found')
    //             return this.requestError(CodeTypes.NOTHING_FOUND);
    //         else
    //             return this.requestError(err);
    //     });

    // },
	//Role update
    update: async function(ctx) {
        let findrole = {};
		findrole['id'] = ctx.params.id;
		findrole['userid'] = ctx.params.userid;
        findrole['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Roleuser.find(ctx, { query: findrole })
        .then ((res) => {
			console.log('rs',res);
            if (res.data.length > 0)
            {

				Roleuser.updateBy(ctx, 1, {
					roleid: ctx.params.roleid
				}, { query: {
					userid: ctx.params.userid,
					}
				})
                return this.requestSuccess("Role Updated", ctx.params.roleid);

            }
            else
            {
                return this.requestError(CodeTypes.NOTHING_FOUND);
            }
        })
        .catch( (err) => {
			console.log('err ',err);
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
    //Role delete is used change the status and not complete delete
    // remove: function(ctx) {
    //     return  Role.findOne(ctx, { query: {
    //         id: ctx.params.id
    //     }
    //     })
    //     .then ((res) =>{
    //         Role.updateBy(ctx, res.data.id, {
    //             status: 2
    //             }, { query: {
    //                 id: ctx.params.id
    //             }
    //         })
    //         return this.requestSuccess("Status Changed", ctx.params.id);

    //     })

    // }
}
