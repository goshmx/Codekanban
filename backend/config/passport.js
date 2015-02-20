var passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findOne(id).exec(function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {		
		process.nextTick(function () {			
			User.findOne().where({ username: username }).exec(function(err, user) {
				if (err) { return done(null, err); }
				if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
				bcrypt.compare(password, user.password, function(err, res) {
					if (!res) return done(null, false, { message: 'Invalid Password'});
					return done(null, user, { message: 'Logged In Successfully'} );
				});
			})
		});
	}
));

module.exports = {
	http: {
		customMiddleware: function(app){
			console.log('Express midleware for passport');
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(function(req,res,next){
				// Set the loggedUser in locals
				// to get it from the view
				res.locals.loggedUser = req.user;
				next();
			});
		}
	}
};