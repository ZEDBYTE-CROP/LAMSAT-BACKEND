"use strict";

const { MoleculerError } 	= require("moleculer").Errors;
const pipe = require("pipe");
const CodeTypes = require("../../../fixtures/error.codes");
const Constants = require("../../../../plugin/constants");
const Database = require("../../../adapters/Database");
const activity = require("../../../helpers/activitylog");
const fs = require("fs");
const path = require("path");
const { finished } = require("stream");
const Op = require('sequelize').Op;


//Models
const ActivityLog = new Database("Mactivitylog");

//DEFAULT STATUS VALUES SEE IN CONSTANTS JS FILE

const {
	DELETE,
	ACTIVE,
	INACTIVE
} = Constants;

/**
 *
 * @annotation activitylog
 * @permission remove
 * @whitelist getall
 */
module.exports = {
	getall: async function(ctx) {
		var metadata = {};
		var finalObj = {};
		var page = parseInt(ctx.params.page);
		var limit = parseInt(ctx.params.limit);
		page = (page-1) * limit;
		let findlog = {};
		if(ctx.params.username) findlog['username'] = ctx.params.username;
		if(ctx.params.log) findlog['log'] = ctx.params.log;
		findlog['status'] = ctx.params.status ? ctx.params.status : { [Op.ne]: DELETE };
        return ActivityLog.find(ctx, { query: findlog, limit:limit, offset:page})
        .then( (res) => {
			return activity.getLogCount(ctx).then((resy) => {
				metadata.page = ctx.params.page;
				metadata.per_page = limit;
				metadata.total_count = resy;
				finalObj.metadata = metadata;
				finalObj.data = res.data;
				return this.requestSuccess("Activity list", finalObj);
			});
        })
        .catch( (err) => {
            if (err.name === 'Nothing Found')
                return this.requestError(CodeTypes.NOTHING_FOUND);
            else
                return this.requestError(err);
        });
	},
	remove: async function(ctx) {
		activity.getUser(ctx,ctx.meta.user.id,ctx.meta.user.usertypeid).then((res) =>{
			ctx.meta.username = res.data.email;
		});
        return  ActivityLog.findOne(ctx, { query: {
            id: ctx.params.id
        }
        })
        .then ((res) =>{
            ActivityLog.updateBy(ctx, res.data.id, {
                status: 2
                }, { query: {
                    id: ctx.params.id
                }
            });
			ctx.meta.log = "Activity log deleted.";
			activity.setLog(ctx);
            return this.requestSuccess("Activity log has been successfully Deleted", ctx.params.id);
    	})
	}
}
