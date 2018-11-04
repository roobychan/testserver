const http = require('http');
const crossroads = require('crossroads');

const hostname = 'localhost';
const port = 3000;

crossroads.addRoute('/{type}/{action}', (request,response, type, action) => {
	console.log(type,action);
	const { headers, method, url } = request;
	response.writeHead(200, {'Content-Type': 'application/json'});
    // response.end(request.body);
    let body = [];
	request.on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();
		console.log(body);
		// const responseBody = { headers, method, url, body };
    	response.write(JSON.stringify({name:'test', crm:'2342342'}));
    	response.end();
	});
});


const server = http.createServer((req, res) => {
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/html');
    // res.end('hello world\n');
    crossroads.parse(req.url,[req,res]);

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});