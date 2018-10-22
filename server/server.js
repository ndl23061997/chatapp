var io = require('socket.io').listen(8000);
var db = require('./database');

// Mảng lưu các user đã đăng nhập
var listLogined = [];

io.sockets.on('connection', (socket) => {
    console.log('co nguoi ket noi!');

    // Người dùng đăng nhập
    socket.on('user_login', (username, password) => {
        var index =  listLogined.indexOf(username);
        if(index > -1) {
            
            socket.emit('login_acept', { login: false , des : "Tài khoản đã đăng nhập trước ở máy khác"});
            return;
        }
        db.Account.find({username : username, password : password} , (err, docs) => {
            if(err) throw Error;
            console.log(docs);
            if(docs.length > 0) {
                socket.emit('login_acept', { login: true , des : "Login thành công" }, username);
                io.emit('member_login', { login: true , des : "Login thành công" }, username);
                listLogined.push(username);
                console.log(username + " logined");
                socket.username = username;
            } else {
                socket.emit('login_acept', { login: false , des : "Tài khoản hoặc mật khẩu không chính xác"});
                console.log(username + ' Login fail');
            }
        });
    });

    // Người dùng đăng kí tài khoản
    socket.on('sign_up', (username, password) => {

        db.Account.find({ username: username }, (err, docs) => {
            if(err) throw Error;
            console.log(docs.length);
            if (docs.length > 0) {
                socket.emit("result_sign_up", { rs: "fasle", des: "Tài khoản đã tồn tại trong hệ thống" });
                return;
            } else {
                console.log(username + " sigup success");
                var newAcc = new db.Account();
                newAcc.username = username;
                newAcc.password = password;
                newAcc.save((err) => {
                    if(!err) {
                        socket.emit("result_sign_up", { rs: "true", des: "Đăng kí thành công"});
                    }
                });
            }
        });

    });

    // NGười dùng đăng xuất
    socket.on('user_logout', (username) => {
        var index = listLogined.indexOf(username);
        if(index > -1) {
            listLogined.splice(index, 1);
            console.log(username + ' logout');
            socket.emit('logout_result', "ok");
            io.emit('member_logout', username);
        }
        
    });

    // client lấy danh sách thành viên đang online
    socket.on('get_user_online', ()=> {
        console.log(socket.username + " get list user online");
        socket.emit('rs_get_user_online', listLogined.toString());
    });

    socket.on('disconnect', ()=> {
        var index = listLogined.indexOf(socket.username);
        if(index > -1) {
            listLogined.splice(index, 1);
            console.log(socket.username + ' logout');
            socket.emit('logout_result', "ok");
            io.emit('member_logout', socket.username);
        } 
    });

    // Client Gui tin nhan
    socket.on('client_send_to_all', (username, message) => {
        console.log(username + " : " + message);
        io.emit('server_send_to_all', username, message);
    });
});

