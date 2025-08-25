const bodyParser = require('body-parser');
const express = require('express');
const db = require('./configs/db');
const app = express();
const path = require('path');
const router = require('./routers');
const port = process.env.port || 3000;
require('dotenv').config(); // Make sure this is at the top

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',router);

app.listen(port,()=>{
    try {
        db;
        console.log("Server Online on http://localhost:"+port);
    } catch (error) {
        console.log("Server not online");
        console.log(error.message);
    }
})