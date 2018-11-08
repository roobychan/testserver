'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const userStory = require('./userstory');
const textUtil = require('./textUtil');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/userstory/create', (req, res) => {
	let uStory = JSON.parse(Object.keys(req.body)[0]);
	let usID = null;
	userStory.createUS(uStory, (result) => {
		usID = result;
		res.json({
			usID: usID
		});
	});
});

app.post('/text/create', (req, res) => {
	let usID = JSON.parse(Object.keys(req.body)[0]).usID;
	textUtil.getUSText(usID, (result) => {
		res.json({
			ctext: result
		});
	});
});

app.listen(port, () => {
	console.log('server on 3000');
});