import { body,validationResult } from 'express-validator';

const babyValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('age')
    .isInt({ min: 0, max: 5 })
    .withMessage('Age must be a number ≤ 5'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile')
    .isMobilePhone()
    .withMessage('Valid mobile number is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
];

export {
    babyValidationRules
};