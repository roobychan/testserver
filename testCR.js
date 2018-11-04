'use strict';
const rally = require('rally');
const async = require('async');
// const sqlite3 = require('sqlite3').verbose();
// const refUtils = rally.util.ref;

// var queryUtils = rally.util.query;
const WORKSPACE = '/workspace/6582349404';
const PROJECTAPAC = '/project/193018525092';
const PROJECTEU = '/project/193019226808';

let uRooby = {
	_ref: 'https://rally1.rallydev.com/slm/webservice/v2.0/user/12332286377'
};

let restAPI = rally({
	apiKey: '_b0ZewDOZThOpwqO4hbOi278k1JpeAE0tueYqgmzxIeY'
});

let db = new sqlite3.Database('./myRally.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

let createUS = () => {
	restAPI.create({
		type: 'hierarchicalrequirement',
		scope: {
			workspace: WORKSPACE,
			project: PROJECTEU,
		},
		data: {
			Name: 'Test Rooby',
			Owner: uRooby,
			ScheduleState: 'Backlog',
			DisplayColor: '#fce205',
			c_Siebel: '2599999999',
			c_CRM: '2599999999',
		}
	}, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log(result.Object.FormattedID);
			async.series([(callback) => {
				restAPI.add({
					ref: result.Object._ref,
					collection: 'Tags',
					data: [{
						_ref: '/tag/262701508908'
					}],
				}, callback);
			}, (callback) => {
				restAPI.add({
					ref: result.Object,
					collection: 'Tasks',
					data: [{
						Name: 'Analysis',
						Owner: uRooby,
						Estimate: '4',
						ToDo: '4',
						Actuals: '4'
					}, {
						Name: 'Test',
						Owner: uRooby,
						Estimate: '4',
						ToDo: '4',
						Actuals: '4'
					}, ],
				}, callback);
			}], (error, result) => {
				if (error) {
					console.log(error);
				}
			});
		}
	});
};

let getIter = () => {
	restAPI.query({
		type: 'iteration',
		limit: Infinity,
		start: 1,
		scope: {
			workspace: WORKSPACE,
			project: PROJECTAPAC,
		},
		fetch: 'True',
	}, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			let sqlIter = 'REPLACE INTO ITERT(ITERT,REF) VALUES ';
			db.serialize(() => {
				result.Results.forEach((it) => {
					db.run(sqlIter + `('${it._refObjectName}','${it._ref}')`, (err) => {
						if (err) {
							console.log(err);
						}
					});
				});
			});
		}
	});
};

createUS();