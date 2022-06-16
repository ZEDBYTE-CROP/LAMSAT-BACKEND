"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const Config = require("../../../../config");
const url = Config.get('/url')
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
//database connections for store Procedures (dashboard counts api)
const Sequ = require("sequelize");
const mkdir = require("mkdirp").sync;
const mime = require("mime-types");
const { info } = require("console");
const moment = require('moment');
var sizeOf = require('image-size');

// const uploadDir = path.join(__dirname, "__uploads");
// mkdir(uploadDir);
const img_path = __dirname;
const db = require('../../../adapters/db');

//Models
const Cms = new Database("Mcms");
const CmsLang = new Database("Mcmslang");
const Discounttype = new Database("Mdiscounttype");
const Paymentmethod = new Database("Mpaymentmethod");
const Vat = new Database("Mvat");
const Aboutus = new Database("Maboutus");
const Aboutuslang = new Database("Maboutuslang");
const Mnewslettersubscribe = new Database("Mnewslettersubscribe");
const Aboutusfilt = new Database("Maboutus", [
    "id",
    "aboutuskey",
    "status",
    "created_by",
    "created_at",
]);
const Aboutuslangfilt = new Database("Maboutuslang", [
    "id",
    "aboutuslangkey",
    "languageid",
    "langshortname",
    "aboutusid",
    "content",
    "created_by",
    "created_at",
]);
const Apptype = new Database("Mapptype");
const Vouchertype = new Database("Mvouchertype");
const Social = new Database("Msocialmedia");
const Sms = new Database("Msms");
const Smtp = new Database("Msmtp");
const Faq = new Database("Mfaq");
const FaqLang = new Database("Mfaqlang");
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const serviceAvailable = new Database("Mserviceavailable");
const Booking = new Database("Tbooking");
//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;


/**
 *
 * @annotation Common
 * @permission create,get,remove,get_discounttype,get_paymentmethod,getAll_aboutus,add_newsletter,smtp_create,smtp_get,smtp_update,smtp_remove,sms_create,sms_getAll,sms_get,sms_update,sms_remove,social_create,social_get,social_update
 * @whitelist dashboard,social_remove,our_offers,social_getAll,smtp_getAll,getall,getAll_discount,getAll_paymentmethod
 */

module.exports = {


    create: async function(ctx) {
        let findvat = {};
        findvat['vat'] = ctx.params.vat;
        findvat['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Vat.find(ctx, { query: findvat })
        .then((res) => {
            if (res.data.length === 0) {
                return Vat.insert(ctx, {
                    vat: ctx.params.vat
                })
                .then( (res) => {
                    return this.requestSuccess("Vat Created", ctx.params.vat);
                })
                .catch( (err) => {
                    if (err.name === 'Database Error' && Array.isArray(err.data)){
                        if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                            return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                    }
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                });
            }
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })

	},
    upload_img: function(ctx){
        const fold = ctx.meta.$multipart.scenario != null ? ctx.meta.$multipart.scenario : "";
        const uploadDir = path.join(__dirname, `__uploads/`);
        if(fs.existsSync(uploadDir) == false) {
            mkdir(uploadDir);
        }
        const randy = this.randomName(ctx.meta);
		const fileName = ctx.meta.filename;
		const ext = path.extname(fileName);
		var type = ctx.meta.$multipart.type != null ? ctx.meta.$multipart.type : "";
		var randy2 = path.join(randy, type);
		if(ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
			return new this.Promise((resolve, reject) => {
				const filePath = path.join(uploadDir, randy2);
				const f = fs.createWriteStream(filePath);
				f.on("close", () => {
					// File written successfully
					this.logger.info(`Uploaded file stored in '${filePath}'`);
					resolve({ filePath, meta: ctx.meta }) ;
				});
				f.on("error", err => {
					this.logger.info("File error received", err.message);
					reject(err);
					// Destroy the local file
					f.destroy(err);
				});
				f.on("error", () => {
					// Remove the errored file.
					fs.unlinkSync(filePath);
				});
				ctx.params.pipe(f);
			})
			.then((res)=> {
                const img_scenario = ctx.meta.$multipart.scenario != null ? ctx.meta.$multipart.scenario+"/" : "";
                const img_url = `__uploads/${img_scenario}`
				res['image_url'] = url.url + img_scenario + randy2;
				return this.requestSuccess("File uploaded successfully", res);
			})
			.catch( (err) => {
				if (err.name === 'Database Error' && Array.isArray(err.data)){
					if (err.data[0].type === 'unique' && err.data[0].field === 'username')
						return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
				}
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else {
					this.logger.info(err);
					return this.requestError(err);
				}
			});
		} else {
			return this.requestError(`File format ${ext} is not allowed.`);
		}

	},

	upload_pdf: function(ctx){
        const fold = ctx.meta.$multipart.scenario != null ? ctx.meta.$multipart.scenario : "";
        const uploadDir = path.join(__dirname, `__uploads/`);
        if(fs.existsSync(uploadDir) == false) {
            mkdir(uploadDir);
        }
        const randy = this.randomName(ctx.meta);
		const fileName = ctx.meta.filename;
		const ext = path.extname(fileName);
		var type = ctx.meta.$multipart.type != null ? ctx.meta.$multipart.type : "";
		var randy2 = path.join(randy, type);
		if(ext === '.pdf' || ext === '.jpg' || ext === '.jpeg' || ext === '.doc' || ext === '.docx') {
			return new this.Promise((resolve, reject) => {
				const filePath = path.join(uploadDir, randy2);
				const f = fs.createWriteStream(filePath);
				f.on("close", () => {
					// File written successfully
					this.logger.info(`Uploaded file stored in '${filePath}'`);
					resolve({ filePath, meta: ctx.meta }) ;
				});
				f.on("error", err => {
					this.logger.info("File error received", err.message);
					reject(err);
					// Destroy the local file
					f.destroy(err);
				});
				f.on("error", () => {
					// Remove the errored file.
					fs.unlinkSync(filePath);
				});
				ctx.params.pipe(f);
			})
			.then((res)=> {
                const file_scenario = ctx.meta.$multipart.scenario != null ? ctx.meta.$multipart.scenario+"/" : "";
                const file_url = `__uploads/${file_scenario}`
				res['file_url'] = url.url + file_scenario + randy2;
				return this.requestSuccess("File uploaded successfully", res);
			})
			.catch( (err) => {
				if (err.name === 'Database Error' && Array.isArray(err.data)){
					if (err.data[0].type === 'unique' && err.data[0].field === 'username')
						return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
				}
				else if (err instanceof MoleculerError)
					return Promise.reject(err);
				else {
					this.logger.info(err);
					return this.requestError(err);
				}
			});
		} else {
			return this.requestError(`File format ${ext} is not allowed.`);
		}

    },

    // Vat list
    getAll: function(ctx) {
        let findvat = {};
        findvat['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Vat.find(ctx, { query: findvat })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of Vat", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    // Discount list
    getAll_discount: function(ctx) {
        let finddiscount = {};
        finddiscount['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Discounttype.find(ctx, { query: finddiscount })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of Discounts", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    // Payment list
    getAll_paymentmethod: function(ctx) {
        let findpaymentmethod = {};
        findpaymentmethod['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Paymentmethod.find(ctx, { query: findpaymentmethod })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of Payment Methods", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    //Particular Vat list
    get: function(ctx) {
        let findvat = {};
        findvat['id'] = ctx.params.id ;
        findvat['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Vat.find(ctx, { query: findvat })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("Requested Vat", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    //Particular Discounttype list
    get_discounttype: function(ctx) {
        let finddiscountype = {};
        finddiscountype['id'] = ctx.params.id ;
        finddiscountype['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Discounttype.find(ctx, { query: finddiscountype })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("Requested Discount Type", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    //Particular Payment method list
    get_paymentmethod: function(ctx) {
        let findpaymentmethod = {};
        findpaymentmethod['id'] = ctx.params.id ;
        findpaymentmethod['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Paymentmethod.find(ctx, { query: findpaymentmethod })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("Requested Payment Method", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

        //Vat delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Vat.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Vat.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Requested Vat Removed", ctx.params.id);

        })

	},

	// About us with multiple language
	getAll_aboutus: function(ctx) {
		let findabout = {};
		findabout['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
		return Aboutusfilt.find(ctx, { query: findabout })
		.then( (res) => {
			var arr = res.data;
			async function get_aboutus(ctx, arr) {
				let final = [];
				for(var i = 0;i<arr.length;i++) {

					let subject_lang = await Aboutuslangfilt.find(ctx, { query: {aboutusid: arr[i].id,langshortname: ctx.options.parentCtx.params.req.headers.language}})
					.then((lan_res)=>{
						arr[i]["content"] = lan_res.data[0].content;
						return arr[i];
					})


					final.push(subject_lang);
				}
				return final;
			}
			const vali =  get_aboutus(ctx,arr);
			return vali.then((resy)=>{
				return resy;
			})
		})
		.catch( (err) => {
			if (err.name === 'Nothing Found')
				return this.requestError(CodeTypes.NOTHING_FOUND);
			else
				return this.requestError(CodeTypes.UNKOWN_ERROR);
		});

	},
	add_newsletter: async function(ctx) {
        let findemail = {};
        findemail['email'] = ctx.params.email;
        findemail['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Mnewslettersubscribe.find(ctx, { query: findemail })
        .then((res) => {
            if (res.data.length === 0) {
                return Mnewslettersubscribe.insert(ctx, {
					email: ctx.params.email
                })
                .then( (res) => {
                    return this.requestSuccess("You have Subscribed", ctx.params.email);
                })
                .catch( (err) => {
                    if (err.name === 'Database Error' && Array.isArray(err.data)){
                        if (err.data[0].type === 'unique' && err.data[0].field === 'username')
                            return this.requestError(CodeTypes.USERS_USERNAME_CONSTRAINT);
                    }
                    else if (err instanceof MoleculerError)
                        return Promise.reject(err);
                    else
                        return this.requestError(CodeTypes.UNKOWN_ERROR);
                });
            }
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        })

    },
    ///////////////////////////////STMP SETTINGS CREATE////////////////////


    // SMTP list
    smtp_getall: function(ctx) {
        let findsmtp = {};
        findsmtp['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Smtp.find(ctx, { query: findsmtp })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of SMTPS", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    sms_getall: async function(ctx) {
        let findsms = {};
        findsms['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Sms.find(ctx, { query: findsms })
        .then( (res) => {
			var arr = res.data;
			return this.requestSuccess("Requested SMS", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
	},


    ///////////////////////////////SMTP SETTINGS END////////////////////

    ///////////////////////////////SOCIALMEDIA SETTINGS////////////////////


    // Social Media list
    social_getall: function(ctx) {
        let findsocial = {};
        findsocial['status'] = 1;
        return Social.find(ctx, { query: findsocial })
        .then( (res) => {
            var arr = res.data;
            return this.requestSuccess("List of Social Media Links", arr);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });

    },

    ///////////////////////////////SOCIALMEDIA SETTINGS END////////////////////

    /////////////////////////////////////APP AND VOUCHER TYPE //////////////////////////////////////
    getall_apptype: function(ctx) {
        let findapptype = {};
        findapptype['status'] = 1;
        return Apptype.find(ctx, { query: findapptype })
        .then( (res) => {
            return this.requestSuccess("App Type list", res.data);
            //return res.data;
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Get particular AppType
    get_apptype: function(ctx) {
        return  Apptype.findOne(ctx, { query: {
            id: ctx.params.id,
            status: 1
        }
        })
        .then((res)=>{
            return  this.requestSuccess("App Type list", res.data);
            //return res.data;
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

    // Get all VoucherType
    getall_vouchertype: function(ctx) {
        let findvouchertype = {};
        findvouchertype['status'] = 1;
        return Vouchertype.find(ctx, { query: findvouchertype })
        .then( (res) => {
            return  this.requestSuccess("Voucher Type list", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    //Get particular VoucherType
    get_vouchertype: function(ctx) {
        return  Vouchertype.findOne(ctx, { query: {
            id: ctx.params.id,
            status: 1
        }
        })
        .then((res)=>{
            return  this.requestSuccess("Voucher Type list", res.data);
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
    /////////////////////////////////APP AND VOUCHER TYPE END/////////////////////////////

    /////////////////////////////////CMS START/////////////////////////////
    // cms list with multiple language
    cms_getall: function(ctx) {
        let findcms = {};
        findcms['status'] = 1;
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { filter:["languageid","pagetitle", "keywords", "description","pagecontent","slug","sortorder"],query: {cmsid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_cms(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of CMS", resy);
            })

        })
        .catch( (err) => {

            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //Particular cms list in multiple language
    cms_get: function(ctx) {
        let findcms = {};
        findcms['id'] = ctx.params.id ;
        findcms['status'] = 1;
        return Cms.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_cms(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await CmsLang.find(ctx, { filter:["languageid","pagetitle", "keywords", "description","pagecontent","slug","sortorder"],query: {cmsid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });
                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_cms(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested Cms", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    /////////////////////////////////CMS END/////////////////////////////

    /////////////////////////////////FAQ END/////////////////////////////
     // cms list with multiple language
     faq_getall: function(ctx) {
        let findfaq = {};
        findfaq['status'] = 1;
        return Faq.find(ctx, { query: findfaq })
        .then( (res) => {
            var arr = res.data;
            async function get_faq(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await FaqLang.find(ctx, { filter:["languageid", "question", "answer", "sortorder", "status"],query: {faqid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_faq(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("List of FAQ", resy);
            })

        })
        .catch( (err) => {

            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });

    },

    //Particular cms list in multiple language
    faq_get: function(ctx) {
        let findcms = {};
        findcms['id'] = ctx.params.id ;
        findcms['status'] = 1;
        return Faq.find(ctx, { query: findcms })
        .then( (res) => {
            var arr = res.data;
            async function get_faq(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    let language_val = await FaqLang.find(ctx, { filter:["languageid", "question", "answer", "sortorder", "status"],query: {faqid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_faq(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess("Requested FAQ", resy);
            })

        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    /////////////////////////////////FAQ END/////////////////////////////

    saloon_getall: function(ctx) {
        return vendor.find(ctx, { filter:['id'],query: {
            status: 1
        } })
        .then( (res) =>{
            async function get_category(ctx, arr) {
                let total_array = [];
                for(var i = 0;i<arr.length;i++) {
                    //to get language data of the vendor
                    let language_val_filter = await vendorlang.find(ctx, { filter:['vendorname'],query: {vendorid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
						if(lan_res.data[0]) {
							arr[i]["vendorname"] = lan_res.data[0].vendorname;
						}
                        return arr[i];
                    });
                    console.log(language_val_filter);
                    total_array.push(language_val_filter);
                }
                return total_array;
            }
            let array = [];
            array.push(res.data);
            const vali =  get_category(ctx,res.data);
            return vali.then((resy)=>{
                return this.requestSuccess("Vendor Detail", resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },

    dashboard_counts1: async function(ctx) {
        let dashboard_count = await db.sequelize.query('EXEC Dashboard_Counts',{type: Sequ.QueryTypes.SELECT});

        /*let review_val = await db.sequelize.query('EXEC SP_Dashboard :vendorid',{replacements: {start: start,end: end},type: Sequ.QueryTypes.SELECT});*/
/*
        let playersList = await db.sequelize.query('EXEC SP_NearVendor :startDate,:endDate',{replacements: {startDate: start,endDate:end},type: Sequ.QueryTypes.SELECT})


let playersList = await db.sequelize.query('EXEC SP_NearVendor :latitude,:longitude,:languageid',{replacements: {latitude: ctx.params.latitude,longitude:ctx.params.longitude,languageid: ctx.options.parentCtx.params.req.headers.language},type: Sequ.QueryTypes.SELECT});
*/
let playersList2 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates  :date1,:date2',{replacements: {date1: startDate,date2:endDate} })

        console.log('dashboard_count' , dashboard_count ,  moment().format('YYYY-MM-DD'));

		var startDate =  moment().format('YYYY-MM-DD'); //moment(ctx.params.startdate,"DD/MM/YYYY");
		//var startDate = start.toDate();
		var endDate = moment().format('YYYY-MM-DD'); // moment(ctx.params.enddate,"DD/MM/YYYY");
		//if(ctx.params.startdate === ctx.params.enddate) {end = moment(end).add(1,'d')}
        //var endDate = end.toDate();
        const startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
        const startOfYear = moment().startOf('year').format('YYYY/MM/DD');
        let findmonth = {};
		findmonth['created_at']= {
			[Op.between]: [startOfMonth, endDate],
         }
         let findyear = {};
         findyear['created_at']= {
             [Op.between]: [startOfYear, endDate],
          }
		let findlog = {};
		findlog['created_at']= {
			[Op.between]: [startDate, endDate],
		 }
		findlog['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        findlog['booking_status'] = { [Op.ne]: DELETE };
        let playersList1 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates  :startDate,:endDate',{replacements: {startDate: startDate,endDate:endDate} })
        return Booking.find(ctx, { query: findlog, sort:"id"})
        .then( (res) => {

            let playersList3 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates  :startDate,:endDate',{replacements: {startDate: startOfYear,endDate:endDate} })
            return Booking.find(ctx, { query: findmonth, sort:"id"})
            .then( (resMon) => {

                let playersList2 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates  :startDate,:endDate',{replacements: {startDate: startOfMonth,endDate:endDate} })

                return Booking.find(ctx, { query: findyear, sort:"id"})
                .then( (resYear) => {


                    /*let playersList = await db.sequelize.query('EXEC SP_BookingCount :startDate,:endDate',{replacements: {startDate: startOfYear,endDate:end},type: Sequ.QueryTypes.SELECT})*/



            return this.requestSuccess("Dashboard Count", [dashboard_count,playersList1,playersList2,playersList3]);
                })
            })
        })


    },



    dashboard_counts: async function(ctx) {

        const startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
        const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
        var endDate = moment().add(1, 'days').format('YYYY-MM-DD');

        var WeekCountArr = [];var MonthCountArr = [];var TotalCountArr = [];var BookingoutPut =[]; var BookingSuccess = []; var BookingRejected = []; var BookingCompleted = []; 
        var VendorList = []; var UserList = []; var BookingList = [];
        for (var m = moment(startOfYear); m.isBefore(endDate); m.add(1, 'days')) {

            var new_date = moment(m.format('YYYY-MM-DD'), "YYYY-MM-DD").add(1, 'days');
            var startDate = m.format('YYYY-MM-DD');
            var endDate1 = new_date.format('YYYY-MM-DD');

			let obj = {};
			let obj1 = {};
			let obj2 = {};
			let obj3 = {};
			let playersList2 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates  :date1,:date2',{replacements: {date1: startDate,date2:endDate1} }).then((re) =>{

			console.log('playersList2' , playersList2);
				if(re[0].length>0){
					console.log('re[0]' , re[0].length);
					var dt = {'date': moment(re[0][0].created_at).format("YYYY-MM-DD"), 'count':re[0].length,  'count1':re[0].length, 'booking_status':re[0][0].booking_status, 'status':re[0][0].status}
					re[0].map((data) => {

						obj[moment(data.created_at).format("YYYY-MM-DD")] = data.length;
						if(data.booking_status == 1 ) { obj1 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")  };
						BookingSuccess.push(obj1); }

						if(data.booking_status == 2 || data.booking_status == 3) { obj2 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")   }; BookingRejected.push(obj2); }

						if(data.booking_status == 4 ) { obj3 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")  }; BookingCompleted.push(obj3); }
					})
					// obj[moment(re[0][0].created_at).format("YYYY-MM-DD")] = re[0].length;
					obj["date"] = moment(re[0][0].created_at).format("YYYY-MM-DD");
					obj["count"] = re[0].length;
					TotalCountArr.push(dt);
					MonthCountArr.push(obj);
					re[0].map((x) => {
					})
				}
			})
            let playersList3 = db.sequelize.query('EXEC SP_GetNewVendors  :date1,:date2',{replacements: {date1: startDate,date2:endDate1} }).then((re) =>{
                if(re[0].length>0){
                    console.log('re[0]' , re[0].length);
                    var dt = {'date': moment(re[0][0].created_at).format("YYYY-MM-DD"), 'count':re[0].length, 'status':re[0][0].status}
                    re[0].map((data) => {

                        obj[moment(data.created_at).format("YYYY-MM-DD")] = data.length;
                        if(data.status == 1 ) { obj1 =  { 'date' : moment(data.created_at).format("YYYY-MM-DD")  };
                        VendorList.push(dt); }
                    })
                }
            })
            let playersList4 = db.sequelize.query('EXEC SP_GetNewUsers  :date1,:date2',{replacements: {date1: startDate,date2:endDate1} }).then((re) =>{
                if(re[0].length>0){
                    console.log('re[0]' , re[0].length);
                    var dt = {'date': moment(re[0][0].created_at).format("YYYY-MM-DD"), 'count':re[0].length, 'status':re[0][0].status}
                    re[0].map((data) => {

                        obj[moment(data.created_at).format("YYYY-MM-DD")] = data.length;
                        if(data.status == 1 ) { obj1 =  { 'date' : moment(data.created_at).format("YYYY-MM-DD")  };
                        UserList.push(dt); }
                    })
                }
            })
            let playersList5 = db.sequelize.query('EXEC SP_GetNewBookings  :date1,:date2',{replacements: {date1: startDate,date2:endDate1} }).then((re) =>{
                if(re[0].length>0){
                    console.log('re[0]' , re[0].length);
                    var dt = {'date': moment(re[0][0].created_at).format("YYYY-MM-DD"), 'count':re[0].length, 'status':re[0][0].status}
                    re[0].map((data) => {

                        obj[moment(data.created_at).format("YYYY-MM-DD")] = data.length;
                        if(data.status == 1 ) { obj1 =  { 'date' : moment(data.created_at).format("YYYY-MM-DD")  };
                        BookingList.push(dt); }
                    })
                }
            })
          }
          let dashboard_count;
          if(ctx.params.filterssdate && ctx.params.filtersedate)
          {
            dashboard_count = await db.sequelize.query('EXEC Dashboard_Counts_Filter :FromDate,:ToDate',{replacements: {FromDate: ctx.params.filterssdate,ToDate: ctx.params.filtersedate},type: Sequ.QueryTypes.SELECT});
          } else {
            dashboard_count = await db.sequelize.query('EXEC Dashboard_Counts',{type: Sequ.QueryTypes.SELECT});
          }
        return this.requestSuccess("Dashboard Count", [dashboard_count,MonthCountArr, TotalCountArr, BookingSuccess , BookingRejected , BookingCompleted, VendorList, UserList, BookingList]);
    },



    vendordashboard: async function(ctx) {
        var vendorid = parseInt(ctx.params.id);
        const startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
        const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
        var endDate = moment().add(1, 'days').format('YYYY-MM-DD');

        var WeekCountArr = [];var MonthCountArr = [];var TotalCountArr = [];var BookingoutPut =[]; var BookingSuccess = []; var BookingRejected = []; var BookingCompleted = [];
        for (var m = moment(startOfYear); m.isBefore(endDate); m.add(1, 'days')) {

            var new_date = moment(m.format('YYYY-MM-DD'), "YYYY-MM-DD").add(1, 'days');
            var startDate = m.format('YYYY-MM-DD');
            var endDate1 = new_date.format('YYYY-MM-DD');

			let obj = {};
			let obj1 = {};
			let obj2 = {};
			let obj3 = {};
			let playersList2 = db.sequelize.query('EXEC procSerchPickupHispanicBetweenDates1  :date1,:date2,:vendorid',{replacements: {date1: startDate,date2:endDate1,vendorid:vendorid} }).then((re) =>{

			console.log('playersList2' , playersList2);
				if(re[0].length>0){
					console.log('re[0]' , re[0].length);
					var dt = {'date': moment(re[0][0].created_at).format("YYYY-MM-DD"), 'count':re[0].length,  'count1':re[0].length, 'booking_status':re[0][0].booking_status, 'status':re[0][0].status}
					re[0].map((data) => {

						obj[moment(data.created_at).format("YYYY-MM-DD")] = data.length;
						if(data.booking_status == 1 ) { obj1 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")  };
						BookingSuccess.push(obj1); }

						if(data.booking_status == 2 || data.booking_status == 3) { obj2 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")   }; BookingRejected.push(obj2); }

						if(data.booking_status == 4 ) { obj3 =  {'booking_status' : data.booking_status, 'booking_date' : moment(data.created_at).format("YYYY-MM-DD")  }; BookingCompleted.push(obj3); }
					})
					// obj[moment(re[0][0].created_at).format("YYYY-MM-DD")] = re[0].length;
					obj["date"] = moment(re[0][0].created_at).format("YYYY-MM-DD");
					obj["count"] = re[0].length;
					TotalCountArr.push(dt);
					MonthCountArr.push(obj);
					re[0].map((x) => {
					})
				}
			})
          }
        // let dashboard_count = await db.sequelize.query(`select bs.bookingstatus, (select COUNT(*) from tbooking where status=1 and vendorid=${vendorid} and booking_status=bs.id) [StatusCount]
        // from mbookingstatus bs`);
        // let dashboard_count=[];
        // let cancelled_count = await db.sequelize.query(`select 'Cancelled Count' as bookingstatus,COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and (booking_status=2 or booking_status=3)`);
        // dashboard_count.push(cancelled_count[0][0]);
        // let completed_count = await db.sequelize.query(`select 'Booking Count'as bookingstatus,COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and (booking_status=4)`);
        // dashboard_count.push(completed_count[0][0]);
        // let turnover_count = await db.sequelize.query(`select 'Turnover Count' as bookingstatus,SUM(tbooking.totalcost)[StatusCount] from tbooking where vendorid=${vendorid} and (booking_status=4)`);
        // dashboard_count.push(turnover_count[0][0]);
        let dashboard_count;
          if(ctx.params.filterssdate && ctx.params.filtersedate)
          {
            dashboard_count = await db.sequelize.query(
                `select 'Turnover Count' [bookingstatus],SUM(tbooking.totalcost) [StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 4 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Total Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Completed Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status = 4 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status = 3 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Late Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status = 2 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Confirmed Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status = 1 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'Admin Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status =3 and canceledbyadmin = 1 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')
                union all select 'User Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2 and tbooking.booking_status =3 and canceledbyadmin = 0 and (convert(date, service_date, 105) BETWEEN '${ctx.params.filterssdate}'  AND '${ctx.params.filtersedate}')`
                );
          } else {
            dashboard_count = await db.sequelize.query(
                `select 'Turnover Count' [bookingstatus],SUM(tbooking.totalcost) [StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 4
                union all select 'Total Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and payment_status != 2
                union all select 'Completed Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 4 and payment_status != 2
                union all select 'Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 3 and payment_status != 2
                union all select 'Late Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 2 and payment_status != 2
                union all select 'Confirmed Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status = 1 and payment_status != 2
                union all select 'Admin Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status =3 and canceledbyadmin = 1 and payment_status != 2
                union all select 'User Canceled Booking Count' [bookingstatus],COUNT(*)[StatusCount] from tbooking where vendorid=${vendorid} and tbooking.booking_status =3 and canceledbyadmin = 0  and payment_status != 2`
                );
          }
        return this.requestSuccess("Dashboard Count", [dashboard_count[0],MonthCountArr, TotalCountArr, BookingSuccess , BookingRejected , BookingCompleted]);
    },

    service_available: async function(ctx) {
        return serviceAvailable.find(ctx,{filter:['id', 'service_available'],query:{status:1}})
        .then((res)=>{
            return this.requestSuccess("Service Available Category", res.data)
        })
	},

	generatevendornumber: async function(ctx,res) {
		let lastNum = await db.sequelize.query('SELECT TOP 1 vendornumber from mvendor order by vendornumber DESC');
		if(lastNum && lastNum[0].length && lastNum[0][0].vendornumber) {
			let str= lastNum[0][0].vendornumber;
			let strSplit = str;
			strSplit= parseInt(strSplit)+1;
			console.log(strSplit)
			let len = strSplit.toString().length;
			if(len === 1) {
				strSplit = `00${strSplit}`;
			} else if(len === 2) {
				strSplit = `0${strSplit}`;
			} else {
				strSplit = `${strSplit}`;
			}
			return this.requestSuccess('Saloon number',strSplit);
		} else {
			let str= `001`;
			return this.requestSuccess('Saloon number.',str);
		}
	},
}
