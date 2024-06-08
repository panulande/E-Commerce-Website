const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {MongoClient.connect('mongodb+srv://panulande2003:ZAaI16Wxb1dPhBfy@cluster0.sxfszm7.mongodb.net/shop?retryWrites=true')
.then(client => {
  console.log('CONNECTED');
  _db = client.db();  //stored the access to the database
  callback();
}).catch(err => {
  console.log(err);
});
}

const getDb = () =>{
  if(_db){
    return _db; //returning the access to the database if it exists
    //mongodb provides sufficient amount of connnections to interact and manitain pool
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;