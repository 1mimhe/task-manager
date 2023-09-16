const express = require('express');
const router = express.Router();
const User = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

router.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({email: req.body.email});
        if (user) return res.status(400).send('User already registered.');

        user = new User({...req.body});

        const result = await user.save();
        const token = user.generateAuthToken();
        res.header('X-Auth-Token', token).status(201).send(_.omit(result, ['password']));
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if (!user) return res.status(400).send('Invalid email or password.');

        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return res.status(400).send('Invalid email or password.');

        const token = user.generateAuthToken();
        res.header('X-Auth-Token', token).send(_.omit(user, ['password']));
    } catch (e) {
        res.status(500).send(e.message);
    }
});