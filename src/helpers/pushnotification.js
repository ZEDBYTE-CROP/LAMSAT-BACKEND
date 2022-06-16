"use strict";

const Promise = require("bluebird");
const { MoleculerError } 	= require("moleculer").Errors;
const Config = require("../../config");
const Constants = require("../../plugin/constants");
const Database = require("../adapters/Database");
const configData = Config.get('/ONESIGNAL');

// const Sniffr = require("sniffr");
// const s = new Sniffr();

//Models
const Admin = new Database("Madmin");
const Notification = new Database("Mnotification");
const Notificationuser = new Database("Mnotificationuser");

module.exports = {
	sendAdmin: function(obj) {
		return new Promise((resolve, reject) => {
			var data = {
				app_id: configData.app_id,
				contents: obj.msg,
				channel_for_external_user_ids: "push",
				include_external_user_ids: [obj.userkey]
			};
			if(obj.heading) {data["heading"] = obj.heading}
			if(obj.data) {data["data"] = obj.data}
			var headers = {
				"Content-Type": "application/json; charset=utf-8",
				"Authorization": `Basic ${configData.rest_auth}`
			};


			var options = {
				host: configData.host,
				port: 443,
				path: configData.push_path,
				method: "POST",
				headers: headers
			};

			var https = require('https');
			var req = https.request(options, function(res) {
				var body = [];
				res.on('data', function(data) {
					console.log("Response:");
					console.log(JSON.parse(data));
					body.push(data);
				});
				res.on('end', function() {
					try {
						body = JSON.parse(Buffer.concat(body).toString());
					} catch(e) {
						reject(e);
					}
					resolve(body);
				});
			});

			req.on('error', function(e) {
				console.log("ERROR:");
				console.log(e);
				reject(e.message);
			});

			req.write(JSON.stringify(data));
			req.end();
		});
	},
	getAdmin: function (ctx,id) {
		return  Admin.findOne(ctx, { query: {
			id: id
		}
		})
		.then((res)=>{
			return res;
		})
	},
	saveNotification: function (ctx,obj) {
		let notData = {
			notification_title: obj.title,
			notification_content: obj.content
		}
		return Notification.insert(ctx,notData)
		.then((res) => {
			let notUserData = {
				notificationid: res.data.id,
				userid: obj.userid,
				customerid: obj.customerid ? obj.customerid : 0 ,
				usertype: obj.usertype,
				isdelivered: obj.isdelivered
			};
			return Notificationuser.insert(ctx,notUserData)
			.then((nures) => {
				console.log('-----',nures)
			})
			.catch((err) => console.log('error----',err))
		})
		.catch((err) => console.log('error----',err))
	},
}
