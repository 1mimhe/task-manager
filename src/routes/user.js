const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

// GET /users?pageSize=&pageNumber=
// default: pageSize=5, pageNumber=1
router.get('/', auth, admin, async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 5;
        const pageNumber = Number(req.query.pageNumber) || 1;

        const users = await User.find({})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        if (!users)
            res.status(404).send();

        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/:id', auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user)
            res.status(404).send();

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/:id', auth, admin, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'birthdate', 'isAdmin'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
        res.status(400).send(new Error('Invalid update!'));

    try {
        const result = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.send(_.omit(result, ['password']));
    } catch (e) {
        res.status(500).send(e);
    }
});

// req.body:
/*
    {
        "name": ...
        "email": ...
        "password": {
            "old": ...
            "new": ...
        }
        "birthdate": ...
    }
 */
router.patch('/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'birthdate'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send(new Error('Invalid update!'));

    const isCorrectOldPassword = bcrypt.compare(req.user.password, req.body.password.old);
    if (req.body.password.old && !isCorrectOldPassword)
        return res.status(400).send('Incorrect old password.');
    req.body.password = req.body.password.new;

    try {
        const result = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
        res.send(_.omit(result, ['password']));
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user)
            res.status(404).send();

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/me', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user)
            res.status(404).send();

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;