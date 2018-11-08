'use strict';
const rally = require('rally');
const async = require('async');
const sqlite3 = require('sqlite3').verbose();

// var queryUtils = rally.util.query;
const WORKSPACE = '/workspace/6582349404';
const PROJECTAPAC = '/project/193018525092';
const PROJECTEU = '/project/193019226808';


let restAPI = rally({
	apiKey: '_b0ZewDOZThOpwqO4hbOi278k1JpeAE0tueYqgmzxIeY'
});

let db = new sqlite3.Database('./myRally.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

let gUSList = [];
let gSList = [];
let gUList = [];
let usList = {};
let init = (sList, uList) => {
	db.serialize(() => {
		let sql = 'select * from OWNER';
		db.all(sql, [], (err, rows) => {
			if (err) {
				throw err;
			}
			uList = rows;
		});
		sql = 'select * from STATUS';
		db.all(sql, [], (err, rows) => {
			if (err) {
				throw err;
			}
			for(let r of rows){
				sList.push(r);
			}
		});
	});
};

let getUSStatus = (us) => {
	for (var t of us.tasks) {
		if (t.name.toLowerCase() == 'functional test' || t.name.toLowerCase() == 'functional testing' || t.name.toLowerCase() == 'function test') {
			us.towner = t.owner;
		}
	}
	us.towner = (us.towner === undefined) ? '' : us.towner;
	for (var s of gSList) {
		if (s.DESP == us.status && s.status[0] == 'U') {
			us.status = s.status;
			return;
		}
	}
	for (t of us.tasks) {
		if (t.status != 'Completed' && (t.name == 'Analyze the US' || t.name == 'Coding & Unit Testing' || t.name == 'Analysis' || t.name == 'Coding and unit testing')) {
			us.status = 'U3';
			return;
		}
	}
	for (t of us.tasks) {
		if ((t.name.toLowerCase() == 'functional test' || t.name.toLowerCase() == 'functional testing' || t.name.toLowerCase() == 'function test') && t.status != 'Completed') {
			us.status = 'U5';
		}
		for (t of us.tasks) {
			if (t.status != 'Completed' && t.name == 'KT to tester for code changes') {
				us.status = 'U4';
			}
			if (us.status[0] != 'U') {
				us.status = 'U6';
			}

		}
	}
};

let updateTask = (us) => {
	us.tasks.forEach((t) => {
		for (var s in gSList) {
			if (t.status == s[1]) {
				t.status = s[0];
			}
		}
	});
};

let updateDB = (inUSList) => {
	let sqlUS = 'REPLACE INTO UserStory (usid,desp,crm,utype,owner,status,itert,towner) VALUES ';
	db.serialize(() => {
		inUSList.forEach((u) => {
			db.run(sqlUS + `('${u.usID}','${u.name}','${u.crm}','${u.utype}','${u.owner}','${u.status}','${u.iter}','${u.towner}')`, (err) => {
				if (err) {
					console.log(err);
				}
			});
		});
	});
	inUSList.forEach((us) => {
		let sqlTask = 'REPLACE INTO TASK(taskid,desp,usid,owner,status) VALUES ';
		db.serialize(() => {
			us.tasks.forEach((t) => {
				db.run(sqlTask + `('${t.taskID}','${t.name}','${t.usID}','${t.owner}','${t.status}')`, (err) => {
					if (err) {
						console.log(err);
					}
				});
			});
		});

	});
};

let stepsAfterRally = (inUSList) => {
	for (var us of inUSList) {
		// console.log(us);
		getUSStatus(us);
		updateTask(us);
	}
	updateDB(inUSList);
};
debugger;
init(gSList, gUList);

restAPI.query({
	type: 'hierarchicalrequirement',
	start: 310,
	limit: 30,
	scope: {
		workspace: WORKSPACE,
		project: PROJECTEU,
	},
	fetch: ['FormattedID', 'Name', 'CRM', 'Owner',
		'ScheduleState', 'Iteration', 'Tasks', 'Tags', 'SIEBEL'
	],
	// query: queryUtils.where('ScheduleState', '!=', 'Accepted') //optional filter
}, (error, result) => {
	if (error) {
		console.log(error);
	}
	// console.log(result);
	result.Results.forEach((element) => {
		let us = {};
		let res = element;
		us.ref = res._ref;
		us.usID = res.FormattedID;
		us.name = res.Name;
		us.crm = (res.c_CRM === undefined) ? '0' : res.c_CRM;
		us.owner = res.Owner._refObjectName;
		us.status = res.ScheduleState;
		us.iter = res.Iteration.Name;
		if (res.Tags.Count > 0) {
			us.utype = res.Tags._tagsNameArray[0].Name;
		}else {
			us.utype = '';
		}
		us.tasks = [];
		usList[us.usID] = us;
		console.log(res.Tags);
	});
	async.mapValues(usList, (us, key, callback) => {
		restAPI.query({
			type: 'task',
			ref: us.ref + '/Tasks',
			start: 1,
			limit: 99,
			scope: {
				workspace: WORKSPACE,
				project: PROJECTEU,
			},
			fetch: ['FormattedID', 'Name', 'Owner', 'State', 'Parent'],
		}, callback);
	}, (error, result) => {
		let item = null;
		for (let key in result) {
			item = result[key];
			for (let r of item.Results) {
				let task = {};
				task.ref = r._ref;
				task.taskID = r.FormattedID;
				task.name = r.Name;
				task.owner = r.Owner._refObjectName;
				task.status = r.State;
				task.usID = key;
				usList[key].tasks.push(task);
				// console.log(r.Owner._refObjectName+'/'+r.Owner._ref);
			}
			// usList[key].tasks = new Array(usList[key].tasks);
			gUSList.push(usList[key]);
		}
		// usList = new Array(usList);
		stepsAfterRally(gUSList);
	});
});