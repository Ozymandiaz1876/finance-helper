import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { FinanceInfoController } from '@/controllers/finance.controller';

export class FinanceRoute implements Routes {
  public path = '/scrapinfo';
  public router = Router();
  public financeInfoController = new FinanceInfoController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:searchQuery([A-Z0-9]+:[A-Z]+)`, this.financeInfoController.scrapInfo);
  }
}
