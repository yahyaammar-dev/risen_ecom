// starting server


const express = require('express');
const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// importing models
const User = require('./models/User');



// connecting to db

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://yahyaammar:qw4hddqcrg@cluster0.skkmm1v.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');


        // Routes

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });




        // Define your routes here
        app.get('/', async (req, res) => {
            try {
                // const users = await User.find();
                // res.json(users);
                console.log('hello')
                res.json('hello world')
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });





