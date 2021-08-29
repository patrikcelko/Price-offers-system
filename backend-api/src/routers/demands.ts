import { Company, Demand, User } from '@prisma/client';
import { djv } from 'djv';
import express from 'express';
import {
  getUserById, getDemandByID, updateDemand, getCompanyByUUID,
  createNegotation, revalidateAllDatesInDemand, getAllDemandsWithFilter,
  getNegotiationsWithFilter, createNotification, createDemand,
} from '../../prisma/seed';
import { DemandStatus, NegotiationStatus } from '../constants';

import Router from '../router';
import { validateSchema, isUserLoggedIn } from '../utils';

/**
 * + POST /demand -> Create demand
 * + DELETE /demand/:demandID -> Delete demand (owner only)
 * + GET /demand/me -> Get only my demands
 * + GET /demand -> Get all active demands
 * + PUT /demand -> Update demand informations
 * + POST /demand/negotation -> Create negotation/react
 */

class DemandsRouter extends Router {
  private schemaValidator: djv;

  constructor(schemaValidator: djv) {
    super();

    this.schemaValidator = schemaValidator;

    this.router.options('*', (req, res): void => {
      this.setHeader(req, res, 'GET,PUT,POST,DELETE');
      res.status(200).end();
    });

    this.post('/negotiation', (req: express.Request, res: express.Response):
    Promise<void> => this.createNegotation(req, res));
    this.post('/', (req: express.Request, res: express.Response):
    Promise<void> => this.createDemand(req, res));
    this.delete('/:demandID([a-z0-9_-]+)', (req: express.Request,
      res: express.Response): Promise<void> => this.deleteDemand(req, res));
    this.get('/me', (req: express.Request, res: express.Response):
    Promise<void> => this.listMeDemands(req, res));
    this.get('/', (req: express.Request, res: express.Response):
    Promise<void> => this.listAllDemands(req, res));
    this.put('/', (req: express.Request, res: express.Response):
    Promise<void> => this.updateDemand(req, res));
  }

  private createDemand = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'createDemandSchema', this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    if (req?.body?.budget <= 0) {
      res.status(500).json({ desc: 'Sorry, but your budget is too low.' });
      return;
    }

    if (new Date(req?.body?.until) < new Date()) {
      res.status(500).json({ desc: 'Sorry, but selected date is already expired.' });
      return;
    }

    const demand: Demand = await createDemand(req?.body?.name,
      req?.body?.budget, req?.body?.description,
      req?.body?.until, (<express.Request & { user: string }>req)?.user);

    res.status(200).json({
      demandUUID: demand.uuid,
      info: 'Demand was successfully created.',
    });
  };

  private deleteDemand = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const demand: Demand | null = await this.validateUserAndDemand(req,
      res, req?.params?.demandID, true);
    if (demand == null) {
      return;
    }

    await updateDemand({ status: DemandStatus.CLOSED }, demand.uuid);
    res.status(200).json({ info: 'Demand was successfully deleted.' });
  };

  private listMeDemands = async (req: express.Request,
    res: express.Response): Promise<void> => {
    await this.listingBase(req, res, {
      status: DemandStatus.OPEN,
      creator_uuid: (<express.Request & { user: string }>req)?.user,
    });
  };

  private listAllDemands = async (req: express.Request,
    res: express.Response): Promise<void> => {
    await this.listingBase(req, res, {
      status: DemandStatus.OPEN,
    });
  };

  private updateDemand = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'updateDemandSchema', this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const demand: Demand | null = await this.validateUserAndDemand(req,
      res, req?.body?.demandUUID, true);
    if (demand == null) {
      return;
    }

    if ('budget' in req?.body && req?.body?.budget <= 0) {
      res.status(500).json({ desc: 'Sorry, but your budget is too low.' });
      return;
    }

    if ('until' in req?.body && new Date(req?.body?.until) < new Date()) {
      res.status(500).json({
        desc: 'Sorry, but selected date is already expired.',
      });
      return;
    }

    const structureToUpdate: {
      name: string, budget: number,
      description: string, until: Date
    } = {
      name: ('name' in req?.body) ? req?.body?.name : demand.name,
      budget: ('budget' in req?.body) ? req?.body?.budget : demand.budget,
      description: ('description' in req?.body) ? req?.body?.description : demand.description,
      until: ('until' in req?.body) ? new Date(req?.body?.until) : demand.until,
    };
    await updateDemand(structureToUpdate, demand.uuid);
    res.status(200).json({ info: 'Demand was successfully updated.' });
  };

  private createNegotation = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'createNegotationSchema',
      this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const demand: Demand | null = await this.validateUserAndDemand(req, res,
      req?.body?.demandUUID, false);
    if (demand == null) {
      return;
    }

    const company: Company | null = await getCompanyByUUID(req?.body?.companyUUID);
    if (company == null) {
      res.status(500).json({ desc: 'Selected company does not exist.' });
      return;
    }

    if ((await getNegotiationsWithFilter({
      status: NegotiationStatus.OPEN, company_uuid: company.uuid, demand_uuid: demand.uuid,
    })).length > 0) {
      res.status(500).json({
        desc: 'Sorry, you already reacted on this demand with this company.',
      });
      return;
    }

    await createNotification(company.user_uuid,
      `Negotiation about demand '${demand.name}' started.`);
    await createNotification(demand.creator_uuid,
      `Company '${company.name}' started negotiation about '${demand.name}'.`);
    res.status(200).json({
      negotiationUUID: (await createNegotation(demand.uuid, company.uuid, req?.body?.price)).uuid,
      info: `Negotation was successfully created for demand with name '${demand.name}'.`,
    });
  };

  private listingBase = async (req: express.Request,
    res: express.Response,
    filter: { status: DemandStatus } | { status: DemandStatus, creator_uuid: string }) => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    await revalidateAllDatesInDemand();
    res.status(200).json({
      demands:
        await Promise.all((await getAllDemandsWithFilter(filter))
          .map(async (demand: Demand) => {
            const tempData:
            Demand & { userEmail: string | undefined, userName: string | undefined } = JSON
              .parse(JSON.stringify(demand));
            const user = await getUserById(demand.creator_uuid);
            tempData.userName = user?.name;
            tempData.userEmail = user?.email;
            return tempData;
          })),
    });
  };

  private validateUserAndDemand = async (req: express.Request,
    res: express.Response, demandID: string, mustBeOwner: boolean): Promise<Demand | null> => {
    const user: User | null = await getUserById((<express.Request & { user: string }>req)?.user);
    if (user == null) {
      res.status(404).json({ desc: 'User was not found.' });
      return null;
    }

    const demand: Demand | null = await getDemandByID(demandID);
    if (demand == null) {
      res.status(500).json({ desc: 'Demand ID is invalid.' });
      return null;
    }

    if (mustBeOwner && demand.creator_uuid !== user.uuid) {
      res.status(500).json({
        desc: 'You do not have permissions to manipulate with this demand.',
      });
      return null;
    }

    if (!mustBeOwner && demand.creator_uuid === user.uuid) {
      res.status(500).json({
        desc: 'Sorry, but you can not react on your own demand.',
      });
      return null;
    }

    if (demand.status !== DemandStatus.OPEN) {
      res.status(500).json({
        desc: 'Selected demand does not exist or is inactive.',
      });
      return null;
    }
    return demand;
  };
}
export default DemandsRouter;
