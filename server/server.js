var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require("fs");
server.listen(process.env.PORT || 3000);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res)=> {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('./views/chatui.html', (error, data) => {
        if(error) {
            res.writeHead(404);
            res.write('File not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
});
function Account () {
    this.username = '';
    this.password = '';
    this.login = false;
    return this;
}

var acc = new Account();
acc.username = 'long';
acc.password = '1234';

var listUser = [];
listUser.push(acc);

io.sockets.on('connection', (socket) => {
    console.log('co nguoi ket noi!');

    socket.on('user_login', (username, password) => {
        var index = listUser.findIndex(x => x.username == username);
        
        if( index > -1) {
            
            var user = listUser[index];
            if(user.password == password && !user.login) {
                listUser[index].login = true;
                console.log(username + ' logined!');
                io.sockets.emit('login_acept', {login : true});
            }
            return;
        } else {
            console.log(username + " Login failed");
            io.sockets.emit('login_acept', {login : false});
        }
        
    });

    socket.on('send_message', (message) => {
        io.sockets.emit('receiver_message', {data: socket.user + ": " + message});
    });

});

