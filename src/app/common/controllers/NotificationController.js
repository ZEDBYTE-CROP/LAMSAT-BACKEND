"use strict";
// DEVELOPED ON 14-07-2020

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const db = require('../../../adapters/db');
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;
const handlebars = require('handlebars');
const mail_template = __dirname;
//Models
const Notification = new Database("Mnotification");
const Notifiactionuser = new Database("Mnotificationuser")


//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation Newsletter
 * @permission create,update,remove,getall,status,get,subscriber_getall,subscriber_remove,subcribers_mail
 */

module.exports = {
    // Service list with multiple language for respective hotel
    getAll: async function(ctx) {
		//administration
		let findObj= {};
		findObj['isviewed'] = 0;
		if(ctx.params.usertype =='vendor' && ctx.params.userid && ctx.params.usertype) {
			findObj['userid'] = ctx.params.userid;
			findObj['usertype'] = ctx.params.usertype;
		}
		if(ctx.params.usertype =='user' && ctx.params.userid && ctx.params.usertype) {
			findObj['customerid'] = ctx.params.userid;
		}
		return Notifiactionuser.count(ctx,findObj)
		.then(async (res) => {
			console.log(res)
			var finArr= [];
			finArr['count'] = res.data;
			let notification;
			if(ctx.params.usertype == 'vendor') {
				notification = await db.sequelize.query(`
					SELECT nu.*, n.notification_title, n.notification_content,n.id
					FROM mnotificationuser nu
					LEFT JOIN mnotification n ON
					nu.notificationid = n.id
					WHERE (n.notification_title !='{"en":"booking refund"}' and n.notification_title !='{"en":"booking completed"}') and
					nu.userid = ${ctx.params.userid} and nu.usertype = '${ctx.params.usertype}'
					ORDER by n.id DESC;
				`);
			} else if (ctx.params.usertype == 'user') {
				notification = await db.sequelize.query(`
					SELECT nu.*, n.notification_title, n.notification_content,n.id
					FROM mnotificationuser nu
					LEFT JOIN mnotification n ON
					nu.notificationid = n.id
					WHERE nu.customerid = ${ctx.params.userid}
					ORDER by n.id DESC;
				`);
			} else {
				notification = await db.sequelize.query(`
					SELECT nu.*, n.notification_title, n.notification_content,n.id
					FROM mnotificationuser nu
					LEFT JOIN mnotification n ON
					nu.notificationid = n.id
					where (n.notification_title <>'{"en":"vendor approval status"}' and
					 n.notification_title <>'{"en":"booking rejected"}'
					 and n.notification_title <>'{"en":"booking completed"}')
					ORDER by n.id DESC;
				`);
			}

			let notData = notification[0].map((item,i) => {
				item['notification_content'] = JSON.parse(item.notification_content);
				item['notification_title'] = JSON.parse(item.notification_title);
			});
			notification[1] = res.data;
			return Promise.all(notData).then(() => {
				return notification;
			});
		})
		.catch((err) => console.log('------',err))
	},
   //Particular Service list in multiple language
    get: async function(ctx) {
        let notification = await db.sequelize.query(`
			SELECT nu.*, n.notification_title, n.notification_content
			FROM mnotificationuser nu
			LEFT JOIN mnotification n ON
			nu.notificationid = n.id
			WHERE n.id = ${ctx.params.id}
		`);
		notification[0][0]['notification_content'] = JSON.parse(notification[0][0].notification_content);
		notification[0][0]['notification_title'] = JSON.parse(notification[0][0].notification_title);
		return this.requestSuccess('Notification founnd',notification[0][0]);

    },

	setviewed: function(ctx) {
        return  Notifiactionuser.findOne(ctx, { query: {
            notificationid: ctx.params.id
        }
        })
        .then ((res) =>{
           return Notifiactionuser.updateBy(ctx, res.data.id, {
                isviewed: 1
                }, { query: {
                    notificationid: ctx.params.id
                }
            })
            .then((res)=>{
                return this.requestSuccess("Set viewed", ctx.params.id);
            })
        })

    },

	setnotificationcount: async function(ctx) {
        var QUERY;
        if(ctx.params.usertype =='vendor') {
            QUERY = `UPDATE mnotificationuser set isviewed = 1 where id IN(
                SELECT nu.id FROM mnotificationuser nu
				LEFT JOIN mnotification n ON
				nu.notificationid = n.id
				WHERE (n.notification_title !='{"en":"booking refund"}' and n.notification_title !='{"en":"booking completed"}') and
				nu.userid = ${ctx.params.userid} and nu.usertype = '${ctx.params.usertype}' and nu.isviewed = 0);`;
		} else if (ctx.params.usertype == 'user') {
			QUERY = `UPDATE mnotificationuser set isviewed = 1 where id IN(
				SELECT nu.id FROM mnotificationuser nu
				LEFT JOIN mnotification n ON
				nu.notificationid = n.id
				WHERE nu.customerid = ${ctx.params.userid} and nu.isviewed = 0);`;
		}
		else {
            QUERY = `UPDATE mnotificationuser set isviewed = 1 where id IN(
                SELECT nu.id FROM mnotificationuser nu
				LEFT JOIN mnotification n ON
				nu.notificationid = n.id
				where (n.notification_title !='{"en":"vendor approval status"}' and
				n.notification_title !='{"en":"booking rejected"}'
				and n.notification_title !='{"en":"booking completed"}')
				and nu.isviewed = 0);`;
        }
        let data = await db.sequelize.query(QUERY);
        return this.requestSuccess("Notificatio Count Updated",data[0]);
    },    
}

