import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/register.dto';
import { CookieService } from 'src/common/services/cookie.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AccessGuard } from './auth.guards';
import { UserPrincipal } from './auth.interfaces';
import { GetUserPrincipal } from './auth.decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly cookieService: CookieService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async logIn(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userData = await this.authService.authenticateUser(
            dto.email,
            dto.password,
        );
        this.cookieService.setAccessCookie(res, userData.token);
        return userData;
    }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(
        @Body() dto: SignupDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userData = await this.authService.createUser(dto);
        this.cookieService.setAccessCookie(res, userData.token);
        return userData;
    }

    @Get('verify')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AccessGuard)
    async verify(@GetUserPrincipal() f: UserPrincipal) {
        return f;
    }

    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        this.cookieService.clearAccessCookie(res);
        return { message: 'Ha cerrado sesión exitosamente.' };
    }
}
