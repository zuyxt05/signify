// Input validation middleware
// Simple validation without external dependencies

/**
 * Creates a validation middleware for request body fields
 * @param {Object} rules - Validation rules { fieldName: { required, type, minLength, maxLength, pattern, message } }
 */
export const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rule] of Object.entries(rules)) {
            const value = req.body[field];

            // Required check
            if (rule.required && (value === undefined || value === null || value === "")) {
                errors.push(rule.message || `${field} is required`);
                continue;
            }

            // Skip further checks if value is optional and not provided
            if (value === undefined || value === null || value === "") continue;

            // Type check
            if (rule.type === "string" && typeof value !== "string") {
                errors.push(`${field} must be a string`);
                continue;
            }
            if (rule.type === "number" && typeof value !== "number" && isNaN(Number(value))) {
                errors.push(`${field} must be a number`);
                continue;
            }
            if (rule.type === "boolean" && typeof value !== "boolean") {
                errors.push(`${field} must be a boolean`);
                continue;
            }

            const strValue = String(value);

            // Min length
            if (rule.minLength && strValue.length < rule.minLength) {
                errors.push(`${field} must be at least ${rule.minLength} characters`);
            }

            // Max length
            if (rule.maxLength && strValue.length > rule.maxLength) {
                errors.push(`${field} must be at most ${rule.maxLength} characters`);
            }

            // Pattern (regex)
            if (rule.pattern && !rule.pattern.test(strValue)) {
                errors.push(rule.message || `${field} has invalid format`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    };
};

// Predefined validation rules
export const authValidation = {
    signup: validate({
        name: {
            required: true,
            type: "string",
            minLength: 2,
            maxLength: 50,
            message: "Name is required (2-50 characters)"
        },
        email: {
            required: true,
            type: "string",
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Valid email is required"
        },
        password: {
            required: true,
            type: "string",
            minLength: 6,
            maxLength: 128,
            message: "Password is required (minimum 6 characters)"
        },
    }),
    login: validate({
        email: {
            required: true,
            type: "string",
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Valid email is required"
        },
        password: {
            required: true,
            type: "string",
            message: "Password is required"
        },
    }),
};

export const meetingValidation = {
    create: validate({
        meetingCode: {
            required: true,
            type: "string",
            minLength: 3,
            maxLength: 20,
            message: "Meeting code is required (3-20 characters)"
        },
        date: {
            required: true,
            type: "string",
            pattern: /^\d{4}-\d{2}-\d{2}$/,
            message: "Valid date is required (YYYY-MM-DD)"
        },
        time: {
            required: true,
            type: "string",
            pattern: /^\d{2}:\d{2}(:\d{2})?$/,
            message: "Valid time is required (HH:MM)"
        },
        host: {
            required: true,
            type: "string",
            message: "Host user ID is required"
        },
    }),
};

export const messageValidation = {
    send: validate({
        senderId: {
            required: true,
            type: "string",
            message: "Sender ID is required"
        },
        meetingId: {
            required: true,
            type: "string",
            message: "Meeting ID is required"
        },
        text: {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 5000,
            message: "Message text is required (max 5000 characters)"
        },
    }),
};
