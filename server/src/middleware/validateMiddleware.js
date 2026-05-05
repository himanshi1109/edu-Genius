import { validationResult } from 'express-validator';

/**
 * Middleware to handle express-validator validation results.
 * Place after validation chains in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
    return;
  }

  next();
};

export default validate;
