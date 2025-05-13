import { fileURLToPath } from "url";
import path from 'path';
import Baby from "../models/Baby.js";
import dayjs from "dayjs";
import logger from '../utils/logger.js';
import dotEnv from 'dotenv';
import nodemailer from 'nodemailer';
import ejs from 'ejs';

dotEnv.config();

const getWeeklyParticipants = async (req, res) => {
    const startOfWeek = dayjs().startOf('week').add(1, 'day');
    const endOfWeek = dayjs().startOf('week').add(6, 'day').endOf('day');

    try {
      const babies = await Baby.find({
        createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
      });
  
      res.status(200).send(babies);
    } catch (err) {
      logger.error(`Error fetching weekly participants: ${err.message}`);
      res.status(500).send({ message: 'Server Error' });
    }
};

const getWeeklyVoters = async (req, res) => {
    const startOfWeek = dayjs().startOf('week').add(1, 'day');
    const endOfWeek = dayjs().startOf('week').add(6, 'day').endOf('day');
  
    try {
      const babies = await Baby.find({
        createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
      }).populate('voters.voterId', 'name email mobile');
  
      const allVoters = babies.flatMap(b => b.voters.map(v => ({
        babyCode: b.babyCode,
        name: v.voterId.name,
        email: v.voterId.email,
        mobile: v.voterId.mobile,
        votedAt: v.timestamp
      })));
  
      res.status(200).send(allVoters);
    } catch (err) {
      logger.error(`Error fetching weekly voters: ${err.message}`);
      res.status(500).send({ message: 'Server Error' });
    }
  };
  
  const declareWeeklyWinner = async (req, res) => {
    const startOfWeek = dayjs().startOf('week').add(1, 'day');
    const endOfWeek = dayjs().startOf('week').add(6, 'day').endOf('day');
  
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    try {
      const topBabies = await Baby.find({
        createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
      }).sort({ votes: -1 }).limit(3);
  
      if (topBabies.length === 0) {
        logger.warn('No participants found this week.');
        return res.status(404).send({ message: 'No participants this week.' });
      }
  
      const winnerIndex = Math.floor(Math.random() * topBabies.length);
      const winner = topBabies[winnerIndex];
  
      logger.info(`Winner selected: ${winner.firstName} ${winner.lastName} (${winner.babyCode})`);
  
      // Render EJS Template
      const templatePath = path.join(__dirname, '../templates/winnerEmailTemplate.ejs');
      let html;
      try {
        html = await ejs.renderFile(templatePath, { firstName: winner.firstName });
      } catch (templateError) {
        logger.error(`EJS rendering error: ${templateError.message}`);
        return res.status(500).send({ message: 'Template rendering error' });
      }
      
      // Send Email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: winner.email,
        subject: 'Congratulations! You are this week’s winner 🎉',
        html
      };
  
      try {
        await transporter.sendMail(mailOptions);
        logger.info(`Winner email sent to ${winner.email}`);
      } catch (emailError) {
        logger.error(`Failed to send winner email: ${emailError.message}`);
      }
  
      res.status(200).send({
        message: 'Winner declared',
        winner: {
          babyCode: winner.babyCode,
          name: `${winner.firstName} ${winner.lastName}`,
          email: winner.email
        }
      });
    } catch (err) {
      logger.error(`Error declaring winner: ${err.message}`);
      res.status(500).send({ message: 'Server Error' });
    }
  };
  
  export {
    getWeeklyParticipants,
    getWeeklyVoters,
    declareWeeklyWinner
  };