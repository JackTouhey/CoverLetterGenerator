export const roleSchema = {
    type: 'object',
    properties: {
        companyName: { type: 'string' },
        url: { type: 'string' },
        description: { type: 'string' },
        coverLetter: { type: 'string' }
    },
    required: ['companyName', 'url', 'description'],
    additionalProperties: false
};

export const wrappedRolesSchema = {
    type: 'object',
    properties: {
        roles: { type: 'array', items: roleSchema, minItems: 1 }
    },
    required: ['roles'],
    additionalProperties: false
};