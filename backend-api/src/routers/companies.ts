import { Company, User } from '@prisma/client';
import { djv } from 'djv';
import express from 'express';
import {
  getUserById, updateCompany, getAllCompaniesByUser,
  createCompany, getCompanyByUUID, isCompanyIDUsed,
} from '../../prisma/seed';

import Router from '../router';
import { isUserLoggedIn, validateSchema } from '../utils';

/**
 * + POST /company -> Create company
 * + DELETE /company/:companyID -> Delete company (verify user)
 * + GET /company -> Get all my companies
 * + PUT /company -> Update company informations
 */

class CompaniesRouter extends Router {
  private schemaValidator: djv;

  constructor(schemaValidator: djv) {
    super();

    this.schemaValidator = schemaValidator;

    this.router.options('*', (req, res): void => {
      this.setHeader(req, res, 'GET,PUT,POST,DELETE');
      res.status(200).end();
    });

    this.post('/', (req: express.Request, res: express.Response): Promise<void> => this.createCompany(req, res));
    this.delete('/:companyID([a-z0-9_-]+)', (req: express.Request, res: express.Response): Promise<void> => this.deleteCompany(req, res));
    this.get('/', (req: express.Request, res: express.Response): Promise<void> => this.listAll(req, res));
    this.put('/', (req: express.Request, res: express.Response): Promise<void> => this.updateInfo(req, res));
  }

  private createCompany = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'createCompanySchema', this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    if (!(await isCompanyIDUsed(req?.body?.companyID,
      (<express.Request & { user: string }>req)?.user))) {
      res.status(401).json({ desc: 'This company is already registered for your account.' });
      return;
    }

    const company: Company = await createCompany(req?.body?.name, req?.body?.residence,
      req?.body?.phone, req?.body?.specialization,
      req?.body?.companyID, (<express.Request & { user: string }>req)?.user);

    res.status(200).json({ company: company.uuid });
  };

  private deleteCompany = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }

    const companyID: string = req?.params?.companyID;
    if (await this.validateUserAndCompany(req, res, companyID) == null) {
      return;
    }

    await updateCompany({ is_deleted: true }, companyID);
    res.status(200).json({ info: 'Company was successfully deleted.' });
  };

  private listAll = async (req: express.Request,
    res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, null, this.schemaValidator)
      || !(await isUserLoggedIn(req, res))) {
      return;
    }
    res.status(200).json({
      companies: await getAllCompaniesByUser((<express.Request & { user: string }>req)?.user),
    });
  };

  private updateInfo = async (req: express.Request, res: express.Response): Promise<void> => {
    if (!validateSchema(req, res, 'updateCompanySchema', this.schemaValidator) || !(await isUserLoggedIn(req, res))) {
      return;
    }

    if ('companyID' in req?.body && !(await isCompanyIDUsed(req?.body?.companyID,
      (<express.Request & { user: string }>req)?.user))) {
      res.status(401).json({ desc: 'This company is already registered for your account.' });
      return;
    }

    const company = await this.validateUserAndCompany(req, res, req?.body?.companyUUID);
    if (company == null) {
      return;
    }

    const structToUpdate = {
      name: ('name' in req?.body) ? req?.body?.name : company.name,
      residence: ('residende' in req?.body) ? req?.body?.residende : company.residence,
      specialization: ('specialization' in req?.body)
        ? req?.body?.specialization : company.specialization,
      phone: ('company' in req?.body) ? req?.body?.phone : company.phone,
      company_id: ('companyID' in req?.body) ? req?.body?.companyID : company.company_id,
    };

    await updateCompany(structToUpdate, company.uuid);
    res.status(200).json({ info: 'Company informations were successfully updated.' });
  };

  private validateUserAndCompany = async (req: express.Request,
    res: express.Response, companyID: string): Promise<Company | null> => {
    const company: Company | null = await getCompanyByUUID(companyID);
    const user: User | null = await getUserById((<express.Request & { user: string }>req)?.user);

    if (user == null) {
      res.status(404).json({ desc: 'User was not found.' });
      return null;
    }

    if (company == null) {
      res.status(500).json({ desc: 'Company UUID is invalid.' });
      return null;
    }

    if (user.uuid !== company.user_uuid) {
      res.status(401).json({ desc: 'This registration of the company does not belong to you.' });
      return null;
    }

    if (company.is_deleted) {
      res.status(500).json({ desc: 'This company was already deleted.' });
      return null;
    }

    return company;
  };
}
export default CompaniesRouter;
