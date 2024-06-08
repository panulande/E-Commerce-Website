const mongodb = require('mongodb');
const mongoClient = mongodb.mongoClient;

let _db;

const mongoConnect = (callback) => {(mongoClient.connect('mongodb+srv://panulande2003:ZAaI16Wxb1dPhBfy@cluster0.sxfszm7.mongodb.net/shop?retryWrites=true'))
    .then(client => {
        console.log("connected");
        _db = client.db();
        callback();
    }).catch(err =>{
        console.log(err);
    })

}

const getDb = () => {
    if(_db){
        return _db;
    }
    console.log('no database found');
}