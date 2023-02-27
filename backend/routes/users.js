const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//getting list of users
//hiding passwordhash parameter by select method
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

//getting a single user by id
router.get(`/:id`, async (req, res) =>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user) {
        res.status(500).json({message: 'The user with given ID was not found'})
    } 
    res.status(200).send(user);
})

router.post(`/`, async (req, res) =>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone : req.body.phone,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        isBusinessUser : req.body.isBusinessUser
    })

    user = await user.save();

    if(!user) 
        return res.status(500).send('The user cannot be created')
    res.send(user);
})



router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isBusinessUser: req.body.isBusinessUser,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//finding the user by email 
router.post('/login',async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret
    if(!user)
    {
        return res.status(400).send('The user not found')
    }
//decrypting password
    if(user && bcrypt.compareSync(req.body.password , user.passwordHash)){

        const token = jwt.sign(
            {
                userId : user.id,
                isBusinessUser: user.isBusinessUser
            },
            secret,
        )
        //sending the token along with user email
        res.status(200).send({
            user : user.email,
            token : token
        });
    }
    else {
        res.status(400).send('incorrect password');
    }
    return res.status(200).send(user);
})

//registering user

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isBusinessUser: req.body.isBusinessUser,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})


module.exports =router;