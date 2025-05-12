import { body,validationResult } from 'express-validator';

const signupValidation = [
    body('name')
        .isLength({min:4})
        .withMessage('Name must be minimum 4 characters in length.'),
        
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    
    body('mobile')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Invalid phone number. Must be 10 digits starting with 6.'),

    body('password')
        .isLength({min:8})
        .withMessage('Password must be atleast 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must include atleast one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must include atleast one lowercase letter')
        .matches(/\d/)
        .withMessage('Password must include atleast one number')
        .matches(/[!@#$%^&*(),.?:{}|<>]/)
        .withMessage('Password must include atleast one special character'),

    body('confirmPassword')
        .custom((value,{req})=> value ===req.body.password)
        .withMessage('Passwords do not match'),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

export default signupValidation;