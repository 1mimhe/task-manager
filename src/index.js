const express = require('express');
const app = express();
require('dotenv').config();
require('./db/mongoose');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRouter);
app.use('tasks', taskRouter);

app.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}...`);
});