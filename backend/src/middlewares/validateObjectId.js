const mongoose = require('mongoose');

const validateObjectId = (req, res, next, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false,
            message: `Invalid ObjectId format: ${id}` 
        });
    }
    next();
};

module.exports = validateObjectId;
