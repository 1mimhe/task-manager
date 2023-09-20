const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const upload = require('../middlewares/upload');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const sharp = require('sharp');

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

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.get('/me/avatar', auth, async (req, res) => {
    if (!req.user.avatar) {
        return res.status(404).send('Avatar not found.');
    }

    res.set('Content-Type', 'image/png');
    res.send(req.user.avatar);
});

router.get('/:id/avatar', auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('User not found with this id.');
        }

        if (!user.avatar) {
            return res.status(404).send('User\'s avatar not found.');
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(400).send();
    }
});

router.patch('/:id', auth, admin, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'birthdate', 'isAdmin'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
        res.status(400).send(new Error('Invalid update!'));

    try {
        const result = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
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

    for (const field in req.body) {
        req.user[field] = req.body[field];
    }

    try {
        const result = await req.user.save();
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
        const user = await req.user.remove();
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;