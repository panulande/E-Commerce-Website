const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
MONGODB_URI = 'mongodb+srv://panulande2003:ZAaI16Wxb1dPhBfy@cluster0.sxfszm7.mongodb.net/shop';

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',

});

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'my secret', resave: false, saveUninitialized: false, store: store}));

app.use((req, res, next) => {
  User.findById('666821b30522453aa84817fa')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose.connect(MONGODB_URI).then(result => {
  User.findOne().then(user =>{
    if(!user){
      const user = new User({
        name: "panu",
        email: "panulande2003@gmail.com" ,
        cart: {
          items: []
        }
    });
    user.save()
    }
  });
app.listen(3000);
}).catch(err=>{
  console.log(err);
});
