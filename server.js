import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import babyRoutes from './routes/babyRoutes.js';
import voterRoutes from './routes/voterRoutes.js';
import winnerRoutes from './routes/winnerRoutes.js';
import logger from './utils/logger.js';

dotenv.config();
const app = express();
app.use(express.json()); // Accept JSON raw input

//connection with database
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    logger.info("MongoDB Connected and running Successfully")
})
.catch((err)=>{
    logger.error(err)
});

app.use('/baby', babyRoutes);
app.use('/voter',voterRoutes);
app.use('/winner',winnerRoutes);

// Serve uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    logger.info(`Server started and running at ${PORT}`);
});