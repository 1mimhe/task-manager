const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middlewares/auth');

router.post('/', auth, async (req, res) => {
    const newTask = new Task({ owner: req.user._id , ...req.body });

    try {
        const result = await newTask.save();
        res.status(201).send(result);
    } catch (e) {
        res.status(400).send(e);
    }
});

// GET /tasks?pageSize=&pageNumber=
// default: pageSize=5, pageNumber=1
router.get('/', auth, async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 5;
    const pageNumber = Number(req.query.pageNumber) || 1;

    try {
       const tasks = await req.user.populate({
               path: 'tasks',
               options: {
               skip: (pageNumber - 1) * pageSize,
               limit: pageSize
               }
           });

       if (!tasks.length)
           res.status(404).send();

       res.send(tasks);
   } catch (e) {
       res.status(500).send(e);
   }
});

router.get('/:id', auth, async (req, res) => {
   try {
       const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

       if (!task)
           res.status(404).send();

       res.send(task);
   } catch (e) {
       res.status(500).send(e);
   }
});

router.patch('/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'completed', 'dueDate'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
        res.status(400).send(new Error('Invalid update!'));

    try {
        const result = await Task.findByIdAndUpdate(req.params.id, { owner: req.user._id , ...req.body }, { new: true, runValidators: true });
        res.send(result);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task)
            res.status(404).send();

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;