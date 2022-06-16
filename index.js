"use strict";

const { ServiceBroker } = require("moleculer");
var serveStatic = require('serve-static');
const path = require("path");
const DatabaseServices = require("./src/fixtures/database_template/Database.ServiceTemplate");
const JoiValidator = require("./plugin/joi.validator");
const broker = new ServiceBroker({
	logger: console,
	use: [
		serveStatic(path.join(__dirname, "src/app/common/controllers/__uploads")),
		serveStatic(path.join(__dirname, "src/app/admin/controllers/__uploads")),
		serveStatic(path.join(__dirname, "src/app/user/controllers/__uploads"))
    ],
	// validation: false,
    // validator: new JoiValidator()
});
global.appRoot = path.resolve(__dirname);



broker.loadServices("./src/services");

DatabaseServices.forEach( (service) => {
	broker.createService(service);
});



broker.start()
	.then( () => {
		broker.repl();
		broker.call("login.createAdminIfNotExists");
		broker.call("login.splitlogin");
		console.log("Server started");
		broker.call("sms.create");
		broker.call("smtp.create")
	});

