const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);