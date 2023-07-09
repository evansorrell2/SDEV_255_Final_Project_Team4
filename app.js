const express = require('express');

// express app
const app = express();

// listen for requests
app.listen(3000);

// register view engine
app.set('view engine', 'ejs');
// app.set('views', 'myviews');

app.get('/', (req, res) => {
  const classes = [
    {title: 'SDEV148', snippet: 'This course seeks to introduce the fundamental principles of computer game development.'},
    {title: 'CSIA105', snippet: 'The students will explore the field of Cyber Security/Information Assurance focusing on the technical and managerial aspects of the discipline.'},
    {title: 'SDEV255', snippet: ' Students will learn how to use and apply client and server-side scripting and application programming interfaces to build web-based applications.'},
  ];
  res.render('index', { title: 'Home', classes });
});

app.get('/create', (req, res) => {
  res.render('create', { title: 'Create a new class' });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
