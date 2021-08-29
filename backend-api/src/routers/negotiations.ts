import { Company, Demand, Negotiation } from '@prisma/client';
import { djv } from 'djv';
import express from 'express';
import {
  getNegotiationByID, getDemandByID, getCompanyByUUID,
  updateNegotiation, updateDemand, getNegotiationForListing,
  getNegotiationsWithFilter, createNotification,
} from '../../prisma/seed';
import { DemandStatus, NegotiationStatus } from '../constants';
import Router from '../router';
import { isUserLoggedIn, validateSchema } from '../utils';

/**
 * + PUT /negotiation -> Update negotiation informations (status or price)
 * + GET /negotiation -> List opened demands (with messages)
 */

class NegotiationsRouter extends Router {
  private schemaValidator: djv;

  constructor(schemaValidator: djv) {
    super();

    this.schemaValidator = schemaValidator;

    this.router.options('*', (req, res): void => {
      this.setHeader(req, res, 'GET,PUT,POST,DELETE');
      res.status(200).end();
    });

    this.put('/', (req: express.Request, res: express.Response):
    Promise<void> => this.updateNegotiation(req, res));
    this.get('/', (req: express.Request, res: express.Response):
    Promise<void> => this.getNegotiations(req, res));
  }

  private updateNegotiation = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'updateNegotiationSchema', this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }

    if ('status' in req?.body && 'price' in req?.body) {
      res.status(500).json({ desc: 'You can not update two parameters at once.' });
      return;
    }

    const negot: Negotiation | null = await getNegotiationByID(req?.body?.negotiationUUID);
    if (negot == null) {
      res.status(404).json({ desc: 'Selected negotiation does not exist.' });
      return;
    }

    if (negot.status !== NegotiationStatus.OPEN) {
      res.status(404).json({ desc: 'You can manipulate only with opened negotiations.' });
      return;
    }

    const demand: Demand | null = await getDemandByID(negot.demand_uuid);
    const company: Company | null = await getCompanyByUUID(negot.company_uuid);

    if (demand == null || company == null) {
      res.status(500).json({ desc: 'Listing for demand & company was invalid.' });
      return;
    }

    if ('status' in req?.body) {
      if (demand?.status !== DemandStatus.OPEN) {
        res.status(401).json({ desc: 'You can not update already closed demand.' });
        return;
      }

      if (demand?.creator_uuid !== (<express.Request & { user: string }>req)?.user) {
        res.status(401).json({ desc: 'You do not have permissions to edit status.' });
        return;
      }

      if (req?.body?.status !== NegotiationStatus.REJECTED
        && req?.body?.status !== NegotiationStatus.APPROVED) {
        res.status(500).json({ desc: 'Selected status is invalid.' });
        return;
      }

      await updateNegotiation({ status: req?.body?.status }, negot.uuid);

      if (req?.body?.status === NegotiationStatus.APPROVED) {
        await updateDemand({ status: DemandStatus.CLOSED }, negot.demand_uuid);
      }

      const allSimularDemands: Negotiation[] = await getNegotiationsWithFilter({
        demand_uuid: demand.uuid,
        status: NegotiationStatus.OPEN,
      });

      await Promise.all(allSimularDemands.map(async (negotTemp: Negotiation) => {
        await updateNegotiation({ status: NegotiationStatus.REJECTED }, negotTemp.uuid);
      }));

      await createNotification(company.user_uuid,
        `Negotation status for demand '${demand?.name}' was updated to '${req?.body?.status}'.`);
      res.status(200).json({ info: 'Update was successful. (by owner)' });
      return;
    }

    if ('price' in req?.body) {
      if (company?.user_uuid !== (<express.Request & { user: string }>req)?.user) {
        res.status(401).json({
          desc: 'Price can be suggested only by company, permission error.',
        });
        return;
      }

      if (req?.body?.price < 0) {
        res.status(500).json({ desc: 'Sorry, but your price is too low.' });
        return;
      }

      await updateNegotiation({ price: req?.body?.price }, negot.uuid);
      await createNotification(demand.creator_uuid,
        `Price for demand '${demand?.name}' was updated to: ${req?.body?.price}€.`);
      res.status(200).json({ info: 'Update was successful (by company).' });
      return;
    }

    res.status(500).json({ desc: 'Was not able to find arguments to update.' });
  };

  private getNegotiations = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    res.status(200).json({
      negotiations: await getNegotiationForListing((<express.Request & { user: string }>req)?.user),
    });
  };
}
export default NegotiationsRouter;
