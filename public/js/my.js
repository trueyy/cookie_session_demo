function cleanup() {
	sessionStorage.removeItem('token')
	localStorage.removeItem('token')
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function login(login_type) {
	var username = $("#username")[0].value;
	var password = $("#password")[0].value;
	var request_data = JSON.stringify({
		username,
		password
	})

	// cleanup everything before we do login
	cleanup()

	console.log(request_data)
	$.ajaxSetup({
		contentType: "application/json; charset=utf-8"
	});

	if (login_type == 'cookie') {
		$.ajax({
			type: "post",
			url: "/api/login_cookie",
			data: request_data,
			dataType: "json",
			success: function(data) {
				alert('login successful');
			}
		});
	}

	if (login_type == 'localSession') {
		$.ajax({
			type: "post",
			url: "/api/login_json",
			data: request_data,
			dataType: "json",
			success: function(data) {
				var token = data.token
				console.log('write to local session = token: ' + token);
				if (token) {
					sessionStorage.setItem('token', token);
					alert('login successful');
				}
			}
		});
	}

	if (login_type == 'localStorage') {
		$.ajax({
			type: "post",
			url: "/api/login_json",
			data: request_data,
			dataType: "json",
			success: function(data) {
				var token = data.token
				console.log('write to local storage = token: ' + token);
				if (token) {
					localStorage.setItem('token', token);
					alert('login successful');
				}
			}
		});
	}
}

function get_token_query_string() {
	// try getting token from session storage then local storage
	var token = sessionStorage.getItem('token', token);
	if (!token)
		token = localStorage.getItem('token', token);

	var qs = ''
	if (token) {
		qs = '?token=' + token
	}

	return qs
}

function logoff() {
	cleanup()
	$.ajax({
		type: "post",
		url: '/api/logoff' + get_token_query_string(),
		success: function(data) {
			alert('logged off')
		}
	});
}

function get_top_secret(container_node) {
	container_node.innerHTML = ''
	$.ajax({
		type: "get",
		url: '/api/secret' + get_token_query_string(),
		success: function(data) {
			container_node.innerHTML = data.result
		}
	});

}