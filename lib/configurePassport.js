/* jshint esversion: 6 */
var User = require('../models/user.js');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const credentials = require('../config/credentials.js');

passport.serializeUser((user,done) =>{
    done(null, user._id);
});

passport.deserializeUser((id, done)=>{
    User.findById(id, (err, user)=>{
        if(err || !user){
            return done(err, null);
        }
        else{
            done(null, user);
        }
    });
});


module.exports = function(app, options){

    if(!options.successRedirect){
        options.successRedirect = '/account';
    }
    if(!options.failureRedirect){
        options.failureRedirect = '/login';
    }

    return {
        init: ()=>{
            var env = app.get('env');
            var config = options.providers;
            console.log(config);
            console.log(env);
            passport.use(
                new GoogleStrategy({
                    //options                  
                    callbackURL : '/auth/google/redirect',
                    clientID : credentials.authorizedProviders.google[env].appId,
                    clientSecret: credentials.authorizedProviders.google[env].appSecret,

                }, (accessToken, refreshToken, profile, done) =>{
                    //callback
                    var authId = 'google: ' + profile.id;
                    User.findOne({authId: authId}, (err, user)=>{
                        if(err){
                            console.log(err);
                            return done(err, null);
                        }
                        if(user){
                            console.log(user.name);
                            return done(null, user);
                        }
                        user = new User({
                            authId: authId,
                            name: profile.displayName,
                            created: Date.now(),
                            role: 'customer'
                        });
                        user.save((err)=>{
                            if(err){
                                return done(err, null);
                            }
                            done(null, user);
                        });
                    });
                }));

                app.use(passport.initialize());
                app.use(passport.session());
        },

        registerRoutes: () =>{
            app.get('/auth/google', (req, res, next)=>{
                passport.authenticate('google', {scope : 'profile'})(req,res,next);
            });
            app.get('/auth/google/redirect', passport.authenticate('google',
                    {failureRedirect: options.failureRedirect}),
                    (req, res) =>{
                        req.session.user = req.session.passport.user;
                        res.redirect('/account');
                    }
            );
        }
    };
};