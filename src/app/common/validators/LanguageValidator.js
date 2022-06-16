"use strict";

 

module.exports = {
    
     create: {
        languagename: {type: "string",required: true},
        languagecode: {type: "string",required: true},
        status: {type: "number",required: true}

    },
    update: { 
        languagename: {type: "string",required: true},
        languagecode: {type: "string", required: true},
        status: {type: "number",required: true}
        },
    getall: { 
       // user_id: {type: "string", min: 1,required: true},

    },
    remove: {
        id: "string"
    },
    getLanguage: {
        //status: "number"
    },
    /*update: {
        id: "number",
        rolename: "string",
        status: 'number'
    },
    status: {
        id: "number",
        status: 'number'
    },*/
}
