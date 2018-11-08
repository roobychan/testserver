'use strict';

const rally = require('rally');
const async = require('async');
const sqlite3 = require('sqlite3');
const WORKSPACE = '/workspace/6582349404';
const PROJECTAPAC = '/project/193018525092';
const PROJECTEU = '/project/193019226808';

let taskTemplateOPS = require('./taskOPS.json');
let taskTemplateDEV = require('./taskDEV.json');

let restAPI = rally({
	apiKey: '_b0ZewDOZThOpwqO4hbOi278k1JpeAE0tueYqgmzxIeY'
});

let db = new sqlite3.Database('./myRally.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

let createUS = (us, myCallback) => {
	let project = null;
	let resultID = null;
	if (us.project == 'EUAM') {
		project = PROJECTEU;
	} else {
		project = PROJECTAPAC;
	}
	restAPI.create({
		type: 'hierarchicalrequirement',
		scope: {
			workspace: WORKSPACE,
			project: project
		},
		data: {
			Name: us.name,
			Owner: {
				_ref: us.owner.ref
			},
			ScheduleState: 'Backlog',
			DisplayColor: us.displayColor.color,
			c_Siebel: us.siebel,
			c_CRM: us.crm,
			Iteration: {
				_ref: us.iteration.ref
			}
		}
	}, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log(result.Object.FormattedID);
			resultID = result.Object.FormattedID;
			console.log('adding tags');
			async.series([(callback) => {
				restAPI.add({
					ref: result.Object._ref,
					collection: 'Tags',
					data: [{
						_ref: us.tag.ref
					}],
				}, callback);
			}, (callback) => {
				let tasks = [];
				if (us.tag.name == 'DEV') {
					tasks = taskTemplateDEV.slice();
				} else {
					tasks = taskTemplateOPS.slice();
				}

				for (var t of tasks) {
					t.Owner = {
						_ref: us.owner.ref
					};
					if (t.Name == 'Functional test') {
						t.Owner = {
							_ref: us.towner.ref
						};
					}
				}
				if (us.utype == 'Both end') {
					tasks = tasks.concat([{
						Name: 'Analyze the US',
						Owner: {
							_ref: us.owner2.ref
						},
						Estimate: '4',
						ToDo: '4',
						Actuals: '4'
					}, {
						Name: 'Coding & Unit Testing',
						Owner: {
							_ref: us.owner2.ref
						},
						Estimate: '4',
						ToDo: '4',
						Actuals: '4'
					}]);
				}
				console.log('adding tasks');
				restAPI.add({
					ref: result.Object,
					collection: 'Tasks',
					data: tasks,
				}, callback);
			}], (error, result) => {
				if (error) {
					console.log(error);
				}
				// return resultID;
				process.nextTick(() => {
					myCallback(resultID);
				});
				updateDBUS(us, resultID);
			});
		}
	});

};

let updateDBUS = (us, resID) => {
	let sqlUS = 'REPLACE INTO UserStory (usid,desp,crm,utype,owner,owner2,app,status,itert,towner,proty,project) VALUES ';
	db.serialize(() => {
		db.run(sqlUS + `('${resID}','${us.name}','${us.crm}','${us.utype}','${us.owner.name}','${us.owner2.name}','${us.app}','Defined','${us.iteration.itert}','${us.towner.name}','${us.displayColor.ref}','${us.owner.project}')`, (err) => {
			if (err) {
				console.log(err);
			}
		});
	});
}
// let getIter = () => {
// 	restAPI.query({
// 		type: 'iteration',
// 		limit: Infinity,
// 		start: 1,
// 		scope: {
// 			workspace: WORKSPACE,
// 			project: PROJECTEU,
// 		},
// 		fetch: 'True',
// 	}, (error, result) => {
// 		if (error) {
// 			console.log(error);
// 		} else {
// 			let sqlIter = 'REPLACE INTO ITERT(itert, ref, project) VALUES ';
// 			db.serialize(() => {
// 				result.Results.forEach((it) => {
// 					db.run(sqlIter + `('${it._refObjectName}','${it._ref}','EUAM')`, (err) => {
// 						if (err) {
// 							console.log(err);
// 						}
// 					});
// 				});
// 			});
// 		}
// 	});
// };

exports.createUS = createUS;