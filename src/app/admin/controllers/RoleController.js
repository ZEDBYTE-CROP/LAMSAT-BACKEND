"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const assert = require('assert');
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const Sequ = require("sequelize");
var annotations = require('annotations');

//Models
const Role = new Database("Mrole");
const Admin = new Database("Madmin");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation role
 * @permission create,update,remove,status,getone
 * @whitelist get,getactive,getall
 */
module.exports = {

    // Role creation
    create: async function(ctx) {

        let findemail = {};
        findemail['email'] = ctx.params.email;
		let findrole = {};
        findrole['rolename'] = ctx.params.rolename ;
        findrole['status'] = {[Op.ne]: 2} ;
        return Role.find(ctx, { query: findrole })
        .then((res) => {
            if (res.data.length === 0) {
                return Role.insert(ctx, {
                    rolename: ctx.params.rolename,
                    role_json: ctx.params.role_json,
                    status: ctx.params.status
                });
            }
            else {
                return this.requestError(CodeTypes.ALREADY_EXIST);
            }
        }).then((res) => {
            return this.requestSuccess("Role details inserted successfully!",res);
        });
    },

	getall: function(ctx) {
        let findrole = {'status':{ [Op.ne]: 2 }};
        return Role.find(ctx, { query: findrole })
        .then( (res) => {
            return this.requestSuccess("List of Roles", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

	getactive: function(ctx) {
        let findrole = {'status':{ [Op.eq]: 1 }};
        return Role.find(ctx, { query: findrole })
        .then( (res) => {
            return this.requestSuccess("List of Roles", res.data);
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        });
    },

    getone: function(ctx) {
        let findrole = {'id' : ctx.params.id};
        var Output = [];
        var out = [];
        var FinalOut = [];
        var dirLink = __dirname;
        var final = [];
        var dirLink2 = path.join(__dirname, '/../../common/controllers/');
            return  dirDetails(dirLink)
            .then ((res) =>{
               return dirDetails(dirLink2).then((out2) => {
                    out.push(res);
                    out.push(out2);
                    return this.requestSuccess("List of Role", out);
                })
            }).then((r) =>{
                let total_array = r.data;
                const get_AnnnotationDetails = async(x , link) =>
                path.extname(link+'/'+x) == '.js' ? annotations.get(link+'/'+x).then ((res) =>{
                    if (!isEmpty(res) && res!= null && !isEmpty(res.module)){
                        var json = {'id': res.module.annotation,'list': res.module.permission}
                        Output.push(json);
                    }return Output;
                }):''
                async function get_AnnnotationLists(annList , link) {
                    for(var i = 0;i<annList.length;i++) {
                        let language_val_filter = await get_AnnnotationDetails(annList[i] , link)
                        .then((annoDetail)=>{
                            return annoDetail;
                        });
                    }
                }
                const vali =  get_AnnnotationLists(total_array[0] ,dirLink );
                return vali.then((resy)=>{
                    return get_AnnnotationLists(total_array[1] ,dirLink2).then((resy1)=>{
                    return (Output);
                    })
                })
            }).then((r1) =>{
                return Role.find(ctx, { query: findrole })
                .then( (res) => {
                    let evalData = eval(JSON.stringify(res.data[0].role_json));
                    evalData = evalData.replace('[','');
                    evalData = evalData.replace(']','');
                    evalData = evalData.replace("\'","'");
                    let final   = evalData.replace(/ /g,'');
                    var result =0, childData = [], parentForm = [],rxp = /{([^}]+)}/g,curMatch;
                    while( curMatch = rxp.exec( final ) ) {
                        let obj = eval('({' + curMatch[1] + '})');
                        childData.push( obj.id.charAt(0).toUpperCase() + obj.id.slice(1) );
                        var p = obj.id.split("/");
                        var parentName = p[0].charAt(0).toUpperCase() + p[0].slice(1);


                        (!parentForm.includes(parentName)) ? parentForm.push(parentName):'';
                        //    parentForm.push(p[0]);
                    }
                    r1.map((parent, i) => {
                       /* if(parentForm.length > 0 && parentForm.includes(parent.id) ){
                            if(parent.list.length > 0){
                                var cnt =  parent.list.split(",");
                                var tempCnt = 0;
                                cnt.map((c1, i) => {
                                    childData.includes(parent.id+'/'+c1)?tempCnt++:'';
                                })
                                if(cnt.length != tempCnt)
                                {
                                    var index = parentForm.indexOf(parent.id);
                                    if (index > -1) {
                                        parentForm.splice(index, 1);
                                    }
                                }
                            }
                        }*/
                    })
                    res.data[0].role_child=childData;
                    res.data[0].role_parent=parentForm;
                    res.data[0].role_json=r1;
                    return this.requestSuccess("List of Roles", res);
                })
                    //  return this.requestSuccess("List of Roles", Output);
            })
    },
    //status updation for role
    status: function(ctx) {
        return  Admin.findOne(ctx, { query: {
            roleid: ctx.params.id,
            status:1
        }
        })
        .then ((res) =>{
            if(typeof res.data == "undefined"){
                    Role.updateBy(ctx, ctx.params.id, {
                        status: ctx.params.status == "1" ? "0" : "1"
                        }, { query: {
                            id: ctx.params.id
                        }
                    }).then((r)=>{
                        return this.requestSuccess("Status Changed", r);
                    })
            }else{
                return this.requestError("Status Not Changed, Role Assigned to administrator's ", res);
            }
            return this.requestSuccess("Status Changed", res);
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

    get: function(ctx) {
        var Output = [];
        var out = [];
        var FinalOut = [];
        var dirLink = __dirname;
        var final = [];
        var dirLink2 = path.join(__dirname, '/../../common/controllers/');
            return  dirDetails(dirLink)
            .then ((res) =>{
               return dirDetails(dirLink2).then((out2) => {
                    out.push(res);
                    out.push(out2);
                    return this.requestSuccess("List of Role", out);
                })
            }).then((r) =>{
               let total_array = r.data;
               const get_AnnnotationDetails = async(x , link) =>
               path.extname(link+'/'+x) == '.js' ? annotations.get(link+'/'+x)
               .then ((res) =>{
                        if (!isEmpty(res) && res!= null && !isEmpty(res.module)){
                            var json = {'id': res.module.annotation,'list': res.module.permission}
                            Output.push(json);
                        }return Output;
                }):''

                async function get_AnnnotationLists(annList , link) {
                    for(var i = 0;i<annList.length;i++) {
                        let language_val_filter = await get_AnnnotationDetails(annList[i] , link)
                        .then((annoDetail)=>{
                            return annoDetail;
                        });
                    }
                }
                const vali =  get_AnnnotationLists(total_array[0] ,dirLink );
                return vali.then((resy)=>{
                    return get_AnnnotationLists(total_array[1] ,dirLink2).then((resy1)=>{
                    return (Output);
                    })
                })

            }).then((r1) =>{
                return this.requestSuccess("List of Roles", Output);
            })
    },
    //Role update

    update: async function(ctx) {
        //findrole['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        let condition = {
            'rolename' : ctx.params.rolename,
            'id':{ [Op.ne]: ctx.params.id }
        };
        return Role.find(ctx, { query: condition })
        .then ((res) => {
            if (res.data.length == 0)
            {
                return Role.updateBy(ctx, 1, {
                    rolename: ctx.params.rolename,
                    role_json: ctx.params.role_json,
                    status: ctx.params.status
                    }, { query: {
                        id: ctx.params.id
                        }
                    })
            }
            else
            {
                return this.requestError(CodeTypes.ALREADY_EXIST);
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
                return this.requestError(CodeTypes.UNKOWN_ERROR);
        }).then((res) => {
            return this.requestSuccess("Admin details updated successfully!",res);
        });

    },
    //Role delete is used change the status and not complete delete

    remove: function(ctx) {
        return  Role.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
           return Admin.findOne(ctx, { query: {
                roleid: ctx.params.id
            }
            }).then((r) =>{
                if(typeof r.data !== "undefined")
                {
                    return this.requestError(CodeTypes.USERS_FORBIDDEN_REMOVE);
                    //return this.requestSuccess("Role is Assigned to Admin,So cant delete!" , r.data);
                }else{
                   return Role.updateBy(ctx, res.data.id, {
                        status: 2
                        }, { query: {
                            id: ctx.params.id
                        }
                    }).then((x)=>{
                        return this.requestSuccess("Role deleted successfully!", ctx.params.id);

                    })
                }
            })
        })

    }
}



function isEmpty(obj)
{
    var i=0;
    for (var key in obj) {
      //  console.log( ++i ,'---' ,    obj , key)
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}


async function dirDetails(testFolder) {

    var arr = [];
    let jam = fs.readdirSync(testFolder);
    jam.sort(function(a, b) {
        //return a;
     })
    //    let yut = fs.readdir(testFolder, (err, files) => {
    //         var i = 0;
    //          let country_name = files.forEach(file => {
    //              console.log("EEEFFFFFFFFFFFFF",file)
    //             arr.push(file);
    //         })
    //     });
        return jam;
    }
