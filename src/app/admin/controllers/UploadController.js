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
const uuid = require("uuid");
const mkdir = require("mkdirp").sync;
const mime = require("mime-types");
const { info } = require("console");
const Config = require("../../../../config");
const url = Config.get('/url');

const uploadDir = path.join(__dirname, "__uploads");
mkdir(uploadDir);
const img_path = __dirname;

//Models

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;
/**
 *
 * @annotation upload
 * @permission
 * @whitelist  create
 */
module.exports = {

    // USER CREATION WITH FILE UPLOAD
    create: async function(ctx) {
		const randy = this.randomName(ctx.meta);
		const fileName = ctx.meta.filename;
		const ext = path.extname(fileName);
		var type = ctx.meta.$multipart.type != null ? ctx.meta.$multipart.type : "";
		var randy2 = path.join(randy, type);
		if(ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
			return new this.Promise((resolve, reject) => {
				//reject(new Error("Disk out of space"));


				const filePath = path.join(uploadDir, randy2);

				//this.logger.info(ctx.meta);

				const f = fs.createWriteStream(filePath);

				f.on("close", () => {
					// File written successfully
					this.logger.info(`Up11111111111111loaded file stored in '${filePath}'`);1
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
				const img_scenario = '';
				const img_url = `__uploads/${img_scenario}`
				res['image_url'] = url + img_url + randy2;


				res['image_url'] = url + randy2;
				res['temp_file'] = randy2;
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
	 // partner file upload
	 upload: async function(ctx) {
		const randy = this.randomName(ctx.meta);
		const fileName = ctx.meta.filename;
		const ext = path.extname(fileName);
		var type = ctx.meta.$multipart.type != null ? ctx.meta.$multipart.type : "";
		var randy2 = path.join(randy, type);
		if(ext === '.pdf' ) {
			return new this.Promise((resolve, reject) => {
				//reject(new Error("Disk out of space"));


				const filePath = path.join(uploadDir, randy2);

				//this.logger.info(ctx.meta);

				const f = fs.createWriteStream(filePath);

				f.on("close", () => {
					// File written successfully
					this.logger.info(`Up11111111111111loaded file stored in '${filePath}'`);1
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
				const file_scenario = 'pdf';
				const file_url = `__uploads/${file_scenario}`
				res['file_url'] = url + file_url + randy2;


				res['file_url'] = url + randy2;
				res['temp_file'] = randy2;
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

    }
}
