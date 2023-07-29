const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Course = require('./models/course')
const User = require("./models/User");
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

// ----------ROUTES----------

//---Auth---
app.use(authRoutes);



//---Courses---

// index
app.get('/', (req, res) => {
    res.redirect('/courses');
    //res.render('index', { title: 'Home'});   
});
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
app.post('/courses',requireAuth, (req, res) => {
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
//individual course page
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
app.delete('/courses/:id',requireAuth, (req, res) => {
    const id = req.params.id;

    Course.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/courses' });
        })
        .catch(err => {
            console.log(err);
        })
})
// Edit course page
app.get('/edit/:id',requireAuth, (req, res) => {
    const id = req.params.id;
    Course.findById(id)
        .then(result => {
            res.render('edit', { course: result, title: 'Edit Course'});
        })
        .catch(err => {
            console.log(err);
        });
});
//Edit course request
app.put('/edit/:id',requireAuth, (req, res) => {
    const courseId = req.params.id;
    const updatedCourse = {
        code: req.body.code,
        title: req.body.title,
        desc: req.body.desc
    };

    Course.findOneAndUpdate({ _id: courseId }, updatedCourse, { new: true })
        .then(result => {
            res.json({ redirect: '/courses' });
        })
        .catch(err => {
            console.log(err);
        });
})

//---Scheduler---

//Schedule Page
app.get('/schedule', (req, res) => {
    Course.find({ _id: { $in: res.locals.user.schedule } })
        .then(result => {
            res.render('schedule', { courses: result, title: 'My Schedule'});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal server error." });
        });
});
//Schedule add class
app.get('/schedule/add/:id', (req, res) => {
    const id = req.params.id;
    User.findOneAndUpdate({ _id: res.locals.user._id }, { $push: { schedule: id } }, { upsert: true })
        .then(result => {
            res.redirect('/schedule');
        },
        err => {
            console.log(err);
            res.status(500).json({ error: "Internal server error." });
        }
    );
});
//Schedule remove class
app.get('/schedule/remove/:id', (req, res) => {
    const id = req.params.id;
    User.findOneAndUpdate({ _id: res.locals.user._id }, { $pull: { schedule: id } }, { upsert: true })
        .then(result => {
            res.redirect('/schedule');
        },
        err => {
            console.log(err);            
            res.status(500).json({ error: "Internal server error." });
        }
    );
});


//---404---
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});