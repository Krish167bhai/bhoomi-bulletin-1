"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, _next) => {
    console.error('Error occurred:', err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
        });
    }
    if (err.name === 'UnauthorizedError' || err.message === 'Authentication failed') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
