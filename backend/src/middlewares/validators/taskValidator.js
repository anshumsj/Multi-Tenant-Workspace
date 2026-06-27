const { body, param } = require('express-validator');

exports.createTaskValidator = [
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Task name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('assignees')
        .optional()
        .isArray().withMessage('Assignees must be an array')
        .custom((value) => {
            for (let id of value) {
                if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Invalid assignee ID');
                }
            }
            return true;
        }),
    body('deadline').optional().isISO8601().toDate().withMessage('Invalid deadline date')
];

exports.updateTaskValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Task name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('status')
        .optional()
        .trim()
        .isIn(['todo', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
    body('assignees')
        .optional()
        .isArray().withMessage('Assignees must be an array')
        .custom((value) => {
            for (let id of value) {
                if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Invalid assignee ID');
                }
            }
            return true;
        }),
    body('deadline').optional().isISO8601().toDate().withMessage('Invalid deadline date')
];

exports.addCommentValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment cannot be empty')
        .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters')
];

exports.taskParamsValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    param('projectId').isMongoId().withMessage('Invalid project ID'),
    param('taskId').isMongoId().withMessage('Invalid task ID')
];

exports.projectTaskParamsValidator = [
    param('workspaceId').isMongoId().withMessage('Invalid workspace ID'),
    param('projectId').isMongoId().withMessage('Invalid project ID')
];
