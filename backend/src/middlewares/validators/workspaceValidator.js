const { body, param } = require('express-validator');

exports.createWorkspaceValidator = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Workspace name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];

exports.addMemberToWorkspaceValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('newUserId').isMongoId().withMessage('Invalid user ID'),
    body('role')
        .trim()
        .isIn(['admin', 'member']) // Assuming 'owner' is not assignable this way, adjust if needed
        .withMessage('Invalid role')
];

exports.workspaceParamsValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID')
];
