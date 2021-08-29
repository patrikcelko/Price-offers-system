import express from 'express';
import jwt from 'jsonwebtoken';
import constants from './env';
import { killDatabaseConn } from '../prisma/seed';

class Router {
  #router = express.Router();

  public get router() {
    return this.#router;
  }

  public setHeader = (req: express.Request, res: express.Response, methods: string): void => {
    res?.header('Access-Control-Allow-Origin', req.headers.origin);
    res?.header('Access-Control-Allow-Methods', methods);
    res?.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res?.header('Access-Control-Allow-Credentials', 'true');
  };

  private errorCatcher = (fn: (req: express.Request, res: express.Response,
    next: () => void) => Promise<void>) => async (req: express.Request,
    res: express.Response, next: () => void): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (e) {
      res.status(500);
      await killDatabaseConn();
    }
  };

  private middleware = () => (req: express.Request, res: express.Response,
    next: () => void): void => {
    if (req.get('Authorization')) {
      const token: string | undefined = req?.get('Authorization')?.substring('Bearer '.length);

      if (token === undefined) {
        res.status(500).json({ desc: 'Unknown header.' });
      } else {
        try {
          const decoded: { uuid: string } | string | object = jwt
            .verify(<string>token, constants.jwtKey);
          (<express.Request & { user: string }>req).user = (<{ id: string }>decoded)?.id;
        } catch (e) {
          res.status(500).json({ desc: 'Failed to decode header.', message: e.message });
        }
      }
    }
    next();
  };

  public get = (path: string, fn: (arg0: express.Request, arg1: express.Response,
    arg2: () => void) => Promise<void>) => this.router.get(
    path,
    express.json(),
    this.middleware(),
    this.errorCatcher(async (req: express.Request, res: express.Response,
      next: () => void) => {
      this.setHeader(req, res, 'GET');
      await fn(req, res, next);
    }),
  );

  public post = (path: string, fn: (arg0: express.Request, arg1: express.Response,
    arg2: () => void) => Promise<void>) => this.router.post(
    path,
    express.json(),
    this.middleware(),
    this.errorCatcher(async (req: express.Request, res: express.Response,
      next: () => void): Promise<void> => {
      this.setHeader(req, res, 'POST');
      await fn(req, res, next);
    }),
  );

  public put = (path: string, fn: (arg0: express.Request, arg1: express.Response,
    arg2: () => void) => Promise<void>) => this.router.put(
    path,
    express.json(),
    this.middleware(),
    this.errorCatcher(async (req: express.Request, res: express.Response,
      next: () => void): Promise<void> => {
      this.setHeader(req, res, 'PUT');
      await fn(req, res, next);
    }),
  );

  public delete = (path: string, fn: (arg0: express.Request, arg1: express.Response,
    arg2: () => void) => Promise<void>) => this.router.delete(
    path,
    express.json(),
    this.middleware(),
    this.errorCatcher(async (req: express.Request, res: express.Response,
      next: () => void): Promise<void> => {
      this.setHeader(req, res, 'DELETE');
      await fn(req, res, next);
    }),
  );
}

export default Router;
