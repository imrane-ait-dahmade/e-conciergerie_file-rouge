import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quartier, QuartierSchema } from './schemas/quartier.schema';
import { QuartiersController } from './quartiers.controller';
import { QuartiersService } from './quartiers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quartier.name, schema: QuartierSchema }]),
  ],
  controllers: [QuartiersController],
  providers: [QuartiersService],
})
export class QuartiersModule {}
