const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { getMongoUri, stopMongoServer } = require('./config/db');
const Student = require('./models/student');
const { faker } = require('@faker-js/faker');

const app = express();
const PORT = 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
getMongoUri().then((mongoUri) => {
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(async () => {
            console.log('Connected to in-memory MongoDB');
            const count = await Student.countDocuments();
            console.log(`Total students in database at startup: ${count}`);
        })
        .catch(err => console.error('Failed to connect to in-memory MongoDB', err));
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/students', async (req, res) => {
    try {
        const { q } = req.query;
        let students;
        if (q) {
            const regex = new RegExp(q, 'i');
            students = await Student.find({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] });
        } else {
            students = await Student.find();
        }
        res.render('students', { students });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/add-student', (req, res) => {
    res.render('add-student');
});

app.post('/add-student', async (req, res) => {
    try {
        const { firstName, lastName, email, age, grade } = req.body;
        const student = new Student({ firstName, lastName, email, age, grade });
        await student.save();
        res.redirect('/students');
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/seed', async (req, res) => {
    try {
        const mongoUri = await getMongoUri();
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB for seeding');

        const students = [];
        for (let i = 0; i < 100; i++) {
            const student = new Student({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                age: faker.number.int({ min: 18, max: 25 }),
                grade: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
            });
            students.push(student);
        }

        await Student.insertMany(students);
        console.log('Database seeded with 100 students');

        
        res.status(200).send('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).send('Error seeding database');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    await stopMongoServer();
    process.exit(0);
});
