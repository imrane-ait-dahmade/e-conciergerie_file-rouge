import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Slider, SliderSchema } from './schemas/slider.schema';
import { SliderService } from './slider.service';
import { SlidersController } from './sliders.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Slider.name, schema: SliderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SlidersController],
  providers: [SliderService, RolesGuard],
  exports: [SliderService, MongooseModule],
})
export class SliderModule {}
