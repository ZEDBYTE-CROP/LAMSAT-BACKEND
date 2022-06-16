"use strict";
// DEVELOPED ON 27-08-2021

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const Config = require("../../../../config");
const SMS = Config.get('/sms');
const url = Config.get('/url');
const mail_template = __dirname;
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require("sequelize").Op;
const activity = require("../../../helpers/activitylog");
const vendor = new Database("Mvendor");
const vendorlang = new Database("Mvendorlang");
const vendorlangfilt = new Database("Mvendorlang");
const Language = new Database("Mlanguage");
const db = require("../../../adapters/db");
const Sequ = require("sequelize");
const https = require('https');
const querystring = require('querystring');
const request = require('request');
const smsrequest = require("request");
const crypto = require("crypto");
const moment = require('moment');
const handlebars = require('handlebars');

const VISA_EID = Config.get('/PAYMENT/EID/VISA');
const MADA_EID = Config.get('/PAYMENT/EID/MADA');
const APPLE_EID = Config.get('/PAYMENT/EID/APPLE');
const PAYMENT_AUTH = Config.get('/PAYMENT/AUTHTOKEN');
const REQ_URL = Config.get('/PAYMENT/SPLIT_PAY/HOST');
const SPLIT_EMAIL = Config.get('/PAYMENT/SPLIT_PAY/EMAIL');
const SPLIT_PASS  = Config.get('/PAYMENT/SPLIT_PAY/PASSWORD');
const CONFIG_ID = Config.get('/PAYMENT/SPLIT_PAY/CID');
const BEN_ACC = Config.get('/PAYMENT/SPLIT_PAY/BEN_ACC');
const HYPER_PAY_URL = Config.get('/PAYMENT/HYPER_PAY/HOST')
//Models
const Transaction = new Database("Mtransaction");
const Booking = new Database("Tbooking");
const Bookingfilt = new Database("Tbooking");
const Bookingtime = new Database("Tbookingtime");
const Splitpay = new Database("Msplitpayauth");
const User = new Database("Muser");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

module.exports = {
	// create checkout ID
	createtnxkey: async function(ctx) {
		return Transaction.insert(ctx, {
			customerid: ctx.params.customerid,
			transactionstatus: 3
		}).then((res) => {
			return this.requestSuccess("Transaction Key created successfully",res.data);
		})
		.catch((err) => {
			return this.requestError("Create Transaction key failed",err);
		})
	},
	completetnx: async function(ctx) {
		return  Transaction.findOne(ctx, { query: {
            id: ctx.params.transactionid
        }
        })
        .then ((res) => {
			return Transaction.updateBy(ctx, res.data.id, {
				transactioncode: ctx.params.transactioncode,
				transactionmode: ctx.params.transactionmode,
				bookingid: ctx.params.bookingid,
				transactionstatus: 2
				}, { query: {
					id: ctx.params.transactionid
				}
			})
            .then((resp)=>{
                return this.requestSuccess("Status of the Transaction Updated");
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
	// create checkout ID
	create: async function(ctx) {
		let EIDType = ctx.params.eid;
		let amount = ctx.params.amount;
		let EID = '';
		(EIDType === 'visa' || EIDType === 'stc') ? EID = VISA_EID : EID = MADA_EID;
		let params = {
			'testMode':'EXTERNAL',
			'merchantTransactionId':ctx.params.transactionkey,
			'customer.email': ctx.params.customeremail,
			'billing.street1': ctx.params.customeraddress,
			'billing.city': ctx.params.customercity,
			'billing.state': ctx.params.customerstate,
			'billing.country': ctx.params.customercountry,
			'billing.postcode': ctx.params.customerpostcode,
			'customer.givenName': ctx.params.customerfirstname,
			'customer.surname':ctx.params.customerlastname,
			'entityId': EID,
			'amount': amount,
			'currency':'SAR',
			'paymentType':'DB'
		}
		if(EIDType === 'apple') { 
			params.entityId = APPLE_EID;
			params.paymentType = 'PA';
			params['paymentBrand'] = 'APPLEPAY';
			params['applePay.source'] = 'web';
		}
		console.log('--params',params);
		async function Request() {
			const path='/v1/checkouts';
			const data = querystring.stringify(params);
			const options = {
				port: 443,
				host: HYPER_PAY_URL,
				path: path,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': data.length,
					'Authorization':`Bearer ${PAYMENT_AUTH}`
				}
			};
			return new Promise((resolve, reject) => {
				const postRequest = https.request(options, function(res) {
					const buf = [];
					res.on('data', chunk => {
						buf.push(Buffer.from(chunk));
					});
					res.on('end', () => {
						const jsonString = Buffer.concat(buf).toString('utf8');
						try {
							resolve(JSON.parse(jsonString));
						} catch (error) {
							reject(error);
						}
					});
				});
				postRequest.on('error', reject);
				postRequest.write(data);
				postRequest.end();
			});
		};
		const checkoutReq = Request();
		return checkoutReq.then((res) => {
			return this.requestSuccess("Payment initiated",res);
		})
		.catch((err) => {
			return this.requestError("Payment initiation failed",err);
		})
	},

	completepayment: async function(ctx) {
		let EIDType = ctx.params.eid;
		let checkoutId = ctx.params.checkoutid;
		let bookingId = ctx.params.bookingid ? ctx.params.bookingid : null;
		let transactionKey = ctx.params.transactionkey ? ctx.params.transactionkey : null;
		let EID = '';
		(EIDType === 'visa' || EIDType === 'stc') ? EID = VISA_EID : EID = MADA_EID;
		if(EIDType === 'apple') { 
			EID = APPLE_EID;
		}
		const request = async () => {
			var path=`/v1/checkouts/${checkoutId}/payment?entityId=${EID}`;
			const options = {
				port: 443,
				host: HYPER_PAY_URL,
				path: path,
				method: 'GET',
				headers: {
					'Authorization':`Bearer ${PAYMENT_AUTH}`
				}
			};
			return new Promise((resolve, reject) => {
				const postRequest = https.request(options, function(res) {
					const buf = [];
					res.on('data', chunk => {
						buf.push(Buffer.from(chunk));
					});
					res.on('end', () => {
						const jsonString = Buffer.concat(buf).toString('utf8');
						try {
							resolve(JSON.parse(jsonString));
						} catch (error) {
							reject(error);
						}
					});
				});
				postRequest.on('error', reject);
				postRequest.end();
			});
		};
		const state = request();
		return state.then((res) => {
			console.log('payment res ------',JSON.stringify(res));
			let transactionID = '';
			if(res.resultDetails && res.resultDetails['response.acquirerCode'] === "00") {
				return  Transaction.findOne(ctx, { query: {
					transactionkey : transactionKey
				}
				})
				.then ((res) => {
					transactionID = res.data.id;
					return Transaction.updateBy(ctx, res.data.id, {
						transactioncode: ctx.params.transactioncode,
						transactionmode: ctx.params.transactionmode,
						bookingid: bookingId,
						checkoutid:checkoutId,
						transactionstatus: 2
						}, { query: {
							id: res.data.id
						}
					})
					.then( async (resp)=>{
						let service_amount = 0;
						let paymentStatus = await Booking.updateBy(ctx,bookingId,
							{payment_status: 1},
							{query:{id:bookingId}}
						).then(async(res) => {
							service_amount = res.servicerate;
							let bookingpaymentStatus = await Bookingtime.updateBy(ctx,bookingId,
								{payment_status: 1},
								{query:{bookingid:bookingId}}
							).then(async(res) =>
								console.log('bookingtime updated success---'))
							.catch((err) => console.log('bookingtime -----',err))
						}).catch((err) => console.log('-----',err))
						let split_token = await Splitpay.findOne(ctx,{ query: {status:1}});
						var that = this;
						let AUTH_TOKEN = split_token.data.token;
						async function get_vendordetails(ctx, bookingid) {
							let booking_data = await Booking.find(ctx,{query:{id:bookingid}}).then((res) => {return res});
							let vendor_data = await vendor.find(ctx,{query:{id:booking_data.data[0].vendorid}}).then((res) => {return res});
							return vendor_data.data[0];
						}
						const re_data = get_vendordetails(ctx,ctx.params.bookingid);
						re_data.then(async(res) => {
							console.log('vendor data',res);
							let bank_detail = {};
							bank_detail["name"] = res.username;
							bank_detail["accountId"] = res.bankaccountnumber;
							bank_detail["debitCurrency"] = "SAR";
							bank_detail["transferCurrency"] = "SAR";
							bank_detail["transferAmount"] = service_amount;
							if( res.bankidbic) {bank_detail["bankIdBIC"] = res.bankidbic;}
							bank_detail["payoutBeneficiaryAddress1"] = `${res.partnerAddress} ${res.partnerRegion}`;
							bank_detail["payoutBeneficiaryAddress2"] = `${res.partnerAddress} ${res.partnerRegion}`;
							bank_detail["payoutBeneficiaryAddress3"] = `${res.partnerAddress} ${res.partnerRegion}`;
							let orderdata = {
								"merchantTransactionId": transactionID,
								"transferOption": "7",
								"period": moment().format("YYYY-MM-DD"),
								"batchDescription": "Transfer fund to beneficiary",
								"configId": CONFIG_ID,
								"beneficiary": [
									bank_detail
								]
							}
							let booking_id_data = await Booking.find(ctx,{query:{id:ctx.params.bookingid}}).then((res) => {return res});
							let vendor_data = await vendor.find(ctx,{query:{id:booking_id_data.data[0].vendorid}}).then((res) => {return res});
							let vendorlang_data = await vendorlang.find(ctx,{query:{vendorid: vendor_data.data[0].id,languageid:1}}).then((res) => {return res});

							let User_name_data =await User.find(ctx,{query:{id:booking_id_data.data[0].vendorid}}).then((res) => {return res});

							let MobileNumber = User_name_data.data[0].contactnumber;
							let Sender_Id = "LAMSAT";
							let MsgContent =  "Hi "+User_name_data.data[0].firstname +" "+User_name_data.data[0].lastname+", your appointment with "+vendorlang_data.data[0].vendorname+" salon is confirmed";
							let CountryCode = "966";
							let NewMobileNumber = MobileNumber.replace("+" + CountryCode, "");
							var urlSendSMS = `${SMS.url}?user=${SMS.user}&pwd=${SMS.pwd}&senderid=${SMS.sid}&CountryCode=${CountryCode}&msgtext=${MsgContent}&mobileno=${NewMobileNumber}`;
							console.log(urlSendSMS);

							smsrequest({
								url: urlSendSMS,
								method: "GET",
							}, function(error, response, body){
								if(error) {
									console.log( "Errrrorrr" , error);
								} else {
									console.log("Response Status & body " , response.statusCode, body);
								}
							});

							return new Promise(function (resolve,reject) {
								request({
									method: 'POST',
									url: `${REQ_URL}orders`,
									headers: {
										'Content-Type': 'application/json',
										'Accept': 'application/json',
										'Authorization': `Bearer ${AUTH_TOKEN}`
									},
									body: JSON.stringify(BEN_ACC)
								}, function (error, response, body) {
									console.log('Status:', response.statusCode);
									console.log('Headers:', JSON.stringify(response.headers));
									console.log('Response:', body);
									if(error) {
										reject(error);
									}
										resolve(response);
								});
							}).then((res) => {
								let RES = JSON.parse(res.body);
							})
						})
						return this.requestSuccess("Status of the Transaction Updated",{status:true});
					})

				})
				.catch( (err) => {
					console.log('------ error',err)
					ctx.meta.log = "Attempt to change user status failed.";
					activity.setLog(ctx);
					if (err.name === 'Nothing Found')
						return this.requestError(CodeTypes.NOTHING_FOUND);
					else if (err instanceof MoleculerError)
						return Promise.reject(err);
					else
						return this.requestError(err);

				});
			} else {
				console.log('afaileleeee----')
				let findbooking = {};
        		findbooking['id'] = bookingId ;
				return Booking.find(ctx, { query: findbooking })
        		.then( async(res) => {
					
					let paymentStatusfailed = await Booking.updateBy(ctx,bookingId,
						{payment_status: 2},
						{query:{id:bookingId}}
					).then(async(res) => {
						let bookingpaymentStatus = await Bookingtime.updateBy(ctx,bookingId,
							{payment_status: 2},
							{query:{bookingid:bookingId}}
						).then(async(res) =>
							console.log('bookingtime updated success---'))
						.catch((err) => console.log('bookingtime -----',err))
					}).catch((err) => console.log('-----',err))
				
					const cutomerdetails = JSON.parse(res.data[0].customerdetails);
					const BookingNo = res.data[0].bookingno;
					const URL = url.url;
					const LOGO = `${URL}logo.png`;
					const b_date = moment(res.data[0].created_at).format('L');
					const b_time = moment(res.data[0].created_at).format('LT');
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
					readHTMLFile(mail_template + "/BookingfailedTemplate.html", function(err, html) {
						let template = handlebars.compile(html);
						let replacements = {
							logo: LOGO,
							booking_date: b_date,
							booking_time: b_time,
							booking_id: BookingNo,
							message12: "Your Booking Failed "
						};
						const htmlToSend = template(replacements);
						// this method call the mail service to send mail
						ctx.call("mail.send", {
							to: cutomerdetails[0].email,
							subject: "Booking Details",
							html: htmlToSend
						}).then((res) => {
							return "Email send Successfully";
						})
					});
					return this.requestSuccess("Payment failed!",{status:false});
				});
			}
		})

	},
	completesplitpay: async function(ctx) {
		// Data from configuration
		var secretFromConfiguration = "5899911F84980700643C0398D5272A776F68A9300FCF828ADF6813BFF381F50F";
		// Data from server
		var ivfromHttpHeader = "000000000000000000000000";
		var authTagFromHttpHeader = "CE573FB7A41AB78E743180DC83FF09BD";
		var httpBody = "0A3471C72D9BE49A8520F79C66BBD9A12FF9";

		// Convert data to process
		var key = new Buffer(secretFromConfiguration, "hex");
		var iv = new Buffer(ivfromHttpHeader, "hex");
		var authTag = new Buffer(authTagFromHttpHeader, "hex");
		var cipherText = new Buffer(httpBody, "hex");

		// Prepare descryption
		var decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt
		var result = decipher.update(cipherText) + decipher.final();
		console.log(result);

	},
	splitpaylogin: async function(ctx) {
		let split_token = await Splitpay.findOne(ctx,{ query: {status:1}});
		var that = this;
		let AUTH_TOKEN = split_token.data.token;
		async function get_vendordetails(ctx, bookingid) {
			let booking_data = await Booking.find(ctx,{query:{id:bookingid}}).then((res) => {return res});
			let vendor_data = await vendor.find(ctx,{query:{id:booking_data.data[0].vendorid}}).then((res) => {return res});
			return vendor_data.data[0];
		}
		const re_data = get_vendordetails(ctx,ctx.params.bookingid);
		re_data.then((res) => {
			console.log('vendor data',res);
			let bank_detail = {};
			bank_detail["name"] = res.username;
			bank_detail["accountId"] = res.bankaccountnumber;
			bank_detail["debitCurrency"] = "SAR";
			bank_detail["transferCurrency"] = "SAR";
			bank_detail["transferAmount"] = "50";
			bank_detail["bankIdBIC"] = res.bankiban;
			bank_detail["payoutBeneficiaryAddress1"] = `${res.partnerAddress} ${res.partnerRegion}`;
			bank_detail["payoutBeneficiaryAddress2"] = `${res.partnerAddress} ${res.partnerRegion}`;
			bank_detail["payoutBeneficiaryAddress3"] = `${res.partnerAddress} ${res.partnerRegion}`;
			let orderdata = {
				"merchantTransactionId": ctx.params.transactionid,
				"transferOption": "7",
				"period": ctx.params.period,
				"batchDescription": "Transfer fund to beneficiary",
				"configId": CONFIG_ID,
				"beneficiary": [
					bank_detail
				]
			}
			return new Promise(function (resolve,reject) {
				request({
					method: 'POST',
					url: `${REQ_URL}orders`,
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': `Bearer ${AUTH_TOKEN}`
					},
					body: JSON.stringify(BEN_ACC)
				}, function (error, response, body) {
					console.log('Status:', response.statusCode);
					console.log('Headers:', JSON.stringify(response.headers));
					console.log('Response:', body);
					if(error) {
						reject(error);
					}
						resolve(response);
				});
			}).then((res) => {
				var that = this;
				let RES = JSON.parse(res.body);
				console.log('------',RES)
				if(res.statusCode == 200) {
					return  Transaction.findOne(ctx, { query: {
						id: ctx.params.transactionid
					}
					})
					.then ((res) => {
						return Transaction.updateBy(ctx, res.data.id, {
							bookingid: ctx.params.bookingid,
							transactionstatus: 2
							}, { query: {
								id: ctx.params.transactionid
							}
						})
						.then((resp)=>{
							return that.requestSuccess("Status of the Transaction Updated");
						})
					})
					.catch( (err) => {
						console.log('--err',err);
						ctx.meta.log = "Attempt to change user status failed.";
						activity.setLog(ctx);
						if (err.name === 'Nothing Found')
							return that.requestError(CodeTypes.NOTHING_FOUND);
						else if (err instanceof MoleculerError)
							return Promise.reject(err);
						else
							return this.requestError(err);
					});
				}
			})
		})

	},
	splitpaynotification: async function(ctx) {
		// Data from configuration
		var secretFromConfiguration = "5899911F84980700643C0398D5272A776F68A9300FCF828ADF6813BFF381F50F";
		// Data from server
		var ivfromHttpHeader = "000000000000000000000000";
		var authTagFromHttpHeader = "CE573FB7A41AB78E743180DC83FF09BD";
		var httpBody = "0A3471C72D9BE49A8520F79C66BBD9A12FF9";

		// Convert data to process
		var key = new Buffer(secretFromConfiguration, "hex");
		var iv = new Buffer(ivfromHttpHeader, "hex");
		var authTag = new Buffer(authTagFromHttpHeader, "hex");
		var cipherText = new Buffer(httpBody, "hex");

		// Prepare descryption
		var decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(authTag);

		// Decrypt
		var result = decipher.update(cipherText) + decipher.final();
		console.log(result);
	}

};
