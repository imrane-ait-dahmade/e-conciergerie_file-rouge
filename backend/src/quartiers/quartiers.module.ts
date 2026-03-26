import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { Quartier, QuartierSchema } from './schemas/quartier.schema';
import { QuartiersController } from './quartiers.controller';
import { QuartiersService } from './quartiers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quartier.name, schema: QuartierSchema },
      { name: Ville.name, schema: VilleSchema },
    ]),
  ],
  controllers: [QuartiersController],
  providers: [QuartiersService],
})
export class QuartiersModule {}
