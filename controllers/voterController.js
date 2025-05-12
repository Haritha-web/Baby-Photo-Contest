import Voter from '../models/Voter.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'
import dayjs from 'dayjs'
import Baby from '../models/Baby.js'

const SECRET_KEY = process.env.JWT_SECRET || 'mysecret';

const register = async(req,res)=>{
  const {name,email,mobile,password,confirmPassword}=req.body;
  if(password !== confirmPassword){
    logger.warn(`Password mismatch for email:${email}`)
    return res.send(400).send({message:'Passwords do not match'})
  }
  try{
    const existingUser = await Voter.findOne({email});
    if(existingUser && existingUser.isVerified){
      logger.info(`User already exists: ${email}`);
      return res.status(400).send({message:'User already exists'});
    }
     const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = new Voter({
        name,
        email,
        mobile,
        password: hashedPassword
      });
      await newUser.save();
      logger.info(`User verified and registered: ${email}`);

      return res.status(200).send({ message: 'Registered successfully' });
    } catch(err) {
        return res.status(500).send({message:'Email already exists'});
    } 
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Voter.findOne({ email });
    if (!user) {
      logger.warn(`Login failed. User not found: ${email}`);
      return res.status(400).send({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h',
    });

    logger.info(`Login successful for user: ${email}`);

    res.send({ message: 'Login successful', token });
  } catch (err) {
    logger.error(`Login error for ${email}: ${err.message}`);
    return res.status(500).send({ error: 'Server error' });
  }
};

const voteBaby = async (req, res) => {
    const { babyCode } = req.body;
    const voterId = req.user.id; //Extracted from JWT by verifyToken middleware and convert string to ObjectId
    console.log(req.user);
  
    try {
      const today = dayjs();
      const dayOfWeek = today.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  
      if (dayOfWeek === 0) {
        return res.status(403).send({ message: 'Voting is not allowed on Sunday' });
      }
  
      const baby = await Baby.findOne({babyCode});
      if (!baby) {
        logger.warn(`Vote attempt failed:Baby not found for codr ${babyCode}`);
        return res.status(404).send({ message: 'Baby not found' });
      }
  
      // Check for last vote by this voter
      const lastVote = baby.voters.find(v => v.voterId.equals(voterId));
  
      if (lastVote && dayjs().diff(dayjs(lastVote.timestamp), 'minute') < 30) {
        return res.status(429).send({ message: 'You can vote again after 30 minutes' });
      }
  
    // Valid vote
    baby.votes += 1;

    // Replace or add
    const now = new Date();
    const existingVoterIndex = baby.voters.findIndex(v => v.voterId.equals(voterId));

    if (existingVoterIndex !== -1) {
    // Replace old timestamp
    baby.voters[existingVoterIndex].timestamp = now;
    } else {
    // First time vote
    baby.voters.push({ voterId, timestamp: now });
    }
  
    await baby.save();
    logger.info(`Vote recorded for baby: ${babyCode} by voter: ${voterId}`);
    res.status(200).send({ message: 'Vote recorded successfully' });
  
    } catch (error) {
      logger.error(error.message);
      console.log(error.message);
      
      res.status(500).send({ message: 'Internal Server Error' });
    }
};

const unvoteBaby = async (req, res) => {
  const { babyCode } = req.body;
  const voterId = req.user.id;

  try {
    const baby = await Baby.findOne({ babyCode });

    if (!baby) {
      logger.warn(`Unvote attempt failed: Baby not found for code ${babyCode}`);
      return res.status(404).send({ message: 'Baby not found' });
    }

    const voterIndex = baby.voters.findIndex(v => v.voterId.equals(voterId));

    if (voterIndex === -1) {
      return res.status(400).send({ message: 'You have not voted for this baby' });
    }

    // Remove the voter entry
    baby.voters.splice(voterIndex, 1);
    baby.votes = Math.max(baby.votes - 1, 0); // Ensure votes don't go below 0

    await baby.save();

    logger.info(`Unvote successful for baby: ${babyCode} by voter: ${voterId}`);
    return res.status(200).send({ message: 'Your vote has been removed' });

  } catch (error) {
    logger.error(`Error during unvote for ${babyCode}: ${error.message}`);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

const getVotersByBabyCode = async (req, res) => {
  const { babyCode } = req.body;

  try {
    // Find the baby using babyCode
    const baby = await Baby.findOne({ babyCode }).populate('voters.voterId', 'name email mobile');

    if (!baby) {
      logger.warn(`Baby not found for code: ${babyCode}`);
      return res.status(404).send({ message: 'Baby not found' });
    }

    // Format voters list
    const votersList = baby.voters.map(vote => ({
      voterId: vote.voterId._id,
      name: vote.voterId.name,
      email: vote.voterId.email,
      mobile: vote.voterId.mobile,
      timestamp: vote.timestamp,
    }));

    logger.info(`Fetched ${votersList.length} voters for babyCode: ${babyCode}`);
    return res.status(200).send({
      babyCode: baby.babyCode,
      babyName: `${baby.firstName} ${baby.lastName}`,
      voters: votersList,
    });

  } catch (err) {
    logger.error(`Error fetching voters for babyCode ${babyCode}: ${err.message}`);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

export {
    register,
    login,
    voteBaby,
    unvoteBaby,
    getVotersByBabyCode
};