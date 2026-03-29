import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { Pays, PaysSchema } from './schemas/pays.schema';
import { PaysController } from './pays.controller';
import { PaysService } from './pays.service';

@Module({
  imports: [
    MediaModule,
    MongooseModule.forFeature([
      { name: Pays.name, schema: PaysSchema },
      { name: Ville.name, schema: VilleSchema },
    ]),
  ],
  controllers: [PaysController],
  providers: [PaysService],
})
export class PaysModule {}
