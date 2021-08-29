import express from 'express';
import crypto from 'crypto';

export const isNumeric = (value: string): boolean => /^\d+$/.test(value);

export const validateSchema = async (req: express.Request, res: express.Response,
  schemaName: string | null, schemaValidator: any): Promise<boolean> => {
  if (schemaName == null) {
    return true;
  }
  const validatorResult = await schemaValidator.validate(schemaName, req?.body);
  if (validatorResult) {
    res.status(500).json({
      desc: 'Invalid input value.',
      schemaValidatorOut: validatorResult,
    });
    return false;
  }
  return true;
};

export const isUserLoggedIn = async (req: express.Request,
  res: express.Response): Promise<boolean> => {
  if ((<express.Request & { user: string }>req).user != null) {
    return true;
  }
  res.status(401).json({ desc: 'User was not found, permission error.' });
  return false;
};

export const generateSalt = (): string => crypto.randomBytes(8).toString('hex');

export const hashPassword = async (password: string, salt: string,
  method = 'sha1'): Promise<string> => new Promise((res, rej) => {
  try {
    crypto.pbkdf2(password, salt, 1000, 256, method, (err, p) => {
      if (err) {
        console.error('Failure hashing password:', err.message);
        throw new Error('Failed to hash password');
      }
      res(p.toString('hex'));
    });
  } catch (e) {
    console.error('Failure hashing password, rejecting:', e.message);
    rej(new Error('Password hash failed'));
    throw e;
  }
});
