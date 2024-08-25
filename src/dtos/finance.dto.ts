import { IsString, Matches } from 'class-validator';

export class ScrapInfoDto {
  @IsString()
  @Matches(/^[A-Z0-9]+:[A-Z]+$/, {
    message: 'searchQuery must match the pattern [A-Z0-9]+:[A-Z0-9]+',
  })
  public searchQuery: string;
}
