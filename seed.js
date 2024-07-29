const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker'); // Use the new faker package
const { getMongoUri, stopMongoServer } = require('./config/db');
const Student = require('./models/student');

async function seedDatabase() {
    const mongoUri = await getMongoUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const students = [];
    for (let i = 0; i < 100; i++) {
        const student = new Student({
            firstName: faker.person.firstName(), // Updated method
            lastName: faker.person.lastName(), // Updated method
            email: faker.internet.email(),
            age: faker.number.int({ min: 18, max: 25 }), // Updated method
            grade: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
        });
        students.push(student);
    }

    await Student.insertMany(students);
    console.log('Database seeded with 100 students');
    const count = await Student.countDocuments();
    console.log(`Total students in database: ${count}`);

    await mongoose.disconnect();
}

seedDatabase().catch(err => console.error('Error seeding database:', err));
