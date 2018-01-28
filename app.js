const express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()
app.use(cookieParser());
app.use(express.static('public'))

const lodash = require('lodash')
hardcoded_user_password = [{
	username: 'smilingwq',
	password: 'test1'
}, {
	username: 'tengyouyou',
	password: 'test12'
}, ]

sessions = [{
	username: 'sample',
	token: 'sample_token',
	login_time: 12345
}]

var add_session = function(username) {
	var sessionIndex = lodash.findIndex(sessions, { username })
	if (sessionIndex >= 0) {
		sessions.splice(sessionIndex, 1)
	}

	var crypto = require("crypto");
	var token = crypto.randomBytes(20).toString('hex');
	var login_time = Date.now() / 1000;
	new_session = {
		username,
		token,
		login_time
	}
	sessions.push(new_session)
	return new_session
}

var is_user_session_alive = function(token) {
	const timeout = 600
	var is_alive = false
	var sessionIndex = lodash.findIndex(sessions, { token })
	if (sessionIndex >= 0) {
		var login_time = sessions[sessionIndex].login_time
		var current_time = Date.now() / 1000
		var diff = current_time - login_time
		is_alive = diff >= 0 && diff < timeout 
	} 
	return is_alive
}

var get_token_from_request = function(req) {
	// first try to get token from cookie
	var token = req.cookies['token'];
	if (token) {
		console.log('token from cookie: ' + token)
		return token
	}

	// then try from query string
	const querystring = require('querystring')
	const url = require('url');
	var qs = querystring.parse(url.parse(req.url).query)
	token = qs.token
	if (token) {
		console.log('token from querystring: ' + token)
		return token
	}
}

var write_login_result_page_cookie = function(res, success, token) {
	if (success) {
		res.writeHead(200, {
			'Set-Cookie': 'token=' + token + ';path=/',
			'Content-Type': 'text/plain'
		});
		res.end('login successful')
	} else {
		res.writeHead(403)
		res.end('bad username/password')
	}

}

var write_login_result_page_json = function(res, success, token) {
	res.setHeader('Content-Type', 'json')
	if (success) {
		res.writeHead(200)
		res.end(JSON.stringify({
			token
		}))
	} else {
		res.writeHead(403)
		res.end(JSON.stringify({
			error: 'bad username/password'
		}))
	}
}

var login_core = function(req) {
	console.log("login request recieved")
	var data = req.body;
	var username = data.username
	var password = data.password
	var userIndex = lodash.findIndex(hardcoded_user_password, {
		username,
		password
	})

	if (userIndex >= 0) {
		var session = add_session(username)
		return session
	}
	return null
}

app.get('/', function(req, res) {
	res.write("<p>Hello!</p>")
	res.write("<br/>")
	res.write("<a href='login.html'>Click to login</a><br/>")
	res.write("<a href='secret.html'>Click to get the secret</a><br/>")
	res.end()
})

app.post('/api/login_cookie', jsonParser, function(req, res) {
	var session = login_core(req)
	if (session) {
		write_login_result_page_cookie(res, true, session.token);
		console.log('login successful, token is: ' + session.token)
	} else {
		write_login_result_page_cookie(res, false);
		console.log('login failed')
	}
})

app.post('/api/login_json', jsonParser, function(req, res) {
	var session = login_core(req)
	if (session) {
		write_login_result_page_json(res, true, session.token);
		console.log('login successful, token is: ' + session.token)
	} else {
		write_login_result_page_json(res, false);
		console.log('login failed')
	}
})

app.post('/api/logoff', function(req, res) {
	console.log("logoff request recieved")
	token = get_token_from_request(req)
	if (token) {
		var sessionIndex = lodash.findIndex(sessions, { token })
		if (sessionIndex >= 0) {
			sessions.splice(sessionIndex, 1)
		}
	}
	res.end('logged off')
})

app.get('/api/secret', function(req, res) {

	token = get_token_from_request(req)

	res.setHeader('Content-Type', 'json')
	if (token && is_user_session_alive(token)) {
		res.writeHead(200)
		res.end(JSON.stringify({
			result: 'secret everyone knows: you are so beautiful!'
		}))
	} else {
		res.writeHead(403)
		res.end(JSON.stringify({
			error: 'user not logged in'
		}))
	}
})


app.listen(3000, () => console.log('Example app listening on port 3000!'))