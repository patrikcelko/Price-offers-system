import { Company, Demand, Negotiation } from '@prisma/client';
import { djv } from 'djv';
import express from 'express';
import {
  createMessage, getCompanyByUUID, getNegotiationByID, getDemandByID, createNotification,
} from '../../prisma/seed';
import Router from '../router';
import { isUserLoggedIn, validateSchema } from '../utils';
import { NegotiationStatus } from '../constants';

/**
 * - POST /message -> React in negotiation / Send message
 */

class MessagesRouter extends Router {
  private schemaValidator: djv;

  constructor(schemaValidator: djv) {
    super();

    this.schemaValidator = schemaValidator;

    this.router.options('*', (req, res): void => {
      this.setHeader(req, res, 'GET,PUT,POST,DELETE');
      res.status(200).end();
    });

    this.post('/', (req: express.Request, res: express.Response): Promise<void> => this.sendMessage(req, res));
  }

  private sendMessage = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'messageSchema', this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const negotation: Negotiation | null = await getNegotiationByID(req?.body?.negotiationID);
    if (negotation == null) {
      res.status(404).json({ desc: 'Negotation was not found.' });
      return;
    }

    if (negotation.status === NegotiationStatus.REJECTED) {
      res.status(404).json({ desc: 'Sorry, but this conversation is already closed.' });
      return;
    }

    await createMessage(req?.body?.message, negotation.uuid,
      (<express.Request & { user: string }>req)?.user);
    const company: Company | null = await getCompanyByUUID(negotation.company_uuid);
    const demand: Demand | null = await getDemandByID(negotation.demand_uuid);

    if (company == null || demand == null) {
      res.status(500).json({ desc: 'Was not able to load company or demand.' });
      return;
    }

    if (company.user_uuid === (<express.Request & { user: string }>req)?.user) {
      await createNotification(demand.creator_uuid, `You have new message for your demand '${demand.name}'.`);
    }

    if (demand.creator_uuid === (<express.Request & { user: string }>req)?.user) {
      await createNotification(company.user_uuid, `You recieved company message aboud demand '${demand.name}'.`);
    }

    res.status(200).json({ info: 'Message was successfully created.' });
  };
}
export default MessagesRouter;
