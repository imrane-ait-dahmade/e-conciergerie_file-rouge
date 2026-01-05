import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pays, PaysSchema } from './schemas/pays.schema';
import { PaysController } from './pays.controller';
import { PaysService } from './pays.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pays.name, schema: PaysSchema }]),
  ],
  controllers: [PaysController],
  providers: [PaysService],
})
export class PaysModule {}
