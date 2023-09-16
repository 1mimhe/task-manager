const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send('User already registered.');

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });

        const result = await user.save();
        res.status(201).send(result);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        if (!users)
            res.status(404).send();

        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user)
            res.status(404).send();

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/:id', async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'birthdate'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
        res.status(400).send(new Error('Invalid update!'));

    try {
        const result = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        res.send(result);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user)
            res.status(404).send();

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;