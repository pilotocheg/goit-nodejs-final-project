import crypto from 'crypto';

export const generateUUID = () => {
    return crypto.randomBytes(18).toString('base64').replace(/\+/g, '0').replace(/\//g, '0').slice(0, 24);
}