const EventEmitter = require('events');
const express=require('express')
const router=express.Router();
const fs =require('fs');
const { Op } = require('sequelize');
const User=require('../model/user')
const jwt=require('jsonwebtoken')
const secretKey="viratkholi-therunmachine"

// creating instance of Eventemitter
const eventEmitter = new EventEmitter();   

eventEmitter.on('listener',(message)=>{
    fs.appendFile('logs.txt', message + " " + new Date() + "\n", (err) => {
        if (err) throw err;
    });
})
// ----------------------------------------Middleware-------------------------------------------------------
const authToken=(role)=>{
    return (req,res,next)=>{
        const authHeader=req.headers['authorization'];
        const token=authHeader&&authHeader.split(' ')[1];
        if(!token){
            eventEmitter.emit('listener','Token not exist . Provide valid token')
            return res.status(401).send('Token not exist . Provide valid token')
        }
        jwt.verify(token,secretKey,(err,data)=>{
            if(err){
                eventEmitter.emit('listener',`Token has no validity.Provide valid token`)
                return res.status(401).send(`Token has no validity.Provide valid token`)
            }
            if (!role.includes(data.role)) {
                eventEmitter.emit('listener',`API access denied for ${data.role}`)
                return res.status(403).send(`API access denied for ${data.role}`);
            }
            req.userName=data.name;
            req.userRole=data.role;
            next();
        })
    }
}

// ----------------------------------------getAll user--------------------------------------
router.get('/getAllUsers',authToken('admin'),(req,res)=>{
    User.findAll()
    .then((users)=>{
        if(users!==null){
            eventEmitter.emit('listener','All users details received by admin')
            res.status(200).send(users)
        }
        else{
            eventEmitter.emit('listener','No users exist')
            res.status(404).send('No users exist')
        }
    })
    .catch((err)=>{
        eventEmitter.emit('listener',`${err.message}`)
        res.status(500).send(err.message)
    })
})
// --------------------------------------------getUser by name---------------------------------------
router.get('/getByName/:name',authToken(['admin','user']),(req,res)=>{
    if(req.userName!==req.params.name&&req.userRole==='user'){
        eventEmitter.emit('listener','Cannot access details of other Users')
        return res.status(400).send('Cannot access details of other Users')
    }
    User.findOne({
        where: {
            name : req.params.name
        }
    })
    .then((user)=>{
        if(user!==null){
            eventEmitter.emit('listener',` Details of ${user.name} send from login database`)
            res.status(200).send(user)
        }
        else{
            eventEmitter.emit('listener',`No users with name: ${req.params.name} exist.Provide existing name`)
            res.status(404).send(`No users with name: ${req.params.name} exist.Provide existing name`)
        }
    }).catch((err)=>{
        eventEmitter.emit('listener',`${err.message}`)
        res.status(500).send(err.message)
    })
})

// -------------------------------------------------Add new user--------------------------------------------
router.post('/addUser',(req,res)=>{

    User.findOne({
        where:{
            [Op.or]: [
                { mailid: req.body.mailid },
                { name: req.body.name }
            ]
        }
    }).then((exist)=>{
        if(exist!==null){
            eventEmitter.emit('listener','mailid or name already exist')
            return res.status(409).send('mailid or name already exist')
        }
        else{
            User.create({
                name:req.body.name,
                mailid:req.body.mailid,
                password:req.body.password,
                status:req.body.status
            })
            .then((user)=>{
                eventEmitter.emit('listener',`New user with name ${user.name} created`)
                res.status(201).send(user)
            })
            .catch((err)=>{
                eventEmitter.emit('listener',`${err.message}`)
                res.status(400).send(err.message)
            })
        }
    }).catch((err)=>{
        eventEmitter.emit('listener',`${err.message}`)
        res.status(500).send(err.message)
    })
   
})

// ----------------------------------------------------update mail--------------------------------
router.put('/updateMail/:name', authToken(['user']), (req, res) => {
    if(req.userName!==req.params.name){
        eventEmitter.emit('listener','Cannot update details of other Users')
        return res.status(400).send('Cannot update details of other Users')
    }
    if (req.body.mailid === undefined) {
        eventEmitter.emit('listener', 'Provide Mailid to update');
        return res.status(400).send('Provide Mailid to update'); 
    }
    
    User.findOne({
        where: {
            name: req.params.name
        }
    })
    .then((user) => {
        if(user.status===false){
            eventEmitter.emit('listener', "User Status is inactive");
            return res.status(400).send("User Status is inactive")
        }
        else if (user !== null) {
            user.update({
                mailid: req.body.mailid
            })
            .then(updated => {
                eventEmitter.emit('listener', `User ${req.params.name}'s mailid updated`);
                res.status(200).send(updated); 
            })
            .catch((err) => {
                eventEmitter.emit('listener', `${err.message}`);
                res.status(400).send(`Error while updating: ${err.message}`); 
            });
        } else {
            eventEmitter.emit('listener', `No Such User with name ${req.params.name} Exist. Provide existing name`);
            res.status(404).send(`No Such User with name ${req.params.name} Exist. Provide existing name`); 
        }
    })
    .catch((err) => {
        eventEmitter.emit('listener', `${err.message}`);
        res.status(500).send(`Error: ${err.message}`);
    });
});

// ----------------------------------------------------update password--------------------------------
router.put('/updatePassword/:name',authToken('user'),(req,res)=>{
    if(req.body.password===undefined){
        eventEmitter.emit('listener','Provide Password to update')
        return res.status(400).send('Provide Password to update')
    }
    User.findOne({
        where:{
            name:req.params.name
        }
    })
    .then((user)=>{
        if(user!==null){
            user.update({
                password:req.body.password
            })
            .then(updated=>{
                eventEmitter.emit('listener',`User ${req.params.name}'s password updated`)
                res.status(200).send(updated)
            })
            .catch((err)=>{
                eventEmitter.emit('listener',`${err.message}`)
                res.status(422).send(`Error while updating: ${err.message}`)
            })
        }
        else{
            eventEmitter.emit('listener',`No Such User with name ${req.params.name} Exist. Provide existing name`)
            res.status(404).send(`No Such User with name ${req.params.name} Exist. Provide existing name`)
        }
    })
    .catch((err)=>{
        eventEmitter.emit('listener', `${err.message}`)
        res.status(500).send(`Error: ${err.message}`)
    })
})
// --------------------------------------------Inactive a user----------------------------------------
router.put('/changeStatus', authToken(['admin']), (req, res) => {
    let Mailid = req.body.mailid;
    let Name = req.body.name;

    if (!Mailid && !Name) {
        eventEmitter.emit('listener', 'Missing mailid or name in request body. Provide valid details');
        return res.status(400).send('Missing mailid or name in request body. Provide valid details');
    }
    if (!Mailid) {
        Mailid = "mail";
    }
    if (!Name) {
        Name = "Name";
    }


    User.findOne({
        where: {
            [Op.or]: [
                { mailid: Mailid },
                { name: Name }
            ]
        }
    })
    .then((user) => {
        if (user === null) {
            eventEmitter.emit('listener', `No such user exist. Provide valid name or mailid`);
            return res.status(404).send(`No such user exist. Provide valid name or mailid`);
        } else if(user.status===true){
            user.update({
                status: false
            })
            .then((updated) => {
                eventEmitter.emit('listener', `User ${user.name} status changed to inactive by admin`);
                res.status(200).send(user);
            })
            .catch((err) => {
                eventEmitter.emit('listener', `${err.message}`);
                res.status(400).send(`Error while updating: ${err.message}`);
            });
            }
            else if(user.status===false){
                user.update({
                    status: true
                })
                .then((updated) => {
                    eventEmitter.emit('listener', `User ${user.name} status changed to active by admin`);
                    res.status(200).send(user);
                })
                .catch((err) => {
                    eventEmitter.emit('listener', `${err.message}`);
                    res.status(400).send(`Error while updating: ${err.message}`);
                });
            }
    })
    .catch((err) => {
        eventEmitter.emit('listener', `${err.message}`);
        res.status(500).send(`Error ${err.message}`);
    });
});

// ---------------------------------------login-----------------------------------------------

router.post('/login', (req, res) => {
    if(req.body.mailid===undefined||req.body.password===undefined){
        eventEmitter.emit('listener', 'Provide both mailid and password to login');
        return res.status(400).send('Provide both mailid and password to login')
    }
    User.findOne({
        where: {
            mailid: req.body.mailid
        }
    })
    .then((user) => {
        if (user !== null) {
            if (user.password === req.body.password && user.status === true) {
                const roleObject={role:user.role,name:user.name}
                const expiresIn = 3600; 
                const accessToken = jwt.sign(roleObject, secretKey, { expiresIn });
                const msg=`User ${user.name} logged in successfully.`;
                const details=`${msg} \n Access Token:${accessToken}`
                eventEmitter.emit('listener', `User ${user.name} logged in successfully.`);
                res.status(200).send(details)
            } else if (user.password !== req.body.password) {
                eventEmitter.emit('listener', 'Login failure: Invalid password.Provide valid password');
                res.status(401).send('Invalid password.Provide valid password'); 
            } else {
                eventEmitter.emit('listener', 'Login failure: Status is inactive.Reach admin to fix this issue');
                res.status(403).send('Status is inactive.Reach admin to fix this issue'); 
            }
        } else {
            eventEmitter.emit('listener', 'Login failure: mailid not found.Provide valid mailid');
            res.status(404).send('mailid not found.Provide valid mailid');
        }
    })
    .catch((err) => {
        eventEmitter.emit('listener', `Login error: ${err.message}` );
        res.status(500).send('Error: ' + err.message); 
    });
});

// ------------------------------------ActiveUsers------------------------------------

router.get('/activeUsers',(req,res)=>{
    User.count({
        where:{
            status:true
        }
    })
    .then((ans)=>{
        console.log(ans)
        eventEmitter.emit('listener', `Totally ${ans} active users `);
        return res.json(ans)
    })
    .catch((err)=>{
        eventEmitter.emit('listener', err.message);
        return res.send(err.message)
    })
})
module.exports=router;
