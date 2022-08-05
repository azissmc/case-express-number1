const express = require('express');
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'ini adalah kode secret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60*60*1000}
}))
// app.get('/', (req, res) => {
//     const nama = "muchamad umar abdul azis";    
//     res.send(`Hello ${nama}, Selamat datang di NodeJS`);
// });

// app.get('/kedua', (req, res) => {
//     const a = 5, b = 5;
//     const hasil = a + b;
//     res.send(`Hasil = ${hasil}`);
// });

// app.post('/ketiga', (req, res) => {
//     const namaDepan = "diki";
//     const namaBelakang = "Riyandi";
//     res.send(`Selamat datang ${namaDepan} ${namaBelakang}`);
// });


// sistem login
const users = [
    {
        fullname : "admin",
        username: "admin",
        password: " admin",
        level: "admin"
    }
];

app.get('/sessionid', (req, res) =>{
    res.send(req.session.user);
})

app.get('/', (req, res) => {
    res.render('utama', {
        layout: 'layouts/main-layout',
        title: "Home"
    });
});

app.get('/user', (req,res) => {
    res.render('datauser', {
        layout: 'layouts/main-layout',
        title: "Data-User",
        users,
        user: req.session.user || ""
    });
});

app.get('/tambah', (req,res) => {
    let message = req.session.err || "";
    req.session.err = "";
    res.render('tambahUser', {
        layout: 'layouts/main-layout',
        title: "Tambah data",
        message
    });
});

app.get('/update/:username', (req,res) => {
    const us = req.params.username;
    const findIndex = users.find(user => user.username === us);
    res.render('updateUser', {
        layout: 'layouts/main-layout',
        title: "Update-User",
        fullname: findIndex.fullname,
        username: findIndex.username,
        password: findIndex.password,
        level: findIndex.level
    });
});

app.post('/updateData/:username', async(req, res, next) =>{
    try {
        const us = req.params.username;
        const findIndex = users.find(user => user.username === us);
        const index = users.indexOf(findIndex);

        const fullname = req.body.fullname;
        const username = req.body.username;
        const password = req.body.password;
        const level    = req.body.level;
        const data = {fullname, username, password, level};


        users.splice(index,1, data);
        res.send('updated success');
    } catch (error) {
        res.status(400).json({
          'status': 'ERROR',
          'messages': error.message
        })
    }
});

app.get('/register', (req, res) => {
    res.render('home', {
        layout: 'layouts/main-layout',
        title: "Register"
    });
});


// POST REQUEST IS HERE
app.post('/register', (req, res) => {
    const fullname = req.body.fullname;
    const username = req.body.username;
    const password = req.body.password;
    const level    = req.body.level;

    if(username === users.username){
        res.send("User ini sudah ada!");
    }else{  
        const data = {fullname, username, password, level};
    
        users.push(data);
        res.send('Berhasil Register');
    }
});

app.post('/tambah', (req, res) => {
    const fullname = req.body.fullname;
    const username = req.body.username;
    const password = req.body.password;
    const level    = req.body.level;

    const findIndex = users.find(user => user.username === username);
    req.session.user = findIndex.level;
    console.log(req.session.user);

    if(findIndex.username == username){
        req.session.err = "user ini sudah ada";
        res.redirect('/tambah');
    }else if(req.session.user != 'admin'){
        req.session.err = "Maaf anda bukan admin";
        res.redirect('/tambah');
    }else{  
        const data = {fullname, username, password, level};
    
        users.push(data);
        res.redirect('/user');
    }
});

// hapus
app.delete('/hapus/:username', async function(req, res, next){
    try {
      const us = req.params.username;
      const findIndex = users.find(user => user.username === us);
      const index = users.indexOf(findIndex);


      users.splice(index,1);

      res.send('deleted success');

    } catch(err) {
      res.status(400).json({
        'status': 'ERROR',
        'messages': err.message
      })
    }

});
  

app.get('/login', (req, res) => {
    let message = req.session.err || "";
    req.session.err = "";
    res.render('login', {
        layout: 'layouts/main-layout',
        title: "Login",
        message
    })
});


app.post('/cekLogin', (req, res) => {
    const us =  req.body.username;
    const pass = req.body.password;

    const findIndex = users.find(user => user.username === us);   
    if(findIndex.username == us){ 
        if(findIndex.password == pass){
            req.session.user = findIndex.level;
            res.redirect('/user'); 
        }else{
            req.session.err = "Incorect password";
            res.redirect('/login');
        }
    }else{
        req.session.err = "Incorect username or pasword";
        res.redirect('/login');
    }


});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

app.listen(port, () => {
    console.log(`ini dijalankan port: ${3000}`);
});