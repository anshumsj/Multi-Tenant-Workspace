const { body, param } = require('express-validator');

exports.createProjectValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Project name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('projectLead')
        .optional()
        .isMongoId()
        .withMessage('Invalid project lead ID')
];

exports.updateProjectValidator = [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Project name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
];

exports.changeProjectLeadValidator = [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('newProjectLead').isMongoId().withMessage('Invalid new project lead ID'),
    body('reason').optional().trim()
];

exports.addMemberToProjectValidator = [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('newMemberId').isMongoId().withMessage('Invalid new member ID')
];

exports.projectParamsValidator = [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID')
];
