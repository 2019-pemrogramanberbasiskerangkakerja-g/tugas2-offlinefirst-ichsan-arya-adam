const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//create redis client
let client = redis.createClient();

client.on('connect', function(){
	console.log('connecting to redis...');
})

// port
const port = 3000;

//init app
const app = express();

//View engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methode Override
app.use(methodOverride('_methode'));

//login page
app.get('/', function(req, res, next){
  res.render('login');
});

//login proses
app.post('/login/user', function(req, res, next){
	let username = req.body.username;
	let password = req.body.password;

	client.hgetall(username, function(err, obj){
		if(!obj){
			res.render('login',{
				error: 'username and password does not match'
			});
		} else {
			obj.username = username;
			obj.password = password;
			if(!obj.username || !obj.password){
				res.render('login',{
					error: 'username and password does not match'
				});
			} else {
				res.render('details',{
					user:obj
				});
			}
			
			// console.log(obj);
		}

	});
});

// register page
app.get('/register', function(req, res, next){
  res.render('register');
});

// Process Add User Page
app.post('/register/add', function(req, res, next){
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let username = req.body.username;
  let password = req.body.password;

  client.hmset(username, [
    'first_name', first_name,
    'last_name', last_name,
    'username', username,
    'password', password
  ], function(err, reply){
    if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  });
});



app.listen(port, function(){
  console.log('Server started on port '+port);
});