const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true
}));
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authroutes');
const workspaceRouter = require('./routes/workspace.routes');
const projectRouter = require('./routes/project.routes');
const taskRouter = require('./routes/taskroutes');
const connectDB = require('./config/db');
connectDB();

// // Log all incoming requests
// app.use((req, res, next) => {
//     console.log(`\n=== Incoming Request ===`);
//     console.log(`${req.method} ${req.url}`);
//     console.log('Content-Type:', req.headers['content-type']);
// //     next();
// });

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',authRouter);
app.use('/api/workspace',workspaceRouter);
app.use('/api/project',projectRouter);
app.use('/api/task',taskRouter);
// app.get('/',(req,res)=>{
//     res.status(200).json({message:"hello there we re starting with our new project and we will finish this and will learn a lot from it and after this we will be a better developer"})
// })
module.exports = app;