"use strict";
// DEVELOPED ON 15-12-2020

const { MoleculerError } 	= require("moleculer").Errors;
//Defines error code types
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Config = require("../../../../config");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const handlebars = require('handlebars');
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const { map } = require("bluebird");
const Op = require('sequelize').Op;
const mail_template = __dirname;
const otpGenerator =  require("otp-generator");
const { v4: uuidv4 } = require("uuid");
const url = Config.get('/url');

//Models
//User tables and its fields
const User = new Database("Muser");

const Userfilt = new Database("Muser", [
    "id",
    "userkey",
    "firstname",
    "lastname",
    "email",
    "countrycode",
    "contactnumber",
    "countryid",
    "cityid",
    "isverified",
    "otp",
    "usertypeid",
    "panel",
    "image_url",
    "socialtypeid",
    "socialkey",
    "photopath",
    "devicetype",
    "devicetoken",
    "status"
]);

const Favvendorfilt = new Database("Mfavourite",[
    "id",
    "favouritekey",
    "vendorid",
    "userid",
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
 * @annotation adminuser
 * @permission create,update,remove,status
 * @whitelist  getall,get
*/
module.exports = {

    // USER CREATION WITH
    create: async function(ctx) {
        var otp = otpGenerator.generate(5,{ upperCase: false, specialChars: false, alphabets: false});
		let emailverificationkey = uuidv4();
		//Check email already exists
        return User.findOne(ctx, { query: {
            [Op.or]: [
                { email: ctx.params.email, },
                { contactnumber: ctx.params.contactnumber }
              ],
            status: { [Op.ne]: DELETE }
        }})
        .then((res)=> {
            if (res.name === "Nothing Found")
            {
                const pass = ctx.params.password.toString().trim();
                const confpass = ctx.params.confirmpassword.toString().trim();
                //Comparing password and confirmpassword
                if (pass.localeCompare(confpass) == 0) {
                    //Generating Hashed password
                    return  this.generateHash(pass)
                        .then( (res) => User.insert(ctx, {
                            firstname: ctx.params.firstname,
                            lastname: ctx.params.lastname,
                            email: ctx.params.email,
                            password: res.data,
                            cityid: ctx.params.cityid,
                            countryid: ctx.params.countryid,
                            countrycode: ctx.params.countrycode,
                            contactnumber: ctx.params.contactnumber,
                            photopath: ctx.params.photopath,
                            socialtypeid: ctx.params.socialtypeid,
                            socialkey: ctx.params.socialkey,
                            devicetype: ctx.params.devicetype,
                            devicetoken: ctx.params.devicetoken,
                            otp: otp,
                            usertypeid: 3,
                            panel: "User",
							image_url: ctx.params.image_url,
							isverified:1,
							isverifiedemail:1,
							emailverificationkey: emailverificationkey,
                        }))
                        .then((response)=>{
                        // Sending username and password to customers mail
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
							var URL = url.url;
							const verificationLink = `${URL}api/v1/public/user/verifymailid?emailverificationkey=${emailverificationkey}`;
                            //Reads the html template,body of the mail content
                            readHTMLFile(mail_template + "/Usertemplate.html", function(err, html) {
                                    let template = handlebars.compile(html);
                                    let replacements = {
                                        Name: ctx.params.firstname,
                                        username: ctx.params.email,
                                        password: ctx.params.password,
										otp: otp,
										emailverificationkey: verificationLink,
                                        message12: "User Created Successfully "
                                    };
                                    const htmlToSend = template(replacements);
                                // this method call the mail service to send mail
                                ctx.call("mail.send", {
                                    to: ctx.params.email,
                                    subject: "User Login Details",
                                    html: htmlToSend
                                }).then((res) => {
                                    return "Email send Successfully";
                                })
                            })
                            return this.requestSuccess("User Created", response.data);
                        })
                        .catch( (err) => {
                            ctx.meta.username = ctx.params.email;
                            ctx.meta.log = 'Create User failed.';
                            activity.setLog(ctx);
                            if (err.name === 'Database Error' && Array.isArray(err.data)){
                                if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                                    return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                            }
                            else if (err instanceof MoleculerError)
                                return Promise.reject(err);
                            else
                                return err;
                        });
                }
                else {
                    ctx.meta.username = ctx.params.email;
                    ctx.meta.log = 'Create User failed with password mismatch.';
                    activity.setLog(ctx);
                    return this.requestError(CodeTypes.USERS_PASSWORD_MATCH);
                }
            }
            else {
                ctx.meta.username = ctx.params.email;
                ctx.meta.log = 'Create User failed with same email or Phone';
                activity.setLog(ctx);
                return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
        });
    },

    getall: function(ctx) {
        const array = [];
        let findUser = {};
        findUser['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Userfilt.find(ctx, { query: findUser })
        .then( (res) =>{
            async function get_favvendor(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get Fav vendors of the user
                    let fav_vendor = await Favvendorfilt.find(ctx, { query: {userid:arr[i].id}})
                    .then((response)=>{
                        let vendor_id = [];
                    response.data.map((item) => {
                        vendor_id.push(item.vendorid);
                    });
                        arr[i]["fav_vendors"] = vendor_id;
                        return arr[i];
                    })

                    total_array.push(fav_vendor);
                    }
                    return total_array;
                }
            const vali =  get_favvendor(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Users",resy);
            })
        } )
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    status: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  User.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) => {
			return User.updateBy(ctx, res.data.id, {
				status: ctx.params.status
				}, { query: {
					id: ctx.params.id
				}
			})
            .then((resp)=>{
                ctx.meta.log = "User status changed.";
			    activity.setLog(ctx);
                return this.requestSuccess("Status of the User Updated");
            })
		})
        .catch( (err) => {
			ctx.meta.log = "Attempt to change user status failed.";
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);

        });
    },

    get: function(ctx) {
        return  Userfilt.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then((res)=>{
            let temp_arr = [];
            async function get_favvendor(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get Fav vendors of the user
                    let fav_vendor = await Favvendorfilt.find(ctx, { query: {userid:arr[i].id}})
                    .then((response)=>{
                        let vendor_id = [];
                        response.data.map((item) => {
                            vendor_id.push(item.vendorid);
                        });
                        arr[i]["fav_vendors"] = vendor_id;
                        return arr[i];
                    })
                    total_array.push(fav_vendor);
                }
                return total_array;
            }
            temp_arr.push(res.data);
            const vali =  get_favvendor(ctx,temp_arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested User", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else {
                this.logger.info(err);
                return this.requestError(err);
            }
        });

    },

    update: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return User.updateBy(ctx, 1, {
            firstname: ctx.params.firstname,
            lastname: ctx.params.lastname,
            email: ctx.params.email,
            contactnumber: ctx.params.contactnumber,
            devicetype: ctx.params.devicetype,
            devicetoken: ctx.params.devicetoken,
            photopath: ctx.params.photopath,
            image_url: ctx.params.image_url

        }, { query: {
                id: ctx.params.id
            }
        })
        .then((res)=>{
			ctx.meta.log = 'User details updated.';
			activity.setLog(ctx);
            return  Userfilt.findOne(ctx, { query: {
                id: ctx.params.id
            }
            })
            .then((res)=>{
                let temp_arr = [];
                async function get_favvendor(ctx, arr) {
                    let total_array = [];
                    for(var i = 0;i<arr.length;i++) {
                        //to get Fav vendors of the user
                        let fav_vendor = await Favvendorfilt.find(ctx, { query: {userid:ctx.params.id}})
                        .then((response)=>{
                            let vendor_id = [];
                        response.data.map((item) => {
                            vendor_id.push(item.vendorid);
                        });
                            arr[i]["fav_vendors"] = vendor_id;
                            return arr[i];
                        })
                        total_array.push(fav_vendor);
                        }
                        return total_array;
                    }
                    temp_arr.push(res.data);
                const vali =  get_favvendor(ctx,temp_arr);
                return vali.then((resy)=>{
                    return resy;
                })
            })
        })
        .catch( (err) => {
			ctx.meta.log = 'vendor user details update failed.';
			activity.setLog(ctx);
            if (err.name === 'Database Error' && Array.isArray(err.data)){
                if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                    return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
            }
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return err;
        });
    },

    remove: function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
			// console.log(activityData);
		});
        return  User.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) => {
			return User.updateBy(ctx, res.data.id, {
				status: 2
				}, { query: {
					id: ctx.params.id
				}
			})
            .then((res)=>{
                ctx.meta.log = 'User removed.';
                activity.setLog(ctx);
                return this.requestSuccess("User Removed Successfully");
            })
		})
        .catch( (err) => {
			ctx.meta.log = 'Attempt to remove user failed.';
			activity.setLog(ctx);
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else if (err instanceof MoleculerError)
                return Promise.reject(err);
            else
                return this.requestError(err);
        });
    }
}
