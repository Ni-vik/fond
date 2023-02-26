const {User} = require('../models/user');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.post(`/`, async (req, res) =>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone : req.body.phone,
        passwordHash: req.body.passwordHash,
        isBusinessUser : req.body.isBusinessUser
    })

    user = await user.save();

    if(!user) 
        return res.status(500).send('The user cannot be created')
    res.send(user);
})
module.exports =router;