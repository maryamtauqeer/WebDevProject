//Kindly ignore route2. I was following a playlist so this was just a part of that. 
//I understand that this route2 is not a part of the current assignment

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const dotenv=require("dotenv").config();

// app.use((req, res, next) =>{
//     res.status(200).json({
//         message: 'It works! :)'
//     });
// });


const userRoutes =require('./routes/user');
const route2Routes =require('./routes/route2');

mongoose.set('strictQuery', true);

mongoose.connect('mongodb+srv://maryammmt:'+
    process.env.MONGO_ATLAS_PW+
    '@webdev.agtsif4.mongodb.net/?retryWrites=true&w=majority'
    ,
    {
        //useMongoClient:true
        useNewUrlParser: true
    }
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/user', userRoutes);
app.use('/route2', route2Routes);

app.use((req, res, next) =>{
    const error= new Error('Route not found :(');
    error.status=404;
    next(error);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
    
});

module.exports=app;