/**
 * Contrôleur d'authentification.
 * Reçoit les requêtes HTTP et délègue au service.
 *
 * Flux : Client → Controller (reçoit Body) → Service (logique) → MongoDB
 */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../users/dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestUser } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /** Logout : route protégée. req.user rempli par JwtStrategy. */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: { user: RequestUser }) {
    return this.authService.logout(req.user.userId);
  }
}
