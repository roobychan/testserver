'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/userstory/create', (req, res) => {
	res.json(req.body);
});

app.listen(port, () => {
	console.log('server on 3000');
});
