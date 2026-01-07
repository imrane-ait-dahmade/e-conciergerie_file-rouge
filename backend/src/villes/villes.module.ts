import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ville, VilleSchema } from './schemas/ville.schema';
import { VillesController } from './villes.controller';
import { VillesService } from './villes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ville.name, schema: VilleSchema }]),
  ],
  controllers: [VillesController],
  providers: [VillesService],
})
export class VillesModule {}
