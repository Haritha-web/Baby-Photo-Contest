import { fileURLToPath } from 'url';
import path from 'path';
import Baby from '../models/Baby.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import ejs from 'ejs';

dotenv.config();

// Define __dirname at top-level
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateBabyCode = async () => {
  const lastBaby = await Baby.findOne().sort({ _id: -1 });

  let nextNumber = 1;
  if (lastBaby && lastBaby.babyCode) {
    const lastNumber = parseInt(lastBaby.babyCode.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  return `BABY-${String(nextNumber).padStart(4, '0')}`;
};

const registerBaby = async (req, res) => {
  const { firstName, lastName, age, email, mobile } = req.body;

  try {
    // Check for duplicates
    const emailExists = await Baby.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await Baby.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile already exists' });

    if (!req.file) return res.status(400).send({ message: 'Baby image is required' });

    const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    const babyCode = await generateBabyCode();

    const newBaby = new Baby({
      firstName,
      lastName,
      age,
      email,
      mobile,
      imageUrl,
      babyCode,
    });

    await newBaby.save();
    logger.info(`New baby registered: ${email}`);

    // Render EJS email template
    const templatePath = path.join(__dirname, '../templates/participationConfirmationTemplate.ejs');
    let html;
    try {
      html = await ejs.renderFile(templatePath, { firstName: newBaby.firstName });
    } catch (templateError) {
      logger.error(`EJS rendering error: ${templateError.message}`);
      return res.status(500).send({ message: 'Template rendering error' });
    }

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newBaby.email,
      subject: 'Welcome to Week of the Baby Contest!',
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Participant confirmation email sent to ${newBaby.email}`);
    } catch (emailError) {
      logger.error(`Failed to send participant email: ${emailError.message}`);
    }

    // Final response
    res.status(201).send({ message: 'Registration successful and saved' });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).send({ message: 'Server error during registration' });
  }
};

export {
  registerBaby,
  generateBabyCode,
};
