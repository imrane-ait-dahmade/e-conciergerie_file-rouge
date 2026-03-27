import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomaineController } from './domaine.controller';
import { DomaineService } from './domaine.service';
import { Domaine, DomaineSchema } from './schemas/domaine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Domaine.name, schema: DomaineSchema }]),
  ],
  controllers: [DomaineController],
  providers: [DomaineService],
  exports: [DomaineService],
})
export class DomaineModule {}
