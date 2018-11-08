'use strict';

const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./myRally.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

let init = (iList, usList, usID) => {
	db.serialize(() => {
		let sql = `select from UserStory where usid = '${usID}'`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				throw err;
			}
			usList = rows;
		});
		if (usList[0]) {
			sql = `select * from ITERT where itert = '${usList[0].itert}' AND project = '${usList[0].project}'`;
			db.all(sql, [], (err, rows) => {
				if (err) {
					throw err;
				}
				for (let r of rows) {
					iList.push(r);
				}
			});
		}

	});
};

let getUSText = (usID, callback) => {
	let itList = [];
	let usList = [];
	let result = '';
	db.serialize(() => {
		let sql = `select * from UserStory where usid = '${usID}'`;
		db.all(sql, [], (err, rows) => {
			if (err) {
				throw err;
			}
			usList = rows;
			if (usList[0]) {
				sql = `select * from ITERT where itert = '${usList[0].itert}' AND project = '${usList[0].project}'`;
				db.all(sql, [], (err, rows) => {
					if (err) {
						throw err;
					}
					for (let r of rows) {
						itList.push(r);
					}
					let u = usList[0];
					let i = itList[0];
					result = `${u.crm}|${i.pd1}|${i.pqx}|${i.ppx}|${u.owner}|${u.utype}|${u.app}|${u.usid}|${u.desp}|${u.itert}`;
					process.nextTick(() => {
						callback(result);
					})
				});
			}
		});


	});
};

exports.getUSText = getUSText;