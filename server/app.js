global.__basedir = __dirname;

const express = require('express');
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');
const logger = require(`./config/winston`);
const fnftServiceRoutes = require('./routes/fnftServiceRoutes');
const auth = require('./routes/auth')
const { default: mongoose } = require('mongoose');
const cors = require('cors');

const app = express();

app.use((req, res ,next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next()
});

require('dotenv').config();
app.use(express.json({limit:'100mb'}));
app.use(bodyParser.urlencoded({extended:false,limit:'100mb'}));
app.use('/fnft',fnftServiceRoutes);
app.use('/auth',auth);
app.use(cors());
app.use(fileUpload());

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
