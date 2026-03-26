import { PartialType } from '@nestjs/swagger';
import { CreateVilleDto } from './create-ville.dto';

export class UpdateVilleDto extends PartialType(CreateVilleDto) {}
