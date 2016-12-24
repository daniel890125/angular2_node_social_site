var jwt = require('jsonwebtoken');

module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        res.end();
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/success', // redirect to the secure profile section
        failureRedirect : '/failure', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        res.end();
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/success', // redirect to the secure profile section
        failureRedirect : '/failure', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', {  session: false, scope: [] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback', 
            passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
            function(req, res) {
                console.log('OOOOOOOKKKKKKK!');

                // Successful authentication, redirect home.
                try {
                    res.redirect('#/search');
                } catch (e) {
                    res.redirect('#/search');
                }
            });

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '#/search',
                failureRedirect : '#/search'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/oauth2callback',
            passport.authenticate('google', {
                successRedirect : '#/search',
                failureRedirect : '#/search'
            }));

    //Common Method -----------------------------------------

    app.get('/logout', function(req, res) {
        console.log('logout called');
        req.logout();
        req.session.destroy();
        res.json('Success');
    });

    app.get('/success', function(req, res) {
            // console.log('success request: '+req.user);
            res.json('Success');
            //res.redirect('/user/mail/'+req.user._id);
            //res.send({token : token, role:req.user.role, id:req.user._id});
        }
    );

    app.get('/failure', function(req, res) {
            console.log('failure request: ');
            res.json("EXIST");
        }
    );


    app.get('/loginStatus',
        isLoggedIn,
        function(req, res) {
            // console.log(req.user);
            if(req.user)
                res.json({role:req.user.role, id:req.user._id});
            else
                res.json('nouser');
        }
    );

    app.get('/isUserLogin',
        isLoggedIn,
        function(req, res) {
            // console.log(req.user);
            if(req.user)
                res.json(req.user);
            else
                res.json('fail');
        }
    );



};



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.json('notLoggedIn');
}
