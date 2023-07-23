const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Course = require('./models/course')
const authRoutes = require('./routes/authRoutes.js');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

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
app.use(express.json());

//cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//UserInfo
app.get('*', checkUser);

// -----routes-----

//Auth

app.use(authRoutes);

// index
app.get('/', (req, res) => {
    res.redirect('/courses');
    //res.render('index', { title: 'Home'});   
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
app.get('/courses/create', requireAuth, (req, res) => {
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
// Edit course
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    Course.findById(id)
        .then(result => {
            res.render('edit', { course: result, title: 'Edit Course'});
        })
        .catch(err => {
            console.log(err);
        });
});
app.post('/edit/:id', (req, res) => {
    const course = new Course(req.body);
    const id = req.params.id;

    course.save()
        .then((result) => {
            Course.findByIdAndDelete(id)
            .then(result => {
                res.redirect('/courses');
            })
            .catch(err => {
            console.log(err);
            })

        })
        .catch((err) => {
            console.log(err);
        })
})

// app.put('/edit/:id', (req, res) => {
//     res.send()

// }

// 404
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});