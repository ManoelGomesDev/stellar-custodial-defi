import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtStrategy } from 'src/auth/jwt.strategy'; // vamos criar

@Controller('wallet')
@UseGuards(JwtStrategy)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Query('publicKey') publicKey: string) {
    const balance = await this.walletService.getXlmBalance(publicKey);
    return { balance };
  }

  @Post('mint')
  async mintToken(@Req() req: any, @Body() body: { contractId: string; amount: string }) {
    const user = req.user; // vem do JWT
    // Aqui você pode buscar o encryptedSecret do banco se quiser (exemplo simplificado)
    // Por enquanto vamos assumir que você passa o contractId
    const hash = await this.walletService.mintToken(
      user.userId,
      user.encryptedSecret,
      body.contractId,
      body.amount,
      BigInt(body.amount)
    );
    return { hash };
  }
}