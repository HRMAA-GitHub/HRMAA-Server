const express = require("express");
const xml = require("xml");
const xmlparser = require('express-xml-bodyparser');
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json())
app.use(xmlparser());

//mongodb connection url (not currently used) 
const connection_url = "mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PASSWORD +"@cluster0.olah8j1.mongodb.net/hrmaadb?retryWrites=true&w=majority"

mongoose.connect(connection_url, () => {
    console.log("connected to db")
});

//sample array
let data = {
    Array : [
        {
            "Name": "Ronaldo"
        }
    ]
}

//you can use this GET request to get the data in both json and xml form
// to get data in xml form pass the query type=xml 
app.get('/v0/getData', (req, res) => {
    const query = req.query;

    if(query.type === 'xml'){
        res.set('Content-type', 'text/xml');
        return res.send(xml(data, true));
    }else{
        return res.send(data);
    }

});

//this POST request can be used to save the data in the json form in the data base
app.post('/v0/postData', (req, res) => {
    let body = req.body;
    let query = req.query;
    console.log(body);
    if(query.type === 'xml'){
        res.set('Content-type', 'text/xml');
        return res.send(xml(body, true));
    } else {
        return res.send(body);
    }

})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});

