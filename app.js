/* jshint esversion: 6*/

const express = require('express');
const credentials = require('./config/credentials.js');
const routes = require('./routes/router.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
var app = express();

app.set('port', process.env.PORT || 5000);

app.set('view engine', 'ejs');
app.set('views', (__dirname + '/views'));

//STATIC PATHS
app.use(express.static(__dirname + '/public'));

//BODY PARSER
app.use(bodyParser.json());

//MONGO
var opts = { keepAlive : 1 };
mongoose.connect(credentials.mongo.development.connectionString, opts);

//SESSION
app.use(require('express-session')({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true
}));

//AUTHORIZATION
var auth = require('./lib/configurePassport.js')(app, {
    baseURL : process.env.BASE_URL,
    provider: credentials.authorizedProviders,
    successRedirect : '/account',
    failureRedirect: '/login'
});
auth.init();
auth.registerRoutes();

//ROUTES
app.use('/', routes);

//DISABLE
//app.disable('x-powered-by');                                                        //don't tell browsers we're using node.js in response (res) headers

//TESTS
// app.use((req, res, next) =>{                                                        //if we're not in a production environment and we add a querystring for a test, they will show
//     res.locals.showTests = app.get('env') !== 'production' && req.query.test == '1';
//     next();
// });

//404
app.use((req,res) => {                                                              //404 = Not found
    res.status(404);
    res.render('404');
});

//500
app.use((err, req, res, next) => {                                                  //500 = server error
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

//LISTEN
app.listen(app.get('port'), () => {                                                 //start the server
    console.log('Server started on port ' + app.get('port'));
    console.log(process.env.baseURL);
});

