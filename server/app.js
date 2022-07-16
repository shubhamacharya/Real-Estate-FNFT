global.__basedir = __dirname;

const express = require('express');
const bodyParser = require('body-parser');
const logger = require(`./config/winston`);
const fnftServiceRoutes = require('./routes/fnftServiceRoutes');
const app = express();

require('dotenv').config();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use('/fnft',fnftServiceRoutes);


app.listen(process.env['PORT'],(error)=>{
    if(error){
        logger.error('Failed to start the server');
    }
    logger.info(`Server Started on port ${process.env['PORT']}`);
});
