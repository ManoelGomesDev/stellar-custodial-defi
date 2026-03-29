// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { WalletService } from '../wallet/wallet.service'; // nossa abstração!
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private walletService: WalletService, // injetamos nossa wallet
  ) {}

  // Cria usuário + wallet automaticamente
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Verifica se email já existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    // 2. Cria a wallet na Stellar (chama nossa abstração)
    const { publicKey, encryptedSecret } =
      await this.walletService.createWallet();

    // 3. Criptografa a senha do usuário
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 4. Salva tudo no banco
    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      stellarPublicKey: publicKey,
      encryptedStellarSecret: encryptedSecret,
    });

    return this.usersRepository.save(newUser);
  }

  // Busca usuário pelo email (usado no login depois)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Busca por ID (para proteger rotas)
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}