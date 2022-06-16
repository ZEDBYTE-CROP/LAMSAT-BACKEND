var chalk = require('chalk');
const Confidence = require('confidence');
var ip = require('ip');
let fs	 = require('fs');
var Path = require('path');
const moment = require('moment');

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

const criteria = {
    env: process.env.NODE_ENV
};

const app_name = 'lamsat';

const config = {
    $meta: 'This file configures the plot device.',
    projectName: app_name,
    version: 1,
    url: "https://api.lamsat.app/",
    server: {
        host: ip.address(),
        port: {
            api: 9011,
            socket: 8000
        },
        protocol: 'http',
        uri: `https://${ip.address()}:9011`
    },
	//cors: true,
	url: {
		$filter: 'env',
		$default: {
			url: "https://api.lamsat.app/",
		},
		production: {
			url: "https://api.lamsat.app/",
		},
		development: {
			url: "http://api.lamsat.app/",
		}
	},
    cors: {
        $filter: 'env',
        production: {
            origin: ["http://localhost:9012","http://54.226.144.228:9012","http://3.238.136.245:9012/"],
            methods: ["GET", /*"PATCH", "OPTIONS",*/ "POST", "PUT", "DELETE"],
            allowedHeaders: [],
            exposedHeaders: [],
            credentials: false,
            maxAge: 3600
        },
        $default: {
            origin:  ["http://localhost:9012","http://54.226.144.228:9012","http://3.238.136.245:9012/"],
            methods: ["GET", /*"PATCH", "OPTIONS",*/ "POST", "PUT", "DELETE"],
            allowedHeaders: [],
            exposedHeaders: [],
            credentials: false,
            maxAge: 3600
        }
    },
    path: {
        log_path: Path.join(__dirname, '../logs/log.js'),
        assetsPath: Path.join(__dirname, '../assets/'),
        user_image_path: Path.join(__dirname, '../assets/user/'),
    },
    settings: {
        log: false,
        file_log: false
    },
    defaultAdminCredential: {
        $filter: 'env',
        production: {
            username: 'admin@lamsat.com.sa',
            password: 'adminlamsat'
        },
        $default: {
            username: 'admin@lamsat.com.sa',
            password: 'adminlamsat'
        }
    },
    sms: {
        $filter: 'env',
        production: {
            "username": "lamsat",
            "password": 'lamsat123',
			"from": "Lamsat Hotels",
			"user": "20099981",
			"pwd": "ngxdbb",
			"sid": "LAMSAT",
			"countrycode": '+966',
			"url": "http://mshastra.com/sendurlcomma.aspx",
		},
		development: {
            "username": "lamsat",
            "password": 'lamsat123',
			"from": "Lamsat Hotels",
			"user": "20099981",
			"pwd": "ngxdbb",
			"sid": "LAMSAT",
			"countrycode": '+966',
			"url": "http://mshastra.com/sendurlcomma.aspx",
        },
        $default: {
            "username": "lamsat",
            "password": 'lamsat123',
			"from": "Lamsat Hotels",
			"user": "20099981",
			"pwd": "ngxdbb",
			"sid": "LAMSAT",
			"countrycode": '+966',
			"url": "http://mshastra.com/sendurlcomma.aspx",
        }
	},
	ssl: {
        $filter: 'env',
        production: {
            https: {
				key: fs.readFileSync(Path.join(__dirname, 'cert/key.pem'),'utf-8'),
				cert: fs.readFileSync(Path.join(__dirname, 'cert/cert.pem'),'utf-8'),
				ca: fs.readFileSync(Path.join(__dirname, 'cert/keychain.pem'),'utf-8'),
				rejectUnauthorized: false
			},
		},
		development: {
			https: {}
		},
        $default: {
            "host": "Localhost",
            "encryption": "YUdmk7894sdf",
            "port": "5575",
            "username": "SMTP_boss",
            "password": "boss_8558"
        }
    },
    smtp: {
        $filter: 'env',
        production: {
            "host": "Localhost",
            "encryption": "YUdmk7894sdf",
            "port": "5575",
            "username": "SMTP_boss",
            "password": "boss_8558"
        },
        $default: {
            "host": "Localhost",
            "encryption": "YUdmk7894sdf",
            "port": "5575",
            "username": "SMTP_boss",
            "password": "boss_8558"
        }
    },
    CHALK_ERROR: chalk.bold.red,
    CHALK_LOG: chalk.bold.blue,
    currencyCode: {
        $filter: 'env',
        production: 'INR',
        $default: 'INR'
    },
    COUNTRY_CODE: {
        $filter: 'env',
        production: '+91',
        $default: '+91'
    },
    timeZone: {
        $filter: 'env',
        production: 'Asia/Kolkata',
        $default: 'Asia/Kolkata'
    },
    mssqlEnvironment: {
        $filter: 'env',
        production: {
			"username": "dbzfmsappstech",
			//"password": "covidPositive19",
			"password": "Scope@#123",
            "database": "demo",
            "host": "13.94.34.229",
            "instancename": "",
			"dialect": "mssql",
		},
		dev: {
			"username": "dbzfmsappstech",
            "password": "Scope@#123",
            "database": "demo",
            "host": "13.94.34.229",
            "instancename": "",
			"dialect": "mssql",
			"port": "1433"
		},
		development: {
			"username": "dbzfmsappstech",
            "password": "Scope@#123",
            "database": "demo",
            "host": "13.94.34.229",
            "instancename": "",
			"dialect": "mssql",
			// "username": "sa",
            // "password": "tech",
            // "database": "Lamsat",
            // "host": "localhost",
            // "instancename": "MSQLEXPRESS",
            // "dialect": "mssql",
			// "port": "1433"
			// "username": "helpdeskuser",
            // "password": "$ifmjll1234$",
            // "database": "demo",
            // "host": "52.220.223.50",
            // "instancename": "",
            // "dialect": "mssql",
		},
        $default: {
           /* "username": "sa",
            "password": "tech",
            "database": "Lamsat",
            "host": "LAPTOP-71ECSG5V",
            "instancename": "MSQLEXPRESS",
            "dialect": "mssql",
            "port": "1433"*/
        }
    },
    //googleAPI: 'AIzaSyADWxNxOiNs0LRXkgRb2qlmz2BPGycoOJ4',
    googleAPI: 'AIzaSyD2fIwEEQ7r4n9OSVvOBMblCVCxfz23aro',
    mailer: {
        $filter: 'env',
        production: {
            "mail_id": "no-reply@lamsat.app",
            "password": 'Wac27788',
            "project_name": app_name,
        },
        $default: {
            "mail_id": "no-reply@lamsat.app",
            "password": 'Wac27788',
            "project_name": app_name,
        }
        // production: {
        //     "mail_id": "technoducedevelopers@gmail.com",
        //     "password": 'technoduce',
        //     "project_name": app_name,
        // },
        // $default: {
        //     "mail_id": "technoducedevelopers@gmail.com",
        //     "password": 'technoduce',
        //     "project_name": app_name,
        // }
	},
	PAYMENT: {
		$filter: 'env',
		production: {
			EID: {
				VISA: '8ac7a4c87b75ab37017b783bf5db0720',
				MADA: '8ac7a4c87b75ab37017b783c8b4d0724',
                APPLE: '8a8294174d0595bb014d05d82e5b01d2'
			},
			AUTHTOKEN: 'OGFjN2E0Yzg3Yjc1YWIzNzAxN2I3ODNhNjQxODA3MGJ8cUpHeTdaMmdneQ==',
			CURRENCY: 'SAR',
			PAMENT_TYPE: 'DB',
			SPLIT_PAY: {
				HOST:'https://splits.sandbox.hyperpay.com/api/v1/',
				EMAIL:'razak@scopetech.sa',
				PASSWORD:'Lamsat@2021',
				CID:'ed7250a0f82e022064ff821063bd6df9',
				NKEY:'5899911F84980700643C0398D5272A776F68A9300FCF828ADF6813BFF381F50F',
				BEN_ACC:{
					"period": moment().format("YYYY-MM-DD"),
					"configId":"ed7250a0f82e022064ff821063bd6df9",
					"transferOption":"7",
					"merchantTransactionId":2,
					"batchDescription": "Transfer fund to beneficiary",
					"beneficiary":[
						{
							"name": "Scope Technologies",
							"accountId": "20817127000808",
							"debitCurrency": "SAR",
							"transferAmount": "50",
							"transferCurrency": "SAR",
							"bankIdBIC":"NCBKSAJE",
							"payoutBeneficiaryAddress1": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress2": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress3": "Riyadh-Saudi Arabia"
						},
						{
							"name": "Scope Tech",
							"accountId": "62515915000708",
							"debitCurrency": "SAR",
							"transferAmount": "50",
							"transferCurrency": "SAR",
							"bankIdBIC":"NCBKSAJE",
							"payoutBeneficiaryAddress1": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress2": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress3": "Riyadh-Saudi Arabia"
						}
					]
				},
			},
			HYPER_PAY: {
				HOST: 'test.oppwa.com',
			}
		},
		$default: {
			EID: {
				VISA: '8ac7a4c87b75ab37017b783bf5db0720', // same for master and STC
				MADA: '8ac7a4c87b75ab37017b783c8b4d0724',  // only for mada
                APPLE: '8a8294174d0595bb014d05d82e5b01d2'
			},
			AUTHTOKEN: 'OGFjN2E0Yzg3Yjc1YWIzNzAxN2I3ODNhNjQxODA3MGJ8cUpHeTdaMmdneQ==',
			CURRENCY: 'SAR',
			PAMENT_TYPE: 'DB',
			SPLIT_PAY: {
				HOST:'https://splits.sandbox.hyperpay.com/api/v1/',
				EMAIL:'razak@scopetech.sa',
				PASSWORD:'Lamsat@2021',
				CID:'ed7250a0f82e022064ff821063bd6df9',
				NKEY:'5899911F84980700643C0398D5272A776F68A9300FCF828ADF6813BFF381F50F'
			}

		},
		development: {
			EID: {
				VISA: '8ac7a4c87b75ab37017b783bf5db0720',
				MADA: '8ac7a4c87b75ab37017b783c8b4d0724',
                APPLE: '8a8294174d0595bb014d05d82e5b01d2'
			},
			AUTHTOKEN: 'OGFjN2E0Yzg3Yjc1YWIzNzAxN2I3ODNhNjQxODA3MGJ8cUpHeTdaMmdneQ==',
			CURRENCY: 'SAR',
			PAMENT_TYPE: 'DB',
			SPLIT_PAY: {
				HOST:'https://splits.sandbox.hyperpay.com/api/v1/',
				EMAIL:'razak@scopetech.sa',
				PASSWORD:'Lamsat@2021',
				CID:'ed7250a0f82e022064ff821063bd6df9',
				NKEY:'5899911F84980700643C0398D5272A776F68A9300FCF828ADF6813BFF381F50F',
				BEN_ACC:{
					"period": moment().format("YYYY-MM-DD"),
					"configId":"ed7250a0f82e022064ff821063bd6df9",
					"transferOption":"7",
					"merchantTransactionId":2,
					"batchDescription": "Transfer fund to beneficiary",
					"beneficiary":[
						{
							"name": "Scope Technologies",
							"accountId": "20817127000808",
							"debitCurrency": "SAR",
							"transferAmount": "50",
							"transferCurrency": "SAR",
							"bankIdBIC":"NCBKSAJE",
							"payoutBeneficiaryAddress1": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress2": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress3": "Riyadh-Saudi Arabia"
						},
						{
							"name": "Scope Tech",
							"accountId": "62515915000708",
							"debitCurrency": "SAR",
							"transferAmount": "50",
							"transferCurrency": "SAR",
							"bankIdBIC":"NCBKSAJE",
							"payoutBeneficiaryAddress1": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress2": "Riyadh-Saudi Arabia",
							"payoutBeneficiaryAddress3": "Riyadh-Saudi Arabia"
						}
					]
				},
			},
			HYPER_PAY: {
				HOST: 'test.oppwa.com',
			}
		},
    },
    ONESIGNAL: {
		$filter: 'env',
		production: {
			"rest_auth": "MmE1OGE0OWQtOGUyNi00MTU1LTkzZDgtY2Y3MTVmMDIzY2Fm",
			"host": "onesignal.com",
			"push_path": "/api/v1/notifications",
			"app_id": "8a4836b3-ad5f-4c44-9204-14e80c138099"
		},
		development: {
			"rest_auth": "MmE1OGE0OWQtOGUyNi00MTU1LTkzZDgtY2Y3MTVmMDIzY2Fm",
			"host": "onesignal.com",
			"push_path": "/api/v1/notifications",
			"app_id": "8a4836b3-ad5f-4c44-9204-14e80c138099"
		},
		$default: {
			"rest_auth": "MmE1OGE0OWQtOGUyNi00MTU1LTkzZDgtY2Y3MTVmMDIzY2Fm",
			"host": "onesignal.com",
			"push_path": "/api/v1/notifications",
			"app_id": "8a4836b3-ad5f-4c44-9204-14e80c138099"
		}
	}
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
