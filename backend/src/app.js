const express = require('express');
const cors = require('cors');
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no Origin header (e.g. curl/Postman) and known frontend URLs.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authroutes');
const workspaceRouter = require('./routes/workspace.routes');
const projectRouter = require('./routes/project.routes');
const taskRouter = require('./routes/taskroutes');
const userRouter = require('./routes/user.routes');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
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
app.use('/api/user',userRouter);
// app.get('/',(req,res)=>{
//     res.status(200).json({message:"hello there we re starting with our new project and we will finish this and will learn a lot from it and after this we will be a better developer"})
// })

// Global error handler should be the last middleware
app.use(errorHandler);

module.exports = app;