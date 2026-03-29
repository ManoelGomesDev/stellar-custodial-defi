// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')  // Nome da tabela no Postgres
export class User {
  @PrimaryGeneratedColumn()           // ID automático
  id: number;

  @Column({ unique: true })           // Email único
  email: string;

  @Column()                           // Senha criptografada
  password: string;

  @Column()                           // Chave pública da Stellar (G...)
  stellarPublicKey: string;

  @Column({ select: false })          // NUNCA devolve a secret no JSON!
  encryptedStellarSecret: string;

  @Column({ default: true })
  isActive: boolean;
}