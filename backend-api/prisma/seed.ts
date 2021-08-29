import {
  Company,
  Demand,
  Negotiation,
  Notifications,
  PrismaClient, User,
} from '@prisma/client';
import { DemandStatus, NegotiationStatus } from '../src/constants';

const prisma = new PrismaClient();

export const createMessage = (message: string, negotUUID: string,
  userUUID: string) => prisma.message.create({
  data: {
    sender_uuid: userUUID,
    negotiation_uuid: negotUUID,
    is_deleted: false,
    content: message,
  },
});

export const getNotificationByID = (uuid: string):
Promise<Notifications | null> => prisma.notifications.findUnique({
  where: {
    uuid,
  },
});

export const deleteNotification = async (uuid: string): Promise<void> => {
  await prisma.notifications.delete({
    where: {
      uuid,
    },
  });
};

export const createNotification = (userUUID: string, message: string):
Promise<Notifications> => prisma.notifications.create({
  data: {
    user_uuid: userUUID,
    description: message,
  },
});

export const getNegotiationForListing = (userUUID: string) => prisma.negotiation.findMany({
  orderBy: [
    {
      last_change: 'desc',
    }],
  where: {
    OR: [
      {
        company: {
          user_uuid: userUUID,
        },
      },
      {
        demand: {
          creator_uuid: userUUID,
        },
      },
    ],
  },
  select: {
    company: true,
    demand: true,
    uuid: true,
    last_change: true,
    price: true,
    status: true,
    Message: true,
  },
});

export const updateNegotiation = async (
  structure: { price: number } | { status: NegotiationStatus }, uuid: string,
) => {
  await prisma.negotiation.update({
    where: {
      uuid,
    },
    data: structure,
  });
};

export const getNegotiationByID = (uuid: string):
Promise<Negotiation | null> => prisma.negotiation.findUnique({
  where: {
    uuid,
  },
});

export const getNegotiationsWithFilter = (filter: {
  status: NegotiationStatus,
  company_uuid: string, demand_uuid: string
} | { status: NegotiationStatus, demand_uuid: string }):
Promise<Negotiation[]> => prisma.negotiation.findMany({
  orderBy: [
    {
      last_change: 'desc',
    }],
  where: filter,
});

export const getAllDemandsWithFilter = (filter: { status: DemandStatus } | {
  status: DemandStatus,
  creator_uuid: string
}): Promise<Demand[]> => prisma.demand.findMany({
  orderBy: [
    {
      until: 'asc',
    }],
  where: filter,
});

export const revalidateAllDatesInDemand = async (): Promise<void> => {
  await prisma.demand.updateMany({
    where: {
      until: {
        lt: new Date(),
      },
    },
    data: {
      status: DemandStatus.EXPIRED,
    },
  });
};

export const createNegotation = (demandUUID: string, companyUUID: string, price: number):
Promise<Negotiation> => prisma.negotiation.create({
  data: {
    demand_uuid: demandUUID,
    company_uuid: companyUUID,
    price,
    status: NegotiationStatus.OPEN,
  },
});

export const updateDemand = async (structure: { status: DemandStatus } | {
  name: string,
  budget: number, description: string, until: Date
}, uuid: string): Promise<void> => {
  await prisma.demand.update({
    where: {
      uuid,
    },
    data: structure,
  });
};

export const getDemandByID = (demandID: string):
Promise<Demand | null> => prisma.demand.findUnique({
  where: {
    uuid: demandID,
  },
});

export const createDemand = (name: string, budget: number, description: string,
  until: string, userUUID: string): Promise<Demand> => prisma.demand.create({
  data: {
    name,
    budget,
    status: DemandStatus.OPEN,
    description,
    until: new Date(until),
    creator_uuid: userUUID,
  },
});

export const createCompany = async (name: string, residence: string, phone: string,
  specialization: string, companyID: string,
  userID: string): Promise<Company> => prisma.company.create({
  data: {
    user_uuid: userID,
    name,
    residence,
    specialization,
    phone,
    company_id: companyID,
  },
});

export const getAllCompaniesByUser = (userID: string):
Promise<Company[]> => prisma.company.findMany({
  where: {
    user_uuid: userID,
    is_deleted: false,
  },
});

export const getUserNotifications = (uuid: string):
Promise<Notifications[]> => prisma.notifications.findMany({
  orderBy: [
    {
      created: 'desc',
    }],
  where: {
    user_uuid: uuid,
  },
});

export const updateProfile = async (structure: {
  salt: string,
  password_hash: string, name: string
}, uuid: string): Promise<void> => {
  await prisma.user.update({
    where: {
      uuid,
    },
    data: structure,
  });
};

export const updateCompany = async (structure: { is_deleted: boolean } | {
  name: string,
  residence: string, specialization: string, phone: string, company_id: string
},
uuid: string): Promise<void> => {
  await prisma.company.update({
    where: {
      uuid,
    },
    data: structure,
  });
};

export const getCompanyByUUID = (uuid: string):
Promise<Company | null> => prisma.company.findUnique({
  where: {
    uuid,
  },
});

export const getUserById = (id: string):
Promise<User | null> => prisma.user.findUnique({
  where: {
    uuid: id,
  },
});

export const getUserByEmail = (email: string):
Promise<User | null> => prisma.user.findUnique({
  where: {
    email,

  },
});

export const getCompanyByCompanyIDAndUser = (companyID: string,
  userUUID: string): Promise<Company | null> => prisma.company.findFirst({
  where: {
    company_id: companyID,
    user_uuid: userUUID,
  },
});

export const isCompanyIDUsed = async (companyID: string, userUUID: string):
Promise<Boolean> => (await getCompanyByCompanyIDAndUser(companyID, userUUID)) == null;

export const isEmailAlreadyUsed = async (email: string):
Promise<Boolean> => (await getUserByEmail(email)) == null;

export const createUser = async (name: string, email: string,
  hash: string, salt: string): Promise<User> => prisma.user.create({
  data: {
    name,
    email,
    password_hash: hash,
    salt,
  },
});

export const killDatabaseConn = (): Promise<void> => prisma.$disconnect();
