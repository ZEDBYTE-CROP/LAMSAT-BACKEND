"use strict";

const jwt	= require("jsonwebtoken");
const passwordHash = require('password-hash');
const { pick } = require("lodash");
const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;
const path = require("path");
const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const Op = require('sequelize').Op;
const CodeTypes = require("../../../fixtures/error.codes");
const Config = require("../../../../config");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const otpGenerator =  require("otp-generator");
const mail_template = __dirname;
var annotations = require('annotations');
var googleAuth = require( './googleAuth.js' );
var facebookAuth = require( './facebookAuth.js' );
const { Console } = require("console");

// Filters applied when searching for entities
// Elements correspond to the columns of the table
const Filters_Logins = {
    security: ["id", "password", "usertypeid","email","isverified"],
    admin_security: ["id", "password", "usertypeid","isverified"],
    admin_security1: ["id", "password", "usertypeid"],
    encode: ["id", "usertypeid","isverified"],
    admin_encode: ["id", "usertypeid","isverified"]
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
const Userfilt = new Database("Muser",[
    "id",
    "userkey",
    "firstname",
    "lastname",
    "email",
    "contactnumber",
    "cityid",
    "countryid",
    "usertypeid",
    "socialtypeid",
    "socialkey",
    "devicetype",
    "devicetoken",
    "status"
]);
const Vendor = new Database("Mvendor");
const Vendorfilt = new Database("Mvendor");
const Vendorimagefilt = new Database("Mvendorimage", [
    'id',
    "vendorimagekey",
    "vendorid",
    "image_url",
    "vendorimagepath",
    "status"
]);
const Tokens = new Database("Mtoken", Filters_Tokens.empty);
const Admin = new Database("Madmin");;
const Language = new Database("Mlanguage");
const Vendorlang = new Database("Mvendorlang");
const Role = new Database("Mrole");


/**
 *
 * @annotation Auth
 * @permission admin_profile,vendor_list,vendor_pending_list,vendor_request,changepassword,app_configupdate,app_details
 * @whitelist countSessions,logout,admin_profile,vendor_list,vendor_pending_list,closeAllSessions,forgetpassword
 */

module.exports = {
    login: function(ctx) {
		ctx.meta.username = ctx.params.username;
        return ctx.call("auth.verifyPassword", { username: ctx.params.username, password: ctx.params.password })
            .then( (res) => {
				console.log('----',res);
                return this.generateToken(res.data)
                    .then( (res2) => {
                        return Tokens.insert(ctx, {
                                userId: res.data.id,
                                login_type: "administration",
                                token: res2
                            })
                            .then( (resy) => {
                                let final_output = [];
                                return  Admin.findOne(ctx, { query: {
                                    id: res.data.id
                                }
                                })
                                .then((res)=>{
									res.data["login_type"] = "administration";
									final_output.push(res.data);
									ctx.meta.log = 'Logged in successfully';
									activity.setLog(ctx);
                                    return this.requestSuccess("Login Success", res2, final_output);
                                })

                            })
                    })
            })
            .catch( (err) => {
				if (err instanceof MoleculerError) {
					ctx.meta.log = 'Invalid Crendentials';
					activity.setLog(ctx);
					return Promise.reject(err);
				} else {
					ctx.meta.log = CodeTypes.USERS_NOTHING_FOUND;
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
				}
            });
    },
    //change password for admin
    changepassword: function(ctx) {

		activity.getAdmin(ctx,ctx.params.id).then((res) =>{
			ctx.meta.username = res.data.username;
			// console.log(activityData);
		});
            return this.verifyIfLogged(ctx)
                .then( () => ctx.call("auth.verify_change_Password", { id: ctx.params.id, password: ctx.params.oldpassword,newpassword: ctx.params.newpassword}))
                .then( () => this.generateHash(ctx.params.newpassword) )
                .then( (res) => {
                    if (ctx.params.newpassword.localeCompare(ctx.params.confirmpassword) == 0) {
                        Admin.updateById(ctx, ctx.params.id, {
                        password: res.data
						})
						ctx.meta.log = 'Password changed';
						activity.setLog(ctx);
                    }
                    else {
						ctx.meta.log = 'Invalid old password';
						activity.setLog(ctx);
                        return this.requestError(CodeTypes.USERS_PASSWORD_MATCH)
                    }
                })
               // .then( () => ctx.call("auth.closeAllSessions"))
                .then( () => this.requestSuccess("Changes Saved", true) )
                .catch( (err) => {
                    if (err instanceof MoleculerError) {
						ctx.meta.log = 'Invalid change password data';
						activity.setLog(ctx);
                        return Promise.reject(err);
					} else {
						ctx.meta.log = 'Database error';
						activity.setLog(ctx);
						return this.requestError(CodeTypes.UNKOWN_ERROR);
					}
            });
    },

    // Reset Password for Admin with mail forward
    forgetpassword: function(ctx) {
        //Random password generation
        var random_password = otpGenerator.generate(6,{ upperCase: false, specialChars: false, alphabets: false});
        return Admin.find(ctx, { query: {
                email: ctx.params.email,
                status: { [Op.ne]: DELETE }
             }})
             .then((response) => {
				 //console.log('pass ',random_password);
                 if(response.data)
                    //generateHash gives encrypted password
                    return this.generateHash(random_password)
                        .then((res) => {
                                return Admin.updateBy(ctx, 1,
                                    { password : res.data }, { query: {
                                    id: response.data[0].id
                            }})
                            .then((result) => {
                                let readHTMLFile = function(path, callback) {
                                    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            callback(null, html);
                                        }
                                    });
                                };

                                readHTMLFile(mail_template + "/Requesttemplate.html", function(err, html) {

                                        let template = handlebars.compile(html);
                                        let replacements = {
                                            username: response.data[0].username,
                                            password: random_password
                                        };
                                        const htmlToSend = template(replacements);

                                     ctx.call("mail.send", {
                                        to: ctx.params.email,
                                        subject: "Forget Password Details",
                                        html: htmlToSend
                                    }).then((res) => {
                                        return "Email send Successfully";
                                    })
                                })
                                return "Password Resetted Please Check Email"
                            })
                        })
                    else
                        return this.requestError(CodeTypes.ALREADY_EXIST);
                }).catch( (err) => {
                    if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
                });
    },

    user_login: async function(ctx) {

        if(ctx.params.socialtypeid == 1 && ctx.params.socialkey != "") {

            return googleAuth.getUser( ctx.params.socialkey )
            .then( response => {

                var userDetails = {
                    username: response.id,
                    password: response.id,
                    firstname: response.name,
                    confirmpassword: response.id,
                    socialtypeid: ctx.params.socialtypeid,
                    email: response.email,
                };

                return ctx.call("user.verifyUsername", { username: response.id, userDetails: userDetails })
                .then( (userId) => {
                    var user = {
                        id: userId,
                        username: response.id,
                        usertypeid: 2,
                        iat: 1596987716
                    };

                    this.logger.info(")))))))))))))))))))) 444444444");
                    this.logger.info(user);
                    this.logger.info(")))))))))))))))))))) 444444444");

                    return this.generateToken(user)
                        .then( (res2) => {



                            this.logger.info("))))))))))))))))))))");
                            this.logger.info(userId);
                            this.logger.info("))))))))))))))))))))");


                            return Tokens.insert(ctx, {
                                    userId: userId,
                                    token: res2
                                })
                            .then( () => {
								ctx.meta.username = userDetails.email;
								ctx.meta.log = 'Successfully logged in with google';
								activity.setLog(ctx);
                                var details = {
                                    name: "User Login Success",
                                    data: res2,
                                    code: 200
                                };
                                return details;
                            });
                    }).then( user => { return user; } );
                });
            }).catch( (err) => {
				ctx.meta.username = ctx.params.socialkey;
				ctx.meta.log = 'Log in failed with google';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else {
                    this.logger.info(err);
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
                }
            });
        } else if(ctx.params.socialtypeid == 2 && ctx.params.socialkey != "") {
            return facebookAuth.getUser( ctx.params.socialkey )
            .then( response => {

                var user = {
                    id: 6,
                    username: response.id,
                    usertypeid: 2,
                    iat: 1596987716
                };
                return this.generateToken(user)
                    .then( (res2) => {

                        return Tokens.insert(ctx, {
                                userId: 100,
                                token: res2
                            })
                        .then( () => {
							ctx.meta.username = user.username;
							ctx.meta.log = 'Successfully logged in with facebook';
							activity.setLog(ctx);
                            var details = {
                                name: "User Login Success",
                                data: res2,
                                code: 200
                            };
                            return details;
                        });
                    }).then( user => { return user; } );
            }).catch( (err) => {
				ctx.meta.username = ctx.params.socialkey;
				ctx.meta.log = 'Log in failed with facebook';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else {
                    this.logger.info(err);
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
                }
            });
        } else {

            return ctx.call("auth.user_verifyPassword", { email: ctx.params.email, password: ctx.params.password })
        .then( (res) => {

            return this.generateToken(res.data)
                .then( (res2) => {

                    return Tokens.insert(ctx, {
                            userId: res.data.id,
                            token: res2
                        })
                        .then( () => {
                            let final_output = [];
                                return  Userfilt.findOne(ctx, { query: {
                                    id: res.data.id
                                }
                                })
                                .then((res)=>{
									ctx.meta.username = ctx.params.email;
									ctx.meta.log = 'Successfully logged in';
									activity.setLog(ctx);
                                    final_output.push(res.data);
                                    return this.requestSuccess("Login Success", res2, final_output)
                                })
                        });
                })
        })
        .catch( (err) => {
			ctx.meta.username = ctx.params.email;
			ctx.meta.log = 'Attempt to login failed';
			activity.setLog(ctx);
            if (err instanceof MoleculerError) {
                return Promise.reject(err);
            }
            else {
                ctx.meta.log = CodeTypes.USERS_NOTHING_FOUND;
					activity.setLog(ctx);
					return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            }
        });
        }
    },

    // Reset Password for User with mail forward
    user_resetPassword: function(ctx) {

        //Random password generation
        const str = Math.random() * 100000;
        const stmr = str.toString();
        const rande = stmr.split(".");
        return User.find(ctx, { query: {
                email: ctx.params.email
             }})
             .then((response) => {
                if(response.data) {
					//generateHash gives encrypted password
					//console.log('user pass: ',rande[0]);
                    return this.generateHash(rande[0])
                        .then((res) => {
                                return User.updateBy(ctx, 1,
                                    { password : res.data }, { query: {
                                    id: response.data[0].id
                            }})

                            .then((result) => {
								ctx.meta.username = ctx.params.email;
								ctx.meta.log = 'Password has been reseted';
								activity.setLog(ctx);
                                let readHTMLFile = function(path, callback) {
                                    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            callback(null, html);
                                        }
                                    });
                                };

                                readHTMLFile(mail_template + "/Requesttemplate.html", function(err, html) {

                                        let template = handlebars.compile(html);
                                        let replacements = {
                                            username: response.data[0].email,
                                            password: rande[0]
                                        };
                                        const htmlToSend = template(replacements);

                                     ctx.call("mail.send", {
                                        to: ctx.params.email,
                                        subject: "Forget Password Details",
                                        html: htmlToSend
                                    }).then((res) => {
                                        return "Email send Successfully";
                                    })
                                })
                                return "Password Resetted Please Check Email"
                            })
						});
				} else {
					ctx.meta.username = ctx.params.email;
					ctx.meta.log = 'Password reset failed with Invalid email';
					activity.setLog(ctx);
					return this.requestError(CodeTypes.ALREADY_EXIST);
				}
             }).catch( (err) => {
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = 'Password reset failed with Invalid data';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            });
    },

    verifyPassword: function(ctx) {
	    return Admin.findOne(ctx, {
            query: {
                username: ctx.params.username
            },
            filter: Filters_Logins.admin_security1
        })
        .then( (res) => {
            if (passwordHash.verify(ctx.params.password, res.data.password))
            {
                return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.admin_encode));
            }
            else
            {
                return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
            }
        })
        .catch( (err) => {
            if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err.name === 'TypeError'){
                return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            }
            else {
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });
    },

    verify_change_Password: function(ctx) {
	    return Admin.findOne(ctx, {
            query: {
                id: ctx.params.id
            },
            filter: Filters_Logins.admin_security1
        })
        .then( (res) => {
            if(!passwordHash.verify(ctx.params.password, res.data.password)){
                return this.requestError(CodeTypes.USERS_CHANGEPASSWORD_CURRENT_ERROR);
            }
            else if (passwordHash.verify(ctx.params.newpassword, res.data.password)) {
                return this.requestError(CodeTypes.USERS_CHANGEPASSWORD_ERROR);
            }
            else if(passwordHash.verify(ctx.params.password, res.data.password))
                    return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.admin_encode));
            else
                return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
        })
        .catch( (err) => {
            if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });
    },

    user_verifyPassword: function(ctx) {
        let findUser = {};
        findUser['email'] =  ctx.params.email;
        findUser['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return User.findOne(ctx, {
            query: findUser,
            filter: Filters_Logins.security
        })
        .then( (res) => {
            if(res.data == undefined) {

                let findUser1 = {};
                findUser1['email'] =  ctx.params.email;
                findUser1['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
                return User.findOne(ctx, {
                    query: findUser1,
                    filter: Filters_Logins.security
                })
                .then( (res) => {
                        if (passwordHash.verify(ctx.params.password, res.data.password))
                        {
                            if((res.data.isverified == 1))
                            {
                                return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
                            }
                            else {
                                return this.requestError(CodeTypes.AUTH_UNAPPROVED);
                            }
                        }
                        else
                        {
                            return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
                        }
                })
                .catch((err)=>{
                    if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else if (err.name === 'Nothing Found')
                        return this.requestError(CodeTypes.NOTHING_FOUND);
                    else if (err.name === 'TypeError'){
                        return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
                    }
                    else {
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                    }
                })
            }
            else {
                if (passwordHash.verify(ctx.params.password, res.data.password))
                {
                    if((res.data.isverified == 1))
                    {
                        return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
                    }
                    else {
                        return this.requestError(CodeTypes.AUTH_UNAPPROVED);
                    }
                }
                else
                {
                    return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
                }
            }
        })
        .catch( (err) => {

            if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err.name === 'TypeError'){
                return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            }
            else {
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });

    },

    verifyuser_change_Password: function(ctx) {
	    return User.findOne(ctx, {
            query: {
                id: ctx.params.id
            },
            filter: Filters_Logins.admin_security
        })
        .then( (res) => {
            if (passwordHash.verify(ctx.params.password, res.data.password))
                    return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.admin_encode));
            else
                return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
        })
        .catch( (err) => {
            if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });
    },

    //********************************** vendor related api's start*******************************
    vendor_login: async function(ctx) {

        if(ctx.params.socialtypeid == 1 && ctx.params.socialkey != "") {

            return googleAuth.getUser( ctx.params.socialkey )
            .then( response => {

                var userDetails = {
                    username: response.id,
                    password: response.id,
                    firstname: response.name,
                    confirmpassword: response.id,
                    socialtypeid: ctx.params.socialtypeid,
                    email: response.email,
                };

                return ctx.call("vendor.verifyUsername", { username: response.id, userDetails: userDetails })
                .then( (userId) => {
                    var user = {
                        id: userId,
                        username: response.id,
                        usertypeid: 2,
                        iat: 1596987716
                    };

                    return this.generateToken(user)
                        .then( (res2) => {
                            return Tokens.insert(ctx, {
                                    userId: userId,
                                    token: res2
                                })
                            .then( () => {
								ctx.meta.username = userDetails.email;
								ctx.meta.log = 'Successfully logged in with google';
								activity.setLog(ctx);
                                var details = {
                                    name: "vendor Login Success",
                                    data: res2,
                                    code: 200
                                };
                                return details;
                            });
                    }).then( user => { return user; } );
                });
            }).catch( (err) => {
				ctx.meta.username = ctx.params.socialkey;
				ctx.meta.log = 'Logged in with google failed';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else {
                    this.logger.info(err);
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
                }
            });
        } else if(ctx.params.socialtypeid == 2 && ctx.params.socialkey != "") {
            return facebookAuth.getUser( ctx.params.socialkey )
            .then( response => {

                var user = {
                    id: 6,
                    username: response.id,
                    usertypeid: 2,
                    iat: 1596987716
                };
                return this.generateToken(user)
                    .then( (res2) => {
                        return Tokens.insert(ctx, {
                                userId: 100,
                                token: res2
                            })
                        .then( () => {
							ctx.meta.username = user.username;
							ctx.meta.log = 'Successfully logged in with facebook';
							activity.setLog(ctx);
                            var details = {
                                name: "vendor Login Success",
                                data: res2,
                                code: 200
                            };
                            return details;
                        });
                    }).then( user => { return user; } );
            }).catch( (err) => {
				ctx.meta.username = ctx.params.socialkey;
				ctx.meta.log = 'Logged in failed with facebook';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else {
                    this.logger.info(err);
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
                }
            });
        } else {

            return ctx.call("auth.vendor_verifyPassword", { email: ctx.params.email, password: ctx.params.password })
        .then( (res) => {

            return this.generateToken(res.data)
                .then( (res2) => {

                    return Tokens.insert(ctx, {
                            userId: res.data.id,
                            token: res2
                        })
                        .then( () => {
                            let final_output = [];
                                return  Vendorfilt.findOne(ctx, { query: {
                                    id: res.data.id
                                }
                                })
                                .then((res)=>{
									ctx.meta.username = ctx.params.email;
									ctx.meta.log = 'Successfully logged in';
									activity.setLog(ctx);
									return Vendorlang.find(ctx,{ query: {
										vendorid: res.data.id
									}
									}).then((resy) => {
                                        res.data['language'] = resy.data;
                                        return vendorimagefilt.find(ctx, { query: {vendorid: res.data.id}})
                                        .then((images)=>{
                                            let image_arr = [];

                                            images.data.map((item) => {
                                                let image_obj = {};
                                                const split_image = item.vendorimagepath.split("__uploads");
                                                const image = split_image[1];
                                                const slice_image = image.slice(1);
                                                //item['vendorimages'] = slice_image;
                                                image_obj['id'] = item.id;
                                                image_obj['image'] = slice_image;
                                                image_arr.push(image_obj);
                                            });

                                            res.data['images'] = image_arr;
                                            final_output.push(res.data);
                                            return this.requestSuccess("Login Success", res2, final_output)
                                        });
									});
                                })
                        });
                })
        })
        .catch( (err) => {
			ctx.meta.username = ctx.params.email;
			ctx.meta.log = 'Attempt logged in failed';
			activity.setLog(ctx);
            if (err instanceof MoleculerError) {
                ctx.meta.log = 'Invalid Crendentials';
                activity.setLog(ctx);
                return Promise.reject(err);
            } else {
                ctx.meta.log = CodeTypes.USERS_NOTHING_FOUND;
                activity.setLog(ctx);
                return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            }
        });
        }
    },
    vendor_verifyPassword: function(ctx) {
        let findUser = {};
        findUser['email'] =  ctx.params.email;
        findUser['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return vendor.findOne(ctx, {
            query: findUser,
            filter: Filters_Logins.security
        })
        .then( (res) => {
            if(res.data == undefined) {
                let findUser1 = {};
                findUser1['email'] =  ctx.params.email;
                findUser1['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
                return vendor.findOne(ctx, {
                    query: findUser1,
                    filter: Filters_Logins.security
                })
                .then( (res) => {
                        if (passwordHash.verify(ctx.params.password, res.data.password))
                        {
                            if(res.data.isverified == 1) {
                                return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
                            }
                            else if(res.data.isverified == 0){
                                return this.requestError(CodeTypes.AUTH_UNAPPROVED_TOKEN);
                            }
                            else if(res.data.isverified == 2 )
                            {
                                return this.requestError(CodeTypes.AUTH_REJECT_TOKEN);
                            }
                        }
                        else
                        {
                            return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
                        }
                })
                .catch((err)=>{
                    if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else if (err.name === 'Nothing Found')
                        return this.requestError(CodeTypes.NOTHING_FOUND);
                    else if (err.name === 'TypeError'){
                        return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
                    }
                    else {
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                    }
                })
            }
            else {
                    if (passwordHash.verify(ctx.params.password, res.data.password))
                    {
                        if(res.data.isverified == 1) {
                            return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.encode));
                        }
                        else if(res.data.isverified == 0){
                            return this.requestError(CodeTypes.AUTH_UNAPPROVED_TOKEN);
                        }
                        else if(res.data.isverified == 2 )
                        {
                            return this.requestError(CodeTypes.AUTH_REJECT_TOKEN);
                        }
                    }
                    else
                    {
                        return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
                    }
            }
        })
        .catch( (err) => {
            if (err instanceof MoleculerError){
                return Promise.reject(err);
            }
            else if (err.name === 'Nothing Found') {
                return this.requestError(CodeTypes.NOTHING_FOUND);
            }
            else if (err.name === 'TypeError'){
                return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            }
            else {
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });

    },

    // Reset Password for User with mail forward
    vendor_resetPassword: function(ctx) {

        //Random password generation
        const str = Math.random() * 100000;
        const stmr = str.toString();
        const rande = stmr.split(".");
        return Vendor.find(ctx, { query: {
                email: ctx.params.email
             }})
             .then((response) => {
                 if(response.data)
                 {
					//generateHash gives encrypted password
					//console.log('vendor pass: ',rande[0]);
                    return this.generateHash(rande[0])
                        .then((res) => {
                                return Vendor.updateBy(ctx, 1,
                                    { password : res.data }, { query: {
                                    id: response.data[0].id
                            }})

                            .then((result) => {
								ctx.meta.username = ctx.params.email;
								ctx.meta.log = 'vendor Password has been reseted';
								activity.setLog(ctx);
                                let readHTMLFile = function(path, callback) {
                                    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            callback(null, html);
                                        }
                                    });
                                };

                                readHTMLFile(mail_template + "/Requesttemplate.html", function(err, html) {

                                        let template = handlebars.compile(html);
                                        let replacements = {
                                            username: response.data[0].email,
                                            password: rande[0]
                                        };
                                        const htmlToSend = template(replacements);

                                     ctx.call("mail.send", {
                                        to: ctx.params.email,
                                        subject: "Forget Password Details",
                                        html: htmlToSend
                                    }).then((res) => {
                                        return "Email send Successfully";
                                    })
                                })
                                return "Password Resetted Please Check Email";
                            })
                        })
                    }
                else
                    return this.requestError(CodeTypes.ALREADY_EXIST);
             }).catch( (err) => {
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = 'vendor Password reset attempt failed';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.USERS_NOTHING_FOUND);
            });
    },

    // Reset Password for admin with mail forward
    admin_resetPassword: function(ctx) {

        //Random password generation
        const str = Math.random() * 100000;
        const stmr = str.toString();
        const rande = stmr.split(".");
        return Admin.find(ctx, { query: {
                email: ctx.params.email
             }})
             .then((response) => {
                 if(response.data)
                 {
					//generateHash gives encrypted password
					//console.log('vendor pass: ',rande[0]);
                    return this.generateHash(rande[0])
                        .then((res) => {
                                return Admin.updateBy(ctx, 1,
                                    { password : res.data }, { query: {
                                    id: response.data[0].id
                            }})

                            .then((result) => {
								ctx.meta.username = ctx.params.email;
								ctx.meta.log = 'Admin Password has been reseted';
								activity.setLog(ctx);
                                let readHTMLFile = function(path, callback) {
                                    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            callback(null, html);
                                        }
                                    });
                                };

                                readHTMLFile(mail_template + "/Requesttemplate.html", function(err, html) {

                                        let template = handlebars.compile(html);
                                        let replacements = {
                                            username: response.data[0].username,
                                            password: rande[0]
                                        };
                                        const htmlToSend = template(replacements);

                                     ctx.call("mail.send", {
                                        to: ctx.params.email,
                                        subject: "Forget Password Details",
                                        html: htmlToSend
                                    }).then((res) => {
                                        return "Email send Successfully";
                                    })
                                })
                                return "Password Resetted Please Check Email";
                            })
                        })
                    }
                else
                    return this.requestError(CodeTypes.ALREADY_EXIST);
             }).catch( (err) => {
				ctx.meta.username = ctx.params.email;
				ctx.meta.log = 'Admin Password reset attempt failed';
				activity.setLog(ctx);
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.INVALID_EMAIL);
            });
    },    

    verifyvendor_change_Password: function(ctx) {
	    return Vendor.findOne(ctx, {
            query: {
                id: ctx.params.id
            },
            filter: Filters_Logins.admin_security
        })
        .then( (res) => {
            if (passwordHash.verify(ctx.params.password, res.data.password))
                    return this.requestSuccess("Valid Password", pick(res.data, Filters_Logins.admin_encode));
            else
                return this.requestError(CodeTypes.AUTH_INVALID_CREDENTIALS);
        })
        .catch( (err) => {
            if (err instanceof MoleculerError)
                return Promise.reject(err);
            else if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(CodeTypes.UNKOWN_ERROR);
            }
        });
    },


	//********************************** vendor related api's end*********************************
	verifyToken: function(ctx) {
        //return 1;
        var Output = [];
        var out = [];
        var FinalOut = [];
        var dirLink = __dirname+'/';
        var final = [];
        var dirLink2 = path.join(__dirname, '/../../admin/controllers/');

        console.log('dirLink' , dirLink);
        console.log('dirLink2' , dirLink2)
        return Tokens.findOne(ctx, {
            query: {
                token: ctx.params.token
            }
        })
        .then( (res) => {
            if(res.data.login_type === "administration") {
                var result =0, found = [],rxp = /{([^}]+)}/g,curMatch;
                var url = ctx.params.url.split('?')? ctx.params.url.split('?')[0]:ctx.params.url;
                var nameArr = url.split('/');
                var method = nameArr[nameArr.length - 1];
                var controller = nameArr[nameArr.length - 2];
                var makeURL = controller+'/'+method;
                return verify(ctx.params.token, JWT_SECRET).then((r) =>
                {
					if(r.id === 1) {
						result = 1;
						res.access = result;
						return r
					} else {
						return Admin.find(ctx, { query: {'id' : r.id} }).then((res) => {
							return res;
						})
						.then((responseResult) =>{
							return Role.find(ctx, { query: {'id': responseResult.data[0].roleid}})
							.then((rolelist)=>{
								console.log(rolelist);
								let evalData = eval(JSON.parse(JSON.stringify(rolelist.data[0].role_json)));
								console.log('check',evalData);
								const check = evalData.some(e => e.id === makeURL && e.state === 1)
								check ? result = 1 : result = 0;
								responseResult.access = result;
								return responseResult;
							})
							.catch( (err) => {
								if (err instanceof MoleculerError)
									return Promise.reject(err);
								else
									return this.requestError(CodeTypes.UNKOWN_ERROR);
							});
						})
						.catch( (err) => {
							if (err instanceof MoleculerError)
								return Promise.reject(err);
							else
								return this.requestError(CodeTypes.UNKOWN_ERROR);
						});
					}
                })
            }
            else if((res.data.login_type === 'user') || (res.data.login_type === "vendor")){
                return verify(ctx.params.token, JWT_SECRET)
            }
        })
        .catch( (e) => {
        });
	},

	verifyToken_o: function(ctx) {
        //return 1;
        var Output = [];
        var out = [];
        var FinalOut = [];
        var dirLink = __dirname+'/';
        var final = [];
        var dirLink2 = path.join(__dirname, '/../../admin/controllers/');

        console.log('dirLink' , dirLink);
        console.log('dirLink2' , dirLink2)
        return Tokens.findOne(ctx, {
            query: {
                token: ctx.params.token
            }
        })
        .then( (res) => {
            if(res.data.login_type === "administration") {
                var result =0, found = [],rxp = /{([^}]+)}/g,curMatch;
                var url = ctx.params.url.split('?')? ctx.params.url.split('?')[0]:ctx.params.url;
                var nameArr = url.split('/');
                var method = nameArr[nameArr.length - 1];
                var controller = nameArr[nameArr.length - 2];
                var makeURL = controller+'/'+method;
                return verify(ctx.params.token, JWT_SECRET).then((r) =>
                {
                    return Admin.find(ctx, { query: {'id' : r.id} }).then((res) => {
                        return res;
                    })
                    .then((responseResult) =>{
                        return Role.find(ctx, { query: {'id': responseResult.data[0].roleid}})
                        .then((rolelist)=>{

                            let evalData = eval(JSON.stringify(rolelist.data[0].role_json));
                            evalData = evalData.replace('[','');
                            evalData = evalData.replace(']','');
                            res = evalData.replace("\'","'");
                            res = res.replace(/ /g,'');
                            while( curMatch = rxp.exec( res ) ) {
                                found.push( curMatch[1] );
                                let obj = eval('({' + curMatch[1] + '})');
                                if(makeURL == obj.id && obj.state == 1){
                                    result = 1;
                                    console.log('Authorized User and Role Allowed ' , makeURL);
                                }
                            }
                            responseResult.access = result;
                            return responseResult;
                        }).then((r) => {
                            return  dirDetails(dirLink)
                            .then ((res) =>{
                                return dirDetails(dirLink2).then((out2) => {
                                    out.push(res);
                                    out.push(out2);
                                    return this.requestSuccess("List of Role", out);
                                })
                            })
                            .then((r) =>{
                                let total_array = r.data;
                                const get_AnnnotationDetails = async(x , link) =>
                                path.extname(link+x)=='.js' ? annotations.get(link+x).then ((res) =>{

                                    if (!isEmpty(res) && res!= null && !isEmpty(res.module)){
                                        var cnt = res.module.whitelist !== undefined && res.module.whitelist.split(",")? res.module.whitelist.split(","):'';

                                        if(res.module.whitelist !== undefined && res.module.whitelist.split(",") && cnt.length>1){
                                            var parentName = res.module.annotation.charAt(0).toLowerCase()+ res.module.annotation.slice(1);
                                            cnt.map((c1, i) => {
                                                (res.module.whitelist !== undefined && res.module.whitelist.split(","))?Output.push(parentName+'/'+c1):'';
                                            })
                                        }else{
                                            var parentName = res.module.annotation.charAt(0).toLowerCase()+ res.module.annotation.slice(1);
                                            (res.module.whitelist !== undefined && res.module.whitelist.split(","))?Output.push(parentName+'/'+res.module.whitelist):'';
                                        }
                                    }
                                    return Output;
                                }):''
                                async function get_AnnnotationLists(annList , link) {
                                  //  console.log('annList' , annList , link)
                                    for(var i = 0;i<annList.length;i++) {
                                        //console.log('annList[i]' ,i, annList[i] , link)
                                        let language_val_filter = await get_AnnnotationDetails(annList[i] , link)
                                        .then((annoDetail)=>{
                                            return annoDetail;
                                        });
                                    }
                                }
                                const vali =  get_AnnnotationLists(total_array[0] ,dirLink );
                                return vali.then((resy)=>{
                                    return get_AnnnotationLists(total_array[1] ,dirLink2).then((resy1)=>{
                                        var index = Output.indexOf(makeURL);
                                        if (index > -1) {
                                            result = 1;
                                        }result = 1;
                                        r.access = result;
                                        return r;
                                        //return result;
                                    })
                                })
                            })
                        })
                        .catch( (err) => {
                            if (err instanceof MoleculerError)
                                return Promise.reject(err);
                            else
                                return this.requestError(CodeTypes.UNKOWN_ERROR);
                        });
                    })
                    .catch( (err) => {
                        if (err instanceof MoleculerError)
                            return Promise.reject(err);
                        else
                            return this.requestError(CodeTypes.UNKOWN_ERROR);
                    });
                })
            }
            else if((res.data.login_type === 'user') || (res.data.login_type === "vendor")){
                return verify(ctx.params.token, JWT_SECRET)
            }
        })
        .catch( (e) => {
        });
    },

    countSessions: function(ctx) {

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

    closeAllSessions: function(ctx) {

        return this.verifyIfLogged(ctx)
            .then( () => Tokens.removeMany(ctx, {
                userId: ctx.meta.user.id
            }))
            .then( () => this.requestSuccess("All existing sessions closed", true) )
            .catch( (err) => {
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
    },

    logout_old: function(ctx) {
        return this.verifyIfLogged(ctx)
            .then( () => Tokens.removeMany(ctx, {
                token: ctx.meta.user.token
            }))
            .then( () => this.requestSuccess("Logout Success", true) )
            .catch( (err) => {
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
	},
	logout: function(ctx) {
        return this.verifyIfLogged(ctx)
            .then( () => Tokens.removeMany(ctx, {
                token: ctx.params.authtoken
            }))
            .then( () => this.requestSuccess("Logout Success", true) )
            .catch( (err) => {
                if (err instanceof MoleculerError)
                    return Promise.reject(err);
                else
                    return this.requestError(CodeTypes.UNKOWN_ERROR);
            });
    },
    get_language: function(ctx) {
        let findlang = {};
        findlang['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Language.find(ctx, { filter:['id','languagekey', 'languagename', 'languageshortname', 'status', 'created_by', 'created_at'],query: findlang })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("Languages", arr)


        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

}

async function dirDetails(testFolder) {
    var arr = [];
    let jam = fs.readdirSync(testFolder);
    jam.sort(function(a, b) {

    })
    return jam;
}

function isEmpty(obj)
{
    var i=0;
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
