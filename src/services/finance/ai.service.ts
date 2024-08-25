import { Service } from 'typedi';

@Service()
export class AiService {
  private companyData = {};

  constructor(companyData) {
    this.companyData = companyData;
  }
}
