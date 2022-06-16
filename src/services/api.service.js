"use strict";

const ApiGateway = require("moleculer-web");
const { MoleculerError } = require("moleculer").Errors;
const Promise = require("bluebird");

const CodeTypes = require("../fixtures/error.codes");
const Config = require("../../config");
const Request = require("../mixins/request.mixin");
const Routes = require("../routes/index");
let fs	 = require("fs");
let path = require("path");
console.log('config : ', Config);
module.exports = {
	name: "api",

	mixins: [
		ApiGateway,
		Request
	],

	settings: {
		port: Config.get('/server/port/api'),

		 cors: {
			origin: ["https://localhost:9012","http://localhost:9012",
			"http://lamsat.duceapps.com/","https://lamsat.duceapps.com/",
			"http://lamsat.app/","https://lamsat.app/",
			"https://3.238.136.245:9012/","http://3.238.136.245:9012/",
			"https://splits.sandbox.hyperpay.com","http://splits.sandbox.hyperpay.com"],
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			credentials: true
		},

		https: Config.get('/server/protocol'),
		host: Config.get('/server/host'),

		path: `/api/v${Config.get('/version')}`,

		routes: Routes,
		assets: {
			// Root folder of assets
			folder: "./src/app/common/controllers/__uploads",
			//folder: "./src/app/admin/controllers/__uploads",
			// Further options to `server-static` module
			options: {}
		}
	},


	methods: {

		authorize(ctx, route, req) {
			var authValue = req.headers["authorization"];
			if (authValue && authValue.startsWith("Bearer")) {
				var token = authValue.slice(6);
				var url = ctx.params.req.originalUrl;
				return ctx.call("auth.verifyToken", { token , url})
					.then( (decoded) => {
						ctx.meta.user = decoded;
						ctx.meta.user.token = token;
						if (decoded.access == 0)
					 	{
						 	return this.requestError(CodeTypes.AUTH_ACCESS_DENIED);
						}
					})
					.catch( (err) => {
						console.log('err' , err);
						if (err instanceof MoleculerError)
							return Promise.reject(err);

						return this.requestError(CodeTypes.AUTH_INVALID_TOKEN);
					});

			} else {
				return this.requestError(CodeTypes.AUTH_NO_TOKEN);
			}
		}

	}
};
