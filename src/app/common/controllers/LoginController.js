"use strict";

const CodeTypes = require("../../../fixtures/error.codes");
const Config = require("../../../../config");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const { MoleculerError } 	= require("moleculer").Errors;
const activity = require("../../../helpers/activitylog");
const Op = require('sequelize').Op;
const { LoginTicket } = require("google-auth-library");
const SPLIT_EMAIL = Config.get('/PAYMENT/SPLIT_PAY/EMAIL');
const SPLIT_PASS  = Config.get('/PAYMENT/SPLIT_PAY/PASSWORD');
const REQ_URL = Config.get('/PAYMENT/SPLIT_PAY/HOST');
const request = require('request');

// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Users = {
	full: ["id", "username", "password", "usertypeid"],
	role: ["id", "usertypeid"],
	restricted: ["username"],
    unrestricted: ["username"],
};
const Filters_Tokens = {
	empty: ["id"]
};


const {
	DELETE,
	ACTIVE,
    INACTIVE,
    ADMIN_ROLE,
    USER_ROLE
} = Constants;
const Roles = [ADMIN_ROLE, USER_ROLE];

//Models

const User = new Database("Muser");
const Admin = new Database("Madmin");
const Vendor = new Database("Mvendor");
const Module = new Database("Mrolemodule");
const Permission = new Database("Mpermission");
const Role = new Database("Mrole");
const Roleuser = new Database("Mroleuser");
const Splitpay = new Database("Msplitpayauth");

let admins = {
    username: 'admin@lamsat.com.sa',
    password: 'adminlamsat'
};

let modules = [
	{modulename:"role",status:1},
	{modulename:"user",status:1},
	{modulename:"category",status:1},
	{modulename:"country",status:1},
	{modulename:"appconfig",status:1},
	{modulename:"cms",status:1},
	{modulename:"vendor",status:1},
	{modulename:"sms",status:1},
	{modulename:"smtp",status:1},
	{modulename:"faq",status:1},
	{modulename:"city",status:1},
	{modulename:"administration",status:1},
	{modulename:"area",status:1},
	{modulename:"service",status:1},
	{modulename:"voucher",status:1},
	{modulename:"booking",status:1},
	{modulename:"roleuser",status:1},
	{modulename:"module",status:1},
	{modulename:"activitylog",status:1},
	{modulename:"dashboard",status:1}
];
let roles = {
	rolename: "Admin",
};
/**
 *
 * @annotation Login
 * @permission get,user_changePassword,hotel_changePassword,remove
 * @whitelist get
 */
module.exports = {
    create: function(ctx) {
        // return this.generateHash(ctx.params.password)
        //     .then( (res) => Login.insert(ctx, {
        //         username: ctx.params.username,
        //         password: res.data
        //     }))
        //     .then( () => this.requestSuccess("Login Account Created", ctx.params.username) )
        //     .catch( (err) => {
        //         if (err.name === 'Database Error' && Array.isArray(err.data)){
        //             if (err.data[0].type === 'unique' && err.data[0].field === 'username')
        //                 return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
        //         }

        //         return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    getAll: function(ctx) {

        // return this.verifyIfLogged(ctx)
        //     .then( () => Login.find(ctx, { }) )
        //     .then( (res) => this.requestSuccess("Search Complete", res.data) )
        //     .catch( (err) => {
        //         if (err.name === 'Nothing Found')
        //             return this.requestError(CodeTypes.NOTHING_FOUND);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    get: function(ctx) {

        // return this.verifyIfLogged(ctx)
        //     .then( () => Login.findOne(ctx, {
        //         query: {
        //             username: ctx.params.username
        //         },
        //         filter: (ctx.params.username === ctx.meta.login.username) ? Filters_Users.unrestricted : Filters_Users.restricted
        //     }))
        //     .then( (res) => this.requestSuccess("Search Complete", res.data) )
        //     .catch( (err) => {
        //         if (err.name === 'Nothing Found')
        //             return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    count: function(ctx) {

        // return Login.count(ctx, { })
        //     .then( (res) => this.requestSuccess("Count Complete", res.data) )
        //     .catch( (err) => this.requestError(CodeTypes.UNKOWN_ERROR) );
    },

    changeInfo: function(ctx) {

        // return this.verifyIfLogged(ctx)
        //     .then( () => Login.updateById(ctx, ctx.meta.login.id, {
        //         age: ctx.params.age
        //     }))
        //     .then( (res) => this.requestSuccess("Changes Saved", true) )
        //     .catch( (err) => this.requestError(CodeTypes.UNKOWN_ERROR) );
    },

    user_changePassword: function(ctx) {
		activity.getVendorUser(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
            return this.verifyIfLogged(ctx)
                .then( () => ctx.call("auth.verifyuser_change_Password", { id: ctx.params.id, password: ctx.params.oldpassword}))
                .then( () => this.generateHash(ctx.params.newpassword) )
                .then( (res) => {
                    if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
                        User.updateById(ctx, ctx.meta.user.id, {
                        password: res.data
						})
						ctx.meta.log = 'Password changed';
						activity.setLog(ctx);
                    }
                    else {
						ctx.meta.log = 'Invalid old password';
						activity.setLog(ctx);
                        return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
                    }
                })
                .then( () => ctx.call("auth.closeAllSessions"))
                .then( () => this.requestSuccess("Changes Saved", true) )
                .catch( (err) => {
					ctx.meta.log = 'Attepmt to change password failed';
					activity.setLog(ctx);
                    if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                });
    },

    vendor_changePassword: function(ctx) {
		activity.getVendor(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
        return this.verifyIfLogged(ctx)
            .then( () => ctx.call("auth.verifyvendor_change_Password", { id: ctx.params.id, password: ctx.params.oldpassword}))
            .then( () => this.generateHash(ctx.params.newpassword) )
            .then( (res) => {
                if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
                    Vendor.updateById(ctx, ctx.meta.user.id, {
                    password: res.data
					});
					ctx.meta.log = 'Password changed';
					activity.setLog(ctx);
                }
                else {
					ctx.meta.log = 'Invalid old password';
					activity.setLog(ctx);
                    return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
                }
            })
            .then( () => ctx.call("auth.closeAllSessions"))
            .then( () => this.requestSuccess("Changes Saved", true) )
            .catch( (err) => {
				ctx.meta.log = 'Attepmt to change password failed';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
},



    changeRole: function(ctx) {

        // return this.verifyIfAdmin(ctx)
        //     .then( () => this.verifyRole(ctx.params.role) )
        //     .then( () => {
        //         if ((ctx.meta.login.username === ctx.params.username) && (ctx.params.is_admin !== ADMIN_ROLE))
        //             return this.isLastAdmin(ctx)
        //                 .then( (res) => {
        //                     if (res.data === false)
        //                         return Promise.resolve(true);
        //                     else
        //                         return this.requestError(CodeTypes.USERS_FORBIDDEN_REMOVE);
        //                 });
        //         else
        //             return Promise.resolve(true);
        //     })
        //     .then( () => Login.findOne(ctx, {
        //         query: {
        //             username: ctx.params.username
        //         },
        //         filter: Filters_Users.role
        //     }))
        //     .then( (res) => Tokens.removeMany(ctx, {
        //         userId: res.data.id
        //     }))
        //     .then( () => Login.updateMany(ctx, {
        //         username: ctx.params.username
        //     }, {
        //         is_admin: ctx.params.is_admin
        //     }))
        //     .then( () => this.requestSuccess("Changes Saved", true) )
        //     .catch( (err) => {
        //         if (err instanceof MoleculerError)
        //             return Promise.reject(err);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    remove: function(ctx) {

        // return this.verifyIfLogged(ctx)
        //     .then( () => this.isLastAdmin(ctx) )
        //     .then( (res) => {
        //         if (res.data === false)
        //             return Promise.resolve(true);
        //         else
        //             return this.requestError(CodeTypes.USERS_FORBIDDEN_REMOVE);
        //     })
        //     .then( () => ctx.call("auth.verifyPassword", { username: ctx.meta.login.username, password: ctx.params.password}))
        //     .then( () => ctx.call("auth.closeAllSessions") )
        //     .then( () => Login.removeById(ctx, ctx.meta.login.id))
        //     .then( () => this.requestSuccess("Delete Complete", true) )
        //     .catch( (err) => {
        //         if (err instanceof MoleculerError)
        //             return Promise.reject(err);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    banish: function(ctx) {

        // return this.verifyIfAdmin(ctx)
        //     .then( () => Login.findOne(ctx, {
        //         query: {
        //             username: ctx.params.username
        //         },
        //         filter: Filters_Users.role
        //     }))
        //     .then( (res) => {
        //         if (res.data.role !== ADMIN_ROLE)
        //             return Tokens.removeMany(ctx, {
        //                     userId: res.data.id
        //                 })
        //                 .then( () => Login.removeMany(ctx, {
        //                     username: ctx.params.username
        //                 }));
        //         else
        //             return this.requestError(CodeTypes.USERS_FORBIDDEN_REMOVE);
        //     })
        //     .then( () => this.requestSuccess("Delete Complete", true) )
        //     .catch( (err) => {
        //         if (err instanceof MoleculerError)
        //             return Promise.reject(err);
        //         else if (err.name === 'Nothing Found')
        //             return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },

    removeAll: function(ctx) {

        // return this.verifyIfAdmin(ctx)
        //     .then( () => ctx.call("auth.verifyPassword", { username: ctx.meta.login.username, password: ctx.params.password}))
        //     .then( () => Tokens.removeAll(ctx) )
        //     .then( () => Login.removeAll(ctx) )
        //     .then( () => ctx.call("login.createAdminIfNotExists"))
        //     .then( () => this.requestSuccess("Delete Complete", true) )
        //     .catch( (err) => {
        //         if (err instanceof MoleculerError)
        //             return Promise.reject(err);
        //         else
        //             return this.requestError(CodeTypes.UNKOWN_ERROR);
        //     });
    },
	insertModles:function(ctx) {
		return Module.count(ctx, {
			    status: 1
		}).then((res)=>{
			if(res.data == 0) {
				return modules.map((value) => {
					Module.insert(ctx,value)
				});
			}
		})
	},
	getAllModule: function(ctx) {
        let findmodule = {};
        findmodule['status'] =  { [Op.ne]: DELETE };
        return Module.find(ctx, { query: findmodule })
        .then( (res) => {
            var arr = res.data;
            return arr;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    createAdminIfNotExists: function(ctx) {

		ctx.call("login.insertModles").then(() => {
			return Role.count(ctx, {
				rolename: roles.rolename
			}).then((res)=>{
				if (res.data === 0)
				{
				return Role.insert(ctx, {
						rolename: roles.rolename,
						status: 1
					})
					.then((resy)=>{
						return this.generateHash(admins.password)
						.then( (res) => {
							return Admin.insert(ctx, {
								username: admins.username,
								password: res.data,
								email: admins.username,
								usertypeid: resy.data.id
							})
							.then((res1) => {
								return Roleuser.insert(ctx, {
									roleid: resy.data.id,
									userid: res1.data.id,
									status:1
								})
								.then((dat) => {
									let findmodule = {};
									findmodule['status'] =  { [Op.ne]: DELETE };
									return Module.find(ctx, { query: findmodule })
									.then( (res) => {
										var arr = res.data;
										return arr.map((module) => {
											return Permission.insert(ctx, {
												roleid: resy.data.id,
												moduleid: module.id,
												access: 1,
												read: 1,
												create: 1,
												update: 1,
												delete: 1,
												status:1
											})
										})
									})
									.catch( (err) => {
										if (err.name === 'Nothing Found')
											return this.requestError(CodeTypes.NOTHING_FOUND);
										else
											return this.requestError(CodeTypes.UNKOWN_ERROR);
									});
								})
								.catch((err) => {
									console.log('Roluser insert failed',err)
								})

							})
						})
					})
				}
			})
			.then( () => this.requestSuccess("Admin Exists", true) )
			.catch( (err) => {
				return this.requestError(CodeTypes.UNKOWN_ERROR)
			} );
		})
	},

	splitpaylogin: async function(ctx) {
		let findkey = {};findkey["status"]=1;
		return Splitpay.find(ctx,{ query: findkey }).then((res) => {
			if(res.data.length === 0) {
				return new Promise(function (resolve,reject) {
					let Res = {}
					let data = {
						"email":SPLIT_EMAIL,
						"password":SPLIT_PASS
					};
					request({
						method: 'POST',
						url: `${REQ_URL}login`,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						},
						body: JSON.stringify(data)
						}, function (error, response, body) {
						if(error) {
							reject(error);
						}
							resolve(response);
						});
				}).then((res) => {
					var that = this;
					let RES = JSON.parse(res.body);
					let AUTH_TOKEN = '';
					if(RES.status) {
						AUTH_TOKEN = RES.data.accessToken;
					}
					console.log('------',AUTH_TOKEN);
					return Splitpay.insert(ctx, {
						provider:'SPLIT',
						token:AUTH_TOKEN,
						status:1
					}).then((res) => {
						console.log('auth sucessfull.');
					}).catch((err) => {
						console.log('Insert error',err);
					})
				}).catch((err) => {
					console.log('err------',err);
				})
			}
		}).catch((err) => {
			console.log('err--->',err);
		})
	},
}
