global.__basedir = __dirname;

const express = require('express');
const bodyParser = require('body-parser');
const logger = require(`./config/winston`);
const fnftServiceRoutes = require('./routes/fnftServiceRoutes');
const auth = require('./routes/auth')
const { default: mongoose } = require('mongoose');
const app = express();

require('dotenv').config();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use('/fnft',fnftServiceRoutes);
app.use('/auth',auth);

mongoose.connect(process.env.DB,{ useNewUrlParser: true})
.then(() => {
    console.log("MongoDB connection successfull....");
    app.set('con',mongoose.connection);
})
.catch((err) => (console.log(err)))

app.listen(process.env['PORT'],(error)=>{
    if(error){
        logger.error('Failed to start the server');
    }
    logger.info(`Server Started on port ${process.env['PORT']}`);
});
