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


//Models
const db = require('../../../adapters/db');
const Sequ = require("sequelize");
const Service = new Database("Mservice");
const Servicelang = new Database("Mservicelang");
const Serviceprice = new Database("Mserviceprice");
const Servicestaff = new Database("Mservicestaff");
//This model is for display static services
const Ourservice = new Database("Mourservice");
const Ourservicefilt = new Database("Mourservice", [
    "id",
    "servicekey",
    "servicename",
    "serviceimage"
]);
const Vendor = new Database("Mvendor");
const Vendorlang= new Database("Mvendorlang");
const Vendorlangfilt= new Database("Mvendorlang");
const Categorylangfilt = new Database("Mcategorylang", [
    "id",
    "mcategorylangkey",
    "languageid",
    "langshortname",
    "categoryid",
    "categoryname",
    "created_by",
    "created_at",
])
const Staff = new Database("Mvendorstaff");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation service
 * @permission create,update,remove,status,getvendorservice
 * @whitelist getall,get,getall_mob,getall_web,serviceApprovalReject
*/
module.exports = {
    // Service creation with multiple language
    create: async function(ctx) {

            var langid = [];
            var langname = [];
            var testname = "";
            ctx.params.language.map((item)=>{
                langid.push(item.languageid);
                langname.push(item.servicename);
            });
            let wherecond = {
                languageid: langid,
                servicename: langname,
                status: 1,
                vendorid: ctx.params.vendorid
            };
            return Servicelang.find(ctx, { query: wherecond })
            .then((res)=>{
                if(res.data.length === 0) {
                    let sev_staff = ctx.params.service_staff.toString();
                    return Service.insert(ctx, {
                        vendorid: ctx.params.vendorid,
						categoryid: ctx.params.categoryid,
						admincategoryid: ctx.params.categoryid,
                        availability: ctx.params.availability,
                        tax: ctx.params.tax,
                        permission: ctx.params.permission,
                        photopath: ctx.params.photopath,
                        image_url: ctx.params.image_url,
                        //service_staff: sev_staff
                    })
                    .then((res)=>{
                        // ctx.params.service_staff.map(async(staff)=>{
                        //     let staff_det = await Staff.findOne(ctx,{query: {
                        //         id: staff
                        //     }});
                        //     var temp = staff_det.data.serviceid;
                        //     if(temp != null){
                        //         var temp_arr = temp.split(",");
                        //         var serv_id  = res.data.id.toString();
                        //         if(temp_arr.includes(serv_id) != true){
                        //             temp_arr.push(serv_id);
                        //             var jam = temp_arr.toString();
                        //             Staff.updateBy(ctx, 1, {
                        //                 serviceid: jam
                        //                 }, { query: {
                        //                     id: staff
                        //                 }
                        //             })
                        //         }
                        //     }
                        // })

                        ctx.params.language.map((lan_item)=>{
                            Servicelang.insert(ctx, {
                                languageid: lan_item.languageid,
                                langshortname: lan_item.langshortname,
                                servicename: lan_item.servicename,
                                vendorid: ctx.params.vendorid,
                                serviceid: res.data.id,
                                description: ctx.params.description
                            })
                        })

                        ctx.params.price.map((price)=>{
                            Serviceprice.insert(ctx,{
                                vendorid: ctx.params.vendorid,
                                serviceid: res.data.id,
                                pricing_name: price.pricing_name,
								duration: this.convetToMin(price.duration),
                                pricetype: price.pricetype,
                                price: price.price,
                                special_price: price.special_price
                            })
                        })
                        return this.requestSuccess("Service Created", ctx.params.language[0].servicename);
                    })
                }
                else {
                    return this.requestError(`Service Name ${ res.data[0].servicename } ${CodeTypes.ALREADY_EXIST}`);
                }
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




    // Service list with multiple language for respective vendor
	getall_web: async function(ctx) {
		const languageid = 1;
		let category_list = await db.sequelize.query('EXEC SP_GetCategoryByVendor :languageid, :vendorid',{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid, vendorid: ctx.params.vendorid},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess('Services found!', category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : '');
	},


	//Service list for admin
	getall: async function(ctx) {
        const languageid = 1;
		let category_list = await db.sequelize.query('EXEC SP_GetCategoryByVendor :languageid, :vendorid, :status',{replacements: {languageid: ctx.options.parentCtx.params.req.headers.language ? ctx.options.parentCtx.params.req.headers.language : languageid, vendorid: ctx.params.vendorid, status: 'All'},type: Sequ.QueryTypes.SELECT});
		return this.requestSuccess('Services found!', category_list && category_list.length > 0 ? JSON.parse(category_list[0].details) : '');
	},

	// Service list with multiple language for respective vendor
    getall_mob: function(ctx) {
        let findservice = {};
        if(ctx.params.vendorid) {
            findservice['vendorid'] = ctx.params.vendorid;
        }
        if(ctx.params.categoryid) {
            findservice['categoryid'] = ctx.params.categoryid;
        }
        findservice['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Service.find(ctx, { query: findservice })
        .then( (res) => {
            var arr = res.data;
            async function get_services(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    //converting string of staff id's into array
                    //let ser_staff = arr[i].service_staff.split(",");
                    //arr[i]['service_staff'] = ser_staff;

                    let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["categoryname"] = lan_res.data[0].categoryname;
                        return arr[i];
                    });

                    let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["servicename"] = lan_res.data[0].servicename;
                        return arr[i];
                    });

                    // let language_val1 = await Servicelang.find(ctx, { filter: ['languageid', 'servicename','description'],query: {serviceid: arr[i].id}})
                    // .then((lan_res)=>{
                    //     arr[i]["language"] = lan_res.data;
                    //     return arr[i];
                    // });

                    let price_option = await Serviceprice.find(ctx, { filter: ['id','pricing_name', 'duration','pricetype', 'price', 'special_price'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["price"] = lan_res.data;
                        return arr[i];
                    })

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_services(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Services found!',resy);

            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    //status updation for Status in both language
    status: function(ctx) {
        return  Service.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Service.updateBy(ctx, res.data.id, {
                status: ctx.params.status
                }, { query: {
                    id: ctx.params.id
                }
            })
            let update = {};
                update["status"] = ctx.params.status;
            let des = {};
				des["serviceid"] = ctx.params.id;
                Servicelang.updateMany(ctx,des,update);
                Serviceprice.updateMany(ctx,des,update);
                Servicestaff.updateMany(ctx, des, update);
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
   //Particular Service list in multiple language
    get: function(ctx) {
        let findservice = {};
        findservice['id'] = ctx.params.id;
        findservice['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Service.find(ctx, { query: findservice })
        .then( (res) => {
            var arr = res.data;
            async function get_services(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    //converting string of staff id's into array
                    //let ser_staff = arr[i].service_staff.split(",");
                    //arr[i]['service_staff'] = ser_staff;

                    let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["categoryname"] = lan_res.data[0].categoryname;
                        return arr[i];
                    });

                    let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["servicename"] = lan_res.data[0].servicename;
                        return arr[i];
                    });

                    let language_val1 = await Servicelang.find(ctx, { filter: ['id','languageid', 'servicename','description'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["language"] = lan_res.data;
                        return arr[i];
                    });

                    let price_option = await Serviceprice.find(ctx, { filter: ['id','pricing_name', 'duration','pricetype', 'price', 'special_price'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["price"] = lan_res.data;
                        return arr[i];
                    })
                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_services(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Service found!',resy);
            })
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
    },
    //Service update for mutiple language (all fields are mandatory)
    update: async function(ctx) {

        /*
            To validate the primary language
            field already exist and to convert the first letter
            in caps and remaining small
            below map function and capitalized function is used
        */
        var langid = [];
        var langname = [];
        var testname = "";
        ctx.params.language.map((item)=>{
            langid.push(item.languageid);
            langname.push(item.servicename);

        });
        let wherecond = {
            languageid: langid,
            servicename: langname,
            status: 1,
            vendorid: ctx.params.vendorid,
            serviceid: {[Op.ne]: ctx.params.id}
        };

        await Serviceprice.removeMany(ctx,{
            serviceid: ctx.params.id
        })
        return Servicelang.find(ctx, { query: wherecond })
        .then ((res) => {
            if (res.data.length === 0)
            {
                //let sev_staff = ctx.params.service_staff.toString();
                Service.updateBy(ctx, 1, {
					categoryid: ctx.params.categoryid,
					admincategoryid: ctx.params.categoryid,
                    vendorid: ctx.params.vendorid,
                    availability: ctx.params.availability,
                    tax: ctx.params.tax,
                    photopath: ctx.params.photopath,
                    image_url: ctx.params.image_url,
                    //service_staff: sev_staff
                }, { query: {
                        id: ctx.params.id
                    }
                }).then((res)=>{
                    ctx.params.language.map((lan_item)=>{
                        Servicelang.find(ctx, { query: {serviceid: ctx.params.id,languageid: lan_item.languageid} })
                        .then((result)=>{
                            if(result.data.length === 0)
                            {
                                Servicelang.insert(ctx, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    servicename: lan_item.servicename,
                                    vendorid: ctx.params.vendorid,
                                    serviceid: ctx.params.id,
                                    description: ctx.params.description
                                })
                            }
                            else {
                                Servicelang.updateBy(ctx, 1, {
                                    languageid: lan_item.languageid,
                                    langshortname: lan_item.langshortname,
                                    servicename: lan_item.servicename,
                                    vendorid: ctx.params.vendorid,
                                    description: ctx.params.description
                                }, { query: {
                                    languageid: lan_item.languageid,
                                    serviceid: ctx.params.id
                                    }
                                })
                            }
                        })
                    })

                    ctx.params.price.map((value)=>{
                        Serviceprice.insert(ctx,{
                            vendorid: ctx.params.vendorid,
                            serviceid: ctx.params.id,
                            pricing_name: value.pricing_name,
							duration: this.convetToMin(value.duration),
                            pricetype: value.pricetype,
                            price: value.price,
                            special_price: value.special_price
                        });
                    })
                })
                return this.requestSuccess("Service Updated", ctx.params.language[0].servicename);
            }
            else
            {
                return this.requestError(`Service Name ${ res.data[0].servicename } ${CodeTypes.ALREADY_EXIST}`);
            }
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
    //Service delete is used change the status and not complete delete
    remove: function(ctx) {
        return  Service.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Service.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            })
            let update = {};
                update["status"] = 2;
            let des = {};
				des["serviceid"] = ctx.params.id;
                Servicelang.updateMany(ctx,des,update);
                Serviceprice.updateMany(ctx,des,update);
                Servicestaff.updateMany(ctx, des, update);
            return this.requestSuccess("Status Changed", ctx.params.id);
        })
    },

    serviceApprovalReject: function(ctx) {
        return  Service.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            Service.updateBy(ctx, res.data.id, {
                permission: ctx.params.field
                }, { query: {
                    id: ctx.params.id
                }
            })
            return this.requestSuccess("Permission Status Changed", ctx.params.id);
        })
    },

    getvendorservice : function(ctx){

        let findservice = {};
        if(ctx.params.vendorid) {
            findservice['vendorid'] = ctx.params.vendorid;
        }
        findservice['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return Service.find(ctx, { query: findservice })
        .then( (res) => {
            var arr = res.data;
            async function get_services(ctx, arr) {
                let final = [];
                for(var i = 0;i<arr.length;i++) {
                    //converting string of staff id's into array
                    /*let ser_staff = arr[i].service_staff.split(",");
                    arr[i]['service_staff'] = ser_staff;

                    let subject_lang = await Categorylangfilt.find(ctx, { query: {categoryid: arr[i].categoryid,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["categoryname"] = lan_res.data[0].categoryname;
                        return arr[i];
                    });*/

                    let language_val = await Servicelang.find(ctx, { query: {serviceid: arr[i].id,languageid: ctx.options.parentCtx.params.req.headers.language}})
                    .then((lan_res)=>{
                        arr[i]["servicename"] = lan_res.data[0].servicename;
                        return arr[i];
                    });

                    // let language_val1 = await Servicelang.find(ctx, { filter: ['languageid', 'servicename','description'],query: {serviceid: arr[i].id}})
                    // .then((lan_res)=>{
                    //     arr[i]["language"] = lan_res.data;
                    //     return arr[i];
                    // });

                   /* let price_option = await Serviceprice.find(ctx, { filter: ['id','pricing_name', 'duration','pricetype', 'price', 'special_price'],query: {serviceid: arr[i].id}})
                    .then((lan_res)=>{
                        arr[i]["price"] = lan_res.data;
                        return arr[i];
                    })*/

                    final.push(language_val);
                }
                return final;
            }
            const vali =  get_services(ctx,arr);
            return vali.then((resy)=>{
                return this.requestSuccess('Services found!',resy);

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
