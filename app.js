//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    secret: "bertato",
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

// define MongoDB URL and connect
mongoose.connect(process.env.DB_URL)

// Parameterise MongoDB
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
userSchema.plugin(passportLocalMongoose)
const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req,res) => {
    res.render('home')
})

app.route('/login')
.get((req,res) => {
    res.render('login')
})
.post((req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate(local)(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
})

app.route('/secrets')
.get((req, res) => {
    req.isAuthenticated() ? res.render('secrets') : res.redirect('/login')
})

app.get('/logout', (req, res) => {
    req.logout((err) => {
        !err ? res.redirect('/') : res.send(err)
    })
})

app.route('/register')
.get((req,res) => {
    res.render('register')
})
.post((req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
})

const port = ( process.env.port || 3000 )
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})