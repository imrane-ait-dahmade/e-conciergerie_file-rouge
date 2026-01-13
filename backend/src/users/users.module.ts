/**
 * Module Utilisateurs.
 * Gère les utilisateurs (schéma User) et le profil.
 * Exporte MongooseModule pour que Auth et Etablissements puissent utiliser le modèle User.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') ?? '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [MongooseModule],
})
export class UsersModule {}
