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
const url = Config.get('/url')

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

module.exports = {

    // USER CREATION WITH FILE UPLOAD
    create1: async function(ctx) {
		const randy = this.randomName(ctx.meta);
		const fileName = ctx.meta.filename;
		const ext = path.extname(fileName);
		if(ext !== 'png' || ext !== 'jpg' || ext !== 'jpeg') {
			return this.requestError(`File format ${ext} is not allowed.`);
		}
        return new this.Promise((resolve, reject) => {
            //reject(new Error("Disk out of space"));

            var type = ctx.meta.$multipart.type != null ? ctx.meta.$multipart.type : "";
            var randy2 = path.join(randy, type);
            const filePath = path.join(uploadDir, randy2);

            console.log('------------------------------------');
            console.log('filepath ;' , uploadDir+ '******' + randy2);
            console.log('------------------------------------');
            this.logger.info("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
            this.logger.info(ctx.meta);
            this.logger.info("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

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

           // const img_scenario = ctx.meta.$multipart.scenario != null ? ctx.meta.$multipart.scenario+"/" : "";
            const img_url = `__uploads/`
            res['image_url'] = url + img_scenario + randy2;

            const img_scenario = 'profile/';
            const img_url = `__uploads/${img_scenario}`
            res['image_url'] = url + img_url + randy2;
console.log('------------------------------------');
console.log('url + img_url + randy2;' , url + img_url + randy2);
console.log('------------------------------------');
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


    }
}
