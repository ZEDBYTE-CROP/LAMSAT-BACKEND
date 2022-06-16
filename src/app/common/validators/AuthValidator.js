"use strict";

module.exports = {
    login: {
        username: "string",
        password: "string"
    },
    user_login: {
        email: "string",
        password: "string"
    },
    vendor_login: {
        email: "string",
        password: "string"
    },
    verifyPassword: {
        username: "string",
        password: "string"
    },
    changepassword: {
        id: {type: "number", min:1, required: true},
        oldpassword: {type: "string", min:6, required: true},
        newpassword: {type: "string", min:6, required: true},
        confirmpassword: {type: "string", min:6, required: true},
    },
    verify_change_Password: {
        id: {type: "number", min:1, required: true},
        password: {type: "string", required: true},
    },
    user_verifyPassword: {
        email: "string",
        password: "string"
    },
    verifyuser_change_Password: {
        id: "number",
        password: "string"
    },
    verifyToken: {
        token: "string"
    },
    countSessions: {},
    closeAllSessions: { },
    forgetpassword: {
        email: {type: "string", min:4, required: true},
    },
    user_resetPassword: {
        email: "string"
    },
    vendor_resetPassword: {
        email: "string"
    },
    admin_resetPassword: {
        email: "string"
    },
    verifyvendor_change_Password: {
        id: "number",
        password: "string"
    },
    logout: { }
}

/* const Joi = require('joi');

module.exports = {
    login: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
    verifyPassword: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
    verifyToken: Joi.object().keys({
        token: Joi.string().required()
    }),
    countSessions: {},
    closeAllSessions: { },
    logout: { },
} */
