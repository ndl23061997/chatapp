var db = require('mongoose');
var serverUrl = 'mongodb://localhost:27017/chatapp';
db.connect(serverUrl, (err) => {
    if (err) console.log('database connect fail');
});

var accSchema = new db.Schema({
    username: String,
    password: String
});

this.Account = db.model('account', accSchema);
