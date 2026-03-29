// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // para .env
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',                    // nome do serviço no docker-compose
      port: 5432,
      username: 'user',
      password: 'pass',
      database: 'stellar',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,             // só em dev! (cria tabelas automático)
    }),

    UsersModule,
    WalletModule,
  ],
})
export class AppModule {}