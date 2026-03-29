import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { Pays, PaysSchema } from '../pays/schemas/pays.schema';
import { Quartier, QuartierSchema } from '../quartiers/schemas/quartier.schema';
import { Ville, VilleSchema } from './schemas/ville.schema';
import { VillesController } from './villes.controller';
import { VillesService } from './villes.service';

@Module({
  imports: [
    MediaModule,
    MongooseModule.forFeature([
      { name: Ville.name, schema: VilleSchema },
      { name: Pays.name, schema: PaysSchema },
      { name: Quartier.name, schema: QuartierSchema },
    ]),
  ],
  controllers: [VillesController],
  providers: [VillesService],
})
export class VillesModule {}
