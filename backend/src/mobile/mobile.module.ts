import { Module } from '@nestjs/common';
import { EtablissementsModule } from '../etablissements/etablissements.module';
import { MobileController } from './mobile.controller';

@Module({
  imports: [EtablissementsModule],
  controllers: [MobileController],
})
export class MobileModule {}
