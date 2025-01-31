
// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const path = require('path');

// const app = express();

// // setting up our view engine for our ejs file
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // rendering my html files to my routes
// app.use(express.static(path.join(__dirname, 'public')));


// // Middleware setup
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//     secret: 'yourSecretKey',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));

// // MongoDB connection
// mongoose.connect('mongodb://127.0.0.1:27017/database', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', () => console.log('Error in connecting to database'));
// db.once('open', () => console.log('Connected to database'));

// // Define Schemas
// // my user reporting schema
// const crimeReportSchema = new mongoose.Schema({
//     name: { type: String, required: false },
//     location: { type: String, required: true },
//     phoneno: { type: Number, required: true },
//     description: { type: String, required: true },
//     date: { type: Date, default: Date.now },
//     status: { type: String, enum: ['resolved', 'pending'], default: 'pending' }
// });
// const CrimeReport = mongoose.model('CrimeReport', crimeReportSchema);

// // my admin signup and login schema
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
// });
// const User = mongoose.model('User', userSchema);

// // Crime Reporting
// // handles the logic of submitting form to the database
// app.get('/report', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'report.html'));
// });
// app.post('/report', (req, res) => {
//     const { name, location, phoneno, description, date } = req.body;
//     if (!description || !location || !phoneno || !date) {
//         return res.status(400).send("Description, location, phone number, and date are required.");
//     }
//     const newReport = new CrimeReport({ name, location, phoneno, description, date });
//     newReport.save()
//         .then(() => res.status(201).send("Information reported successfully"))
//         .catch(err => res.status(500).send("Error reporting information: " + err));
// });


// // handles the logic of the admin signingup
// app.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'signup.html'));
// });

// app.post('/signup', async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//         return res.status(400).send("Username and password are required.");
//     }
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ username, password: hashedPassword });
//         await newUser.save();
//         res.status(201).redirect("/login");
//     } catch (error) {
//         res.status(500).send("Error registering admin: " + error);
//     }
// });

// // admin logging in his dashboard
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//         return res.status(400).send("Username and password are required.");
//     }
//     try {
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(400).send("Invalid username or password.");
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).send("Invalid username or password.");
//         }
//         req.session.user = user;
//         res.redirect('/admin/dashboard'); 
//     } catch (error) {
//         res.status(500).send("Error logging in: " + error);
//     }
// });


// // handles the logic of admin changing status of the cases
// app.post('/admin/changeStatus/:id', isAuthenticated, async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;
//     try {
//         const updatedReport = await CrimeReport.findByIdAndUpdate(id, { status }, { new: true });
//         res.redirect('/admin/dashboard');
//     } catch (error) {
//         res.status(500).send("Error changing status: " + error);
//     }
// });

// // the admin can filter the cases by their statuses
// app.get('/admin/dashboard', isAuthenticated, async (req, res) => {
//     const { status } = req.query;
//     try {
//         let crimeReports;
//         if (status) {
//             crimeReports = await CrimeReport.find({ status }).sort({ date: -1 });
//         } else {
//             crimeReports = await CrimeReport.find().sort({ date: -1 });
//         }
//         res.render('dashboard', { crimeReports });
//     } catch (error) {
//         res.status(500).send("Error fetching crime reports: " + error);
//     }
// });

// // Logout Route function
// app.get('/logout', (req, res) => {
//     req.session.destroy(err => {
//         if (err) {
//             return res.status(500).send("Error logging out: " + err);
//         }
//         res.redirect('/login');
//     });
// });

// // trying to check if the user is authenticated
// function isAuthenticated(req, res, next) {
//     if (req.session.user) {
//         return next();
//     } else {
//         res.status(401).send("Unauthorized");
//     }
// }

// // Listen on port 3000
// app.listen(3000, () => {
//     console.log('Listening on port 3000');
// });

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer'); // Add nodemailer

const app = express();

// setting up our view engine for our ejs file
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// rendering my html files to my routes
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', () => console.log('Error in connecting to database'));
db.once('open', () => console.log('Connected to database'));

// Define Schemas
// my user reporting schema
const crimeReportSchema = new mongoose.Schema({
    name: { type: String, required: false },
    location: { type: String, required: true },
    phoneno: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['resolved', 'pending'], default: 'pending' }
});
const CrimeReport = mongoose.model('CrimeReport', crimeReportSchema);

// my admin signup and login schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Configuring nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pensymaryanne@gmail.com', //sender email address
        pass: 'catp bsed jilj nfkn' // my email password or app-specific password
    }
});

// Crime Reporting
// handles the logic of submitting form to the database
app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.post('/report', (req, res) => {
    const { name, location, phoneno, description, date } = req.body;
    if (!description || !location || !phoneno || !date) {
        return res.status(400).send("Description, location, phone number, and date are required.");
    }
    const newReport = new CrimeReport({ name, location, phoneno, description, date });
    newReport.save()
        .then(() => {
            // logic of email sending
            const mailOptions = {
                from: 'pensymaryanne@gmail.com',
                to: 'emiliapensy@gmail.com',
                subject: 'New Crime Report Submitted',
                text: `A new crime report has been submitted to your database:`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).send("Error reporting information: " + error);
                } else {
                    res.status(201).send("Information reported successfully");
                }
            });
        })
        .catch(err => res.status(500).send("Error reporting information: " + err));
});

// handles the logic of the admin signing up
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).redirect("/login");
    } catch (error) {
        res.status(500).send("Error registering admin: " + error);
    }
});

// admin logging in his dashboard
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send("Invalid username or password.");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid username or password.");
        }
        req.session.user = user;
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Error logging in: " + error);
    }
});

// handles the logic of admin changing status of the cases
app.post('/admin/changeStatus/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedReport = await CrimeReport.findByIdAndUpdate(id, { status }, { new: true });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Error changing status: " + error);
    }
});

// the admin can filter the cases by their statuses
app.get('/admin/dashboard', isAuthenticated, async (req, res) => {
    const { status } = req.query;
    try {
        let crimeReports;
        if (status) {
            crimeReports = await CrimeReport.find({ status }).sort({ date: -1 });
        } else {
            crimeReports = await CrimeReport.find().sort({ date: -1 });
        }
        res.render('dashboard', { crimeReports });
    } catch (error) {
        res.status(500).send("Error fetching crime reports: " + error);
    }
});

// Logout Route function
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out: " + err);
        }
        res.redirect('/login');
    });
});

// trying to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

// Listen on port 3000
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

