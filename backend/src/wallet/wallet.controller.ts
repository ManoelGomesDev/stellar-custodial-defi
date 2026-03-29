import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  private async userFromRequest(req: { user: { userId: number } }): Promise<User> {
    const user = await this.usersService.findById(Number(req.user.userId));
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  private async userWithSecretFromRequest(req: { user: { userId: number } }): Promise<User> {
    const user = await this.usersService.findByIdWithSecret(Number(req.user.userId));
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  @Get('balance')
  async getBalance(@Req() req: { user: { userId: number } }) {
    const user = await this.userFromRequest(req);
    const balance = await this.walletService.getXlmBalance(user.stellarPublicKey);
    return { balance };
  }

  @Post('send-xlm')
  async sendXlm(
    @Req() req: { user: { userId: number } },
    @Body() body: { to: string; amount: string },
  ) {
    const user = await this.userWithSecretFromRequest(req);
    const hash = await this.walletService.sendXlm(
      user.stellarPublicKey,
      user.encryptedStellarSecret,
      body.to,
      body.amount,
    );
    return { success: true, hash };
  }

  @Post('mint')
  async mintToken(
    @Req() req: { user: { userId: number } },
    @Body() body: { amount: string; to: string; contractId?: string },
  ) {
    const user = await this.userWithSecretFromRequest(req);
    const contractId = body.contractId ?? process.env.CONTRACT_ID;
    if (!contractId) {
      throw new BadRequestException('contractId ou CONTRACT_ID no ambiente é obrigatório');
    }
    const hash = await this.walletService.mintToken(
      user.stellarPublicKey,
      user.encryptedStellarSecret,
      contractId,
      body.to,
      BigInt(body.amount || 1000),
    );
    return { success: true, hash, message: 'Token mintado com sucesso no contrato DeFi!' };
  }
}