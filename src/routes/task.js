const express = require('express');
const router = express.Router();
const Task = require('../models/task');

router.post('/', async (req, res) => {
    const newTask = new Task(req.body);

    try {
        const result = await newTask.save();
        res.status(201).send(result);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/', async (req, res) => {
   try {
       const tasks = await Task.find({});

       if (!tasks)
           res.status(404).send();

       res.send(tasks);
   } catch (e) {
       res.status(500).send(e);
   }
});

router.get('/:id', async (req, res) => {
   try {
       const task = await Task.findById(req.params.id);

       if (!task)
           res.status(404).send();

       res.send(task);
   } catch (e) {
       res.status(500).send(e);
   }
});

router.patch('/:id',  async (req, res) => {
    const allowedUpdates = ['description', 'completed', 'dueDate'];
    const isValidOperation = Object.keys(req.body).every((update) => allowedUpdates.includes(update));

    if (!isValidOperation)
        res.status(400).send(new Error('Invalid update!'));

    try {
        const result = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.send(result);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task)
            res.status(404).send();

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;