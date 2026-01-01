/**
 * Validation middleware factory using Zod schemas
 * @param {Object} schema - Zod schema to validate against
 * @param {string} source - 'body', 'params', or 'query'
 */
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const result = schema.safeParse(data);

            if (!result.success) {
                const errors = result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            // Replace with validated & transformed data
            req[source] = result.data;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = validateRequest;
