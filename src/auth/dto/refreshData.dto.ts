import { IsNotEmpty, IsString } from 'class-validator';

export class refreshDataDto {
  @IsNotEmpty()
  @IsString()
  vkId: string;
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
