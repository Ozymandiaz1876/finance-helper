import { IsString } from 'class-validator';

export class ScrapInfoDto {
  @IsString()
  public searchQuery: string;
}
