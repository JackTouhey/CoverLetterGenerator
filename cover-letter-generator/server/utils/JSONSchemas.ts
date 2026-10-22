export const roleSchema = {
    type: 'object',
    properties: {
        companyName: { type: 'string' },
        url: { type: 'string' },
        description: { type: 'string' }
    },
    required: ['companyName', 'url', 'description'],
    additionalProperties: false
};