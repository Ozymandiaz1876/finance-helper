import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { FinanceInfo } from '@/services/scrap.service';

export class FinanceInfoController {
  public financeInfo = Container.get(FinanceInfo);

  public scrapInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searhcQuery: string = req.body.searchQuery;
      const pageData = await this.financeInfo.scrapData(searhcQuery);

      res.status(201).json({ data: pageData, message: 'scrapData' });
    } catch (error) {
      next(error);
    }
  };
}
