// Initialize express server on PORT 3000
const express = require('express');
const ejs = require("ejs");
const mongoose = require("mongoose");
const ShortUrl = require('./models/url');
const app = express();
const PORT = 3000;

// tells express to use ejs as the default templating engine 
app.set('view engine', 'ejs');
// allows us to read the response of the user from the form
app.use(express.urlencoded({ extended:false }));


// home route
app.get('/', async (req, res) => {
    const allData = await ShortUrl.find(); // database query to get all URLs from here

    res.render('index', { ShortUrls: allData });
});


// dynamic route
app.get('/:shortid', async (req, res) => {
    // get the :shortid param
    const shortid = req.params.shortid;

    // preform the mongoose call to find the long url
    const rec = await ShortUrl.findOne({short: shortid});

    // if null, set status to 404
    if(!rec) return res.sendStatus(404);

    // if not null, increment the click count in database
    rec.clicks++;
    await rec.save();

    res.redirect(rec.full);
});


app.post('/short', async (req, res) => {
    // grab the fullUrl parameter from the req.body
    const fullUrl = req.body.fullUrl;
    console.log('URL requested: ', fullUrl);

    // insert and wait for the record to be inserted using the model
    const record = new ShortUrl({
        full: fullUrl
    });

    await record.save();
    res.redirect('/'); // return to the home route

});


// sets up connection to mongodb database
mongoose.connect('mongodb://localhost/urlShortDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// as long as there is a connection to mongodb
mongoose.connection.on('open', () => {
    // start looking for activity
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});




// NOTE:
// To start mongodb in WSL terminal
// execute "sudo service mongodb start"
// then "monogo" starts the mongo shell