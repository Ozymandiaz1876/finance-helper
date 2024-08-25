import db from '@database';
import { and, eq, gte, desc } from 'drizzle-orm';
import { orgs, financial_data, orgs_financial_data } from '../../database/schema';
import { subWeeks } from 'date-fns';

// Helper function to find if the search for an org was done recently
export async function findRecentScrapedData(orgName: string) {
  // Calculate the timestamp for one week ago
  const oneWeekAgo = subWeeks(new Date(), 1);

  const orgData = await db.query.orgs.findFirst({
    where: (orgs, { eq }) => eq(orgs.name, orgName),
  });
  if (!orgData?.id) return null;

  // Check if there's a recent entry in orgs_financial_data
  const companyRecentData = await db
    .select({
      financialDataId: orgs_financial_data.financial_data_id,
      createdAt: orgs_financial_data.createdAt,
    })
    .from(orgs_financial_data)
    .innerJoin(financial_data, eq(orgs_financial_data.financial_data_id, financial_data.id))
    .where(and(eq(orgs_financial_data.org_id, orgData.id), gte(orgs_financial_data.createdAt, oneWeekAgo)))
    .orderBy(desc(orgs_financial_data.createdAt))
    .limit(1);

  // If recent data exists, fetch and return the financial data
  if (companyRecentData.length) {
    const latestCompanyFinancialData = companyRecentData[0];

    const scrapedData = await db.select().from(financial_data).where(eq(financial_data.id, latestCompanyFinancialData.financialDataId));
    return scrapedData ? JSON.parse(scrapedData[0].scrapped_data) : null;
  }

  return null;
}

// Helper function to create a new entry for scraped data
export async function storeScrapedDataInDB(orgName: string, data: any) {
  let orgData = await db.query.orgs.findFirst({
    where: (orgs, { eq }) => eq(orgs.name, orgName),
    columns: { id: true },
  });

  if (!orgData?.id) {
    // Insert new org
    const [newOrg] = await db
      .insert(orgs)
      .values({
        name: orgName,
        market_name: orgName,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: orgs.id });

    orgData = newOrg;
  }

  // Insert new financial data
  const [newFinancialData] = await db
    .insert(financial_data)
    .values({
      org_id: orgData.id,
      scrapped_data: JSON.stringify(data),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: financial_data.id });

  // Link new financial data to the org
  await db.insert(orgs_financial_data).values({
    org_id: orgData.id,
    financial_data_id: newFinancialData.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
