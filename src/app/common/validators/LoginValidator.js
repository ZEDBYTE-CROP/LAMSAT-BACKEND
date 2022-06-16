"use strict";

module.exports = {
    create: {
        username: "string",
        password: "string"
    },
    getAll: {},
    get: {
        username: "string"
    },
    count: {},
    changeInfo: {
        age: "number"
    },
    
    user_changePassword: {
        id: {type: "number", min:1, required: true},
        oldpassword: {type: "string", min:6, required: true},
        newpassword: {type: "string", min:6, required: true},
        confirmpassword: {type: "string", min:6, required: true},
    },
    vendor_changePassword: {
        id: {type: "number", min:1, required: true},
        oldpassword: {type: "string", min:6, required: true},
        newpassword: {type: "string", min:6, required: true},
        confirmpassword: {type: "string", min:6, required: true},
    },
    changeRole: {
        username: "string",
        role: "string"
    },
    remove: {
        password: "string"
    },
    banish: {
        username: "string"
    },
    removeAll: {
        password: "string"
    },
	createAdminIfNotExists: { },
	insertModles: {},
	getAllModule: {}
}


/* const Joi = require('joi');

module.exports = {
    create: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
    getAll: {},
    get: Joi.object().keys({
        username: Joi.string().required(),
    }),
    count: {},
    changeInfo: Joi.object().keys({
        age: Joi.string().required(),
    }),
    changePassword: Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
    }),
    changeRole: Joi.object().keys({
        username: Joi.string().required(),
        role: Joi.string().required(),
    }),
    remove: Joi.object().keys({
        password: Joi.string().required(),
    }),
    banish: Joi.object().keys({
        username: Joi.string().required(),
    }),
    removeAll: Joi.object().keys({
        password: Joi.string().required(),
    }),
    createAdminIfNotExists: { },
} */
