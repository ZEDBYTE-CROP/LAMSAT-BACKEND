const Cron = require("moleculer-cron");
const db = require('../adapters/db');
const moment = require('moment'); 
// Create my conjob service
module.exports = {
    name: "cron-job",

   mixins: [Cron],

    crons: [
        {
            name: "JobHelloWorld",
            cronTime: '* */10 * * *',
            onTick: function() {

                console.log('JobHelloWorld ticked');

                this.getLocalService("cron-job")
                    .actions.say()
                    .then((data) => {
                        console.log("Oh!", data);
                    });
            },
            runOnInit: function() {
                console.log("JobHelloWorld is created");
            },
            manualStart: true,
            timeZone: 'America/Nipigon'
        },
        {
            name: "JobWhoStartAnother",
            cronTime: '* * * * *',
            onTick: function() {

                console.log('JobWhoStartAnother ticked');
                var curdate = moment(new Date()).format("YYYY-MM-DD")
                const QUERY =  `UPDATE tbooking set booking_status = 3 where id IN(
                                select id from tbooking where booking_status = 1 and service_date <> 'Invalid date' and
                                (convert(date, service_date, 105) < '${curdate}'))`;
                    db.sequelize.query(QUERY)
                    .then( (res) => {
                        console.log("updated")
                    })

                var job = this.getJob("JobHelloWorld");

                if (!job.lastDate()) {
                    job.start();
                } else {
                    console.log("JobHelloWorld is already started!");
                }

            },
            runOnInit: function() {
                console.log("JobWhoStartAnother is created");
            },
            timeZone: 'America/Nipigon'
        }
    ],

    actions: {

        say: {
            handler(ctx) {
                return "HelloWorld!";
            }
        }

    }
}
 