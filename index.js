//importing necessary Node.js modules
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const axios = require('axios');

//creating an Express application instance
const app = express();
const port = 3000;

//setting values for instagram client id and client secret
const INSTAGRAM_CLIENT_ID = '354997837228875';
const INSTAGRAM_CLIENT_SECRET = 'e0f22a26d473b7e6241965c0626a4b8f';

//configuring passport with InstagramStrategy
passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: 'https://localhost:3000/auth/instagram/callback',
},
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(session({ secret: '1234', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Welcome to the Instagram Dashboard!');
});

app.get('/auth/instagram', passport.authenticate('instagram'));

app.get('/auth/instagram/callback',
    passport.authenticate('instagram', { successRedirect: '/dashboard', failureRedirect: '/' })
);

app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    const apiUrl = 'https://graph.instagram.com/v13.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=';

    axios.get(apiUrl + req.user.token)
        .then(response => {
            const media = response.data.data;
            res.json({ user: req.user, media });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch data from Instagram API' });
        });
});

app.listen(
    port,
    () => console.log(`it's alive on http://localhost:${port}`)
);
