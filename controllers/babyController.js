import Baby from '../models/Baby.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import participantConfirmationTemplate from '../templates/participantConfirmationTemplate.js';

dotenv.config();

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

  // Check for existing email 
  const emailExists = await Baby.findOne({ email });
  if (emailExists) {
    return res.status(400).send({ message: 'Email already exists' });
  }

  // Check for existing mobile 
  const mobileExists = await Baby.findOne({ mobile });
  if (mobileExists) {
    return res.status(400).send({ message: 'Mobile already exists' });
  }

  if (!req.file) {
    return res.status(400).send({ message: 'Baby image is required' });
  }

  // Save to DB only after email success

  // Construct full image URL
  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
  const babyCode = await generateBabyCode();

  const newBaby = new Baby({
    firstName,
    lastName,
    age,
    email,
    mobile,
    imageUrl, // Save full URL
    babyCode,
  });

  await newBaby.save();
  logger.info(`New baby registered: ${email}`);

        
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
      to: newBaby.email,
      subject: 'Welcome to Week of the Baby Contest!',
      html: participantConfirmationTemplate(newBaby.firstName)
      };
  
      try {
        await transporter.sendMail(mailOptions);
        logger.info(`Winner email sent to ${newBaby.email}`);
      } catch (emailErr) {
        logger.error(`Failed to send participant email: ${emailErr.message}`);
      }
  res.status(201).send({ message: 'Registration successful and saved' });
};

export {
  registerBaby,
  generateBabyCode
};