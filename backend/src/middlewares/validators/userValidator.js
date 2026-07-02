const { body } = require('express-validator');

exports.getUserByEmailValidator = [
    body('email')
        .trim()
        .isEmail()
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .withMessage('Valid email is required')
];

exports.updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
];
