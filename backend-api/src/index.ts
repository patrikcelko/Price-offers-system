import express from 'express';
import Djv from 'djv';
import constants from './env';

import loginUserSchema from '../validation_schemas/loginUserSchema.json';
import registerUserSchema from '../validation_schemas/registerUserSchema.json';
import updateUserSchema from '../validation_schemas/updateUserSchema.json';
import updateNegotiationSchema from '../validation_schemas/updateNegotiationSchema.json';
import messageSchema from '../validation_schemas/messageSchema.json';
import createNegotationSchema from '../validation_schemas/createNegotationSchema.json';
import updateDemandSchema from '../validation_schemas/updateDemandSchema.json';
import createDemandSchema from '../validation_schemas/createDemandSchema.json';
import updateCompanySchema from '../validation_schemas/updateCompanySchema.json';
import createCompanySchema from '../validation_schemas/createCompanySchema.json';

import CompaniesRouter from './routers/companies';
import MessagesRouter from './routers/messages';
import NegotiationsRouter from './routers/negotiations';
import UsersRouter from './routers/users';
import DemandsRouter from './routers/demands';

const app = express();
const appPort = constants.port;
const env = new Djv();

env.addSchema('loginUserSchema', loginUserSchema);
env.addSchema('registerUserSchema', registerUserSchema);
env.addSchema('updateUserSchema', updateUserSchema);
env.addSchema('updateNegotiationSchema', updateNegotiationSchema);
env.addSchema('messageSchema', messageSchema);
env.addSchema('createNegotationSchema', createNegotationSchema);
env.addSchema('updateDemandSchema', updateDemandSchema);
env.addSchema('createDemandSchema', createDemandSchema);
env.addSchema('updateCompanySchema', updateCompanySchema);
env.addSchema('createCompanySchema', createCompanySchema);

app.use('/company/', new CompaniesRouter(env).router);
app.use('/message/', new MessagesRouter(env).router);
app.use('/negotiation/', new NegotiationsRouter(env).router);
app.use('/user/', new UsersRouter(env).router);
app.use('/demand/', new DemandsRouter(env).router);

app.use('/*', (_req, resp) => {
  resp.status(404).json({ desc: 'Unknown route.' });
});

(async (): Promise<void> => {
  app.listen(appPort, () => console.log(`Price-Offers-API listening on port ${appPort}.`));
})().catch((e) => {
  console.error('Main async thread failed.');
  console.error(e.message);
});
