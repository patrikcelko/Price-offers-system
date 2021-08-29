import { djv } from 'djv';
import express from 'express';
import { Notifications, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import {
  createNotification, deleteNotification, getNotificationByID,
  getUserByEmail, getUserById, getUserNotifications, updateProfile,
  createUser, isEmailAlreadyUsed,
} from '../../prisma/seed';

import Router from '../router';
import {
  generateSalt, hashPassword, isUserLoggedIn, validateSchema,
} from '../utils';
import constants from '../env';

/**
 * + PUT /user -> Login user based on email and password
 * + DELETE /user -> Logout user (login by email)
 * + POST /user -> Register (email and password, name)
 * + GET /user/notifications -> Get all notifications for user
 * + DELETE /user/notifications/:notificationID
 * + GET /user -> Get user data (verify login)
 * + PUT /user/profile -> Update profile information
 */

class UsersRouter extends Router {
  private schemaValidator: djv;

  constructor(schemaValidator: djv) {
    super();

    this.schemaValidator = schemaValidator;

    this.router.options('*', (req, res): void => {
      this.setHeader(req, res, 'GET,PUT,POST,DELETE');
      res.status(200).end();
    });

    this.put('/profile', (req: express.Request, res: express.Response): Promise<void> => this.updateProfile(req, res));
    this.put('/', (req: express.Request, res: express.Response): Promise<void> => this.login(req, res));
    this.post('/', (req: express.Request, res: express.Response): Promise<void> => this.register(req, res));
    this.delete('/', (req: express.Request, res: express.Response): Promise<void> => this.logout(req, res));
    this.get('/notifications', (req: express.Request,
      res: express.Response): Promise<void> => this.listnNotifications(req, res));
    this.delete('/notifications/:notificationID([a-z0-9_-]+)', (req: express.Request,
      res: express.Response): Promise<void> => this.deleteNotification(req, res));
    this.get('/', (req: express.Request, res: express.Response): Promise<void> => this.verify(req, res));
  }

  private deleteNotification = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const notification: Notifications | null = await getNotificationByID(
      req?.params?.notificationID,
    );
    if (notification == null) {
      res.status(404).json({ desc: 'Notification was not found.' });
      return;
    }

    if (notification.user_uuid !== (<express.Request & { user: string }>req)?.user) {
      res.status(404).json({ desc: 'Permission error, this notification does not belong to you.' });
      return;
    }

    await deleteNotification(notification.uuid);
    res.status(200).json({ info: 'Notification was successfully deleted.' });
  };

  private login = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'loginUserSchema', this.schemaValidator)) {
      return;
    }

    const wholeUser: User | null = await getUserByEmail(req?.body?.email);
    let hashValue: string;
    if (wholeUser == null) {
      res.status(404).json({ desc: 'User was not found.' });
      return;
    }

    try {
      hashValue = await hashPassword(req?.body?.password, wholeUser?.salt);
    } catch (e) {
      res.status(500).json({ desc: 'Was not able to create hash value.' });
      return;
    }

    if (hashValue !== wholeUser?.password_hash) {
      res.status(401).json({ desc: 'Invalid credentials.' });
      return;
    }

    const userToken: { token: string } = {
      token: jwt.sign({ id: wholeUser.uuid }, constants.jwtKey, { expiresIn: 10000 }),
    };

    res.cookie('token', userToken?.token, { maxAge: 10000, httpOnly: false }).status(200).json(userToken);
  };

  private register = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'registerUserSchema', this.schemaValidator)) {
      return;
    }

    if (!(await isEmailAlreadyUsed(req?.body?.email))) {
      res.status(500).json({ desc: 'Used email is already registered.' });
      return;
    }

    const salt: string = generateSalt();
    let hash: string;

    try {
      hash = await hashPassword(req?.body?.password, salt);
    } catch (e) {
      res.status(500).json({ desc: 'Was not able create hash value.' });
      return;
    }

    const user: User = await createUser(req?.body?.name, req?.body?.email, hash, salt);
    await createNotification(user.uuid, 'Thank you for registration. Your account is ready to use.');
    res.status(200).json({ info: 'User was successfully registered.' });
  };

  private logout = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    res.clearCookie('token').status(200).json({ info: 'User was successfully logged out.' });
  };

  private verify = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    const user: User | null = await getUserById((<express.Request & { user: string }>req)?.user);
    if (user == null) {
      res.status(500).json({ desc: 'You do not have permissions for this.' });
      return;
    }

    res.status(200).json({
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      entry_date: user.entry_date,
    });
  };

  private updateProfile = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'updateUserSchema', this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const user: User | null = await getUserById((<express.Request & { user: string }>req)?.user);
    if (user == null) {
      res.status(500).json({ desc: 'Invalid user.' });
      return;
    }

    if ((!('oldPassword' in req?.body) && 'newPassword' in req?.body) || ('oldPassword' in req?.body && !('newPassword' in req?.body))) {
      res.status(500).json({ desc: 'Password pair not found.' });
      return;
    }

    if ('oldPassword' in req?.body && req?.body?.oldPassword === req?.body?.newPassword) {
      res.status(500).json({ desc: 'Old password is same as new one.' });
      return;
    }
    const salt: string = generateSalt();
    let newHash: string = '';
    let oldHash: string = '';

    if ('oldPassword' in req?.body) {
      try {
        oldHash = await hashPassword(req?.body?.oldPassword, user?.salt);
        newHash = await hashPassword(req?.body?.newPassword, salt);
      } catch (e) {
        res.status(500).json({ desc: 'Was not able to create hash value.' });
        return;
      }

      if (oldHash !== user?.password_hash) {
        res.status(401).json({ desc: 'Invalid old password.' });
        return;
      }
    }

    const toUpdate: { salt: string, password_hash: string, name: string } = {
      salt: ('oldPassword' in req?.body) ? salt : user?.salt,
      password_hash: ('oldPassword' in req?.body) ? newHash : user?.password_hash,
      name: ('name' in req?.body) ? req?.body?.name : user?.name,
    };

    if ('oldPassword' in req?.body) {
      res.clearCookie('token');
    }

    await updateProfile(toUpdate, (<express.Request & { user: string }>req)?.user);
    res.status(200).json({ info: 'User profile was successfully updated.' });
  };

  private listnNotifications = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    const rawNotifications: Notifications[] = await getUserNotifications(
      (<express.Request & { user: string }>req)?.user,
    );
    res.status(200).json({
      notifications: rawNotifications,
    });
  };
}
export default UsersRouter;
