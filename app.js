const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Course = require('./models/course')

// express app
const app = express();

// connect to mongodb
const dbURI = 'mongodb+srv://connor:1234@nodetuts.oi2jfex.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))

// register view engine
app.set('view engine', 'ejs');

// middleware and static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// routes
// index
app.get('/', (req, res) => {
    res.render('index', { title: 'Home'});
});

// login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// course routes
// courses
app.get('/courses', (req, res) => {
    Course.find().sort({ createdAt: -1 })
        .then((result) => {
            res.render('courses', {title: 'All Courses', courses: result})
        })
        .catch((err) => {
            console.log(err);
        });
});

// post handler
app.post('/courses', (req, res) => {
    const course = new Course(req.body);

    course.save()
        .then((result) => {
            res.redirect('/courses');
        })
        .catch((err) => {
            console.log(err);
        })
})

// create course
app.get('/courses/create', (req, res) => {
    res.render('create', { title: 'Create Course' });
});

app.get('/courses/:id', (req, res) => {
    const id = req.params.id;
    Course.findById(id)
        .then(result => {
            res.render('details', { course: result, title: 'Course Details'});
        })
        .catch(err => {
            console.log(err);
        });
})

// delete course
app.delete('/courses/:id', (req, res) => {
    const id = req.params.id;

    Course.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/courses' });
        })
        .catch(err => {
            console.log(err);
        })
})

// 404
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});