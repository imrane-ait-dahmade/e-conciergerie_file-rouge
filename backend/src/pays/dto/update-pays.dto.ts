import { PartialType } from '@nestjs/swagger';
import { CreatePaysDto } from './create-pays.dto';

export class UpdatePaysDto extends PartialType(CreatePaysDto) {}
