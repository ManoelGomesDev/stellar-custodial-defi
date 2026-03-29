// src/wallet/wallet.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as StellarSdk from '@stellar/stellar-sdk';
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Contract,
  rpc,
} from '@stellar/stellar-sdk';
import * as crypto from 'crypto';
import fetch from 'node-fetch'; // vamos instalar isso

@Injectable()
export class WalletService {
  private readonly rpcServer: rpc.Server;
  private readonly networkPassphrase = Networks.TESTNET;
  private readonly friendbotUrl = 'https://friendbot.stellar.org';
  private readonly contractId: string | undefined;

  constructor() {
    // Conexão com o RPC da Stellar Testnet (2026)
    this.rpcServer = new rpc.Server('https://soroban-testnet.stellar.org', {
      allowHttp: false, // só HTTPS
    });
    this.contractId = process.env.CONTRACT_ID;

    if (!this.contractId) {
      console.error('❌ CONTRACT_ID não encontrado no .env');
    }
  }

  // =============================================
  // 1. CRIA WALLET NOVA (usado no signup)
  // =============================================
  async createWallet(): Promise<{ publicKey: string; encryptedSecret: string }> {
    const keypair = Keypair.random(); // gera chave pública + secreta

    const publicKey = keypair.publicKey();
    const secret = keypair.secret();

    // Criptografa a secret (só o servidor consegue ler)
    const encryptedSecret = this.encryptSecret(secret);

    // Funde com XLM grátis (Friendbot)
    await this.fundAccount(publicKey);

    return { publicKey, encryptedSecret };
  }

  /** AES-256 precisa de exatamente 32 bytes: hex de 64 chars, ou qualquer string (derivada com SHA-256). */
  private getAes256Key(): Buffer {
    const raw = process.env.ENCRYPTION_KEY;
    if (!raw?.length) {
      throw new Error('ENCRYPTION_KEY is not set');
    }
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      return Buffer.from(raw, 'hex');
    }
    return crypto.createHash('sha256').update(raw, 'utf8').digest();
  }

  private encryptSecret(secret: string): string {
    const key = this.getAes256Key();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(secret);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decryptSecret(encrypted: string): string {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const key = this.getAes256Key();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(Buffer.from(encryptedHex, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // =============================================
  // 2. FUNDA CONTA NO TESTNET (Friendbot)
  // =============================================
  private async fundAccount(publicKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.friendbotUrl}/?addr=${publicKey}`);
      if (!response.ok) throw new Error('Friendbot falhou');
      console.log(`✅ Conta ${publicKey} financiada com XLM no testnet`);
    } catch (error) {
      console.error('Friendbot error:', error);
      throw new BadRequestException('Não foi possível fundar a conta no testnet');
    }
  }

 // =============================================
// 3. CONSULTA SALDO XLM (nativo) – VERSÃO ATUALIZADA 2026
// =============================================
async getXlmBalance(publicKey: string): Promise<string> {
  try {
    // getAccountEntry() é o método correto no RPC novo
    const accountEntry = await this.rpcServer.getAccountEntry(publicKey);

    // balance() retorna o valor em stroops (1 XLM = 10_000_000 stroops)
    const balanceInStroops = accountEntry.balance(); // BigInt

    // Converte para XLM com 7 casas decimais
    const balanceInXlm = Number(balanceInStroops) / 10_000_000;

    return balanceInXlm.toFixed(7);
  } catch (error) {
    console.error('Erro ao buscar saldo XLM:', error);
    return '0'; // se der erro, devolve zero (pode melhorar depois)
  }
}

  // =============================================
  // 4. ENVIA XLM (transferência nativa)
  // =============================================
  async sendXlm(
    fromPublicKey: string,
    encryptedSecret: string,
    toPublicKey: string,
    amount: string,
  ): Promise<string> {
    const secret = this.decryptSecret(encryptedSecret);
    const keypair = Keypair.fromSecret(secret);

    // Pega dados da conta
    const account = await this.rpcServer.getAccount(fromPublicKey);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: toPublicKey,
          asset: StellarSdk.Asset.native(),
          amount,
        }),
      )
      .setTimeout(30)
      .build();

    tx.sign(keypair);

    const result = await this.rpcServer.sendTransaction(tx);
    return result.hash; // hash da transação (para acompanhar)
  }

// =============================================
// 5. CHAMA QUALQUER FUNÇÃO DO CONTRATO SOROBAN (VERSÃO FINAL 2026 - SEM ERROS DE TS)
// =============================================
async invokeContract(
  userPublicKey: string,
  encryptedSecret: string,
  contractId: string,
  method: string,
  params: StellarSdk.xdr.ScVal[] = [],
): Promise<string> {
  const secret = this.decryptSecret(encryptedSecret);
  const keypair = Keypair.fromSecret(secret);

  const account = await this.rpcServer.getAccount(userPublicKey);

  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: this.networkPassphrase,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  // 1. Simula antes de enviar (obrigatório no Soroban)
  const simulation = await this.rpcServer.simulateTransaction(tx);

  // Type guard oficial do SDK (resolve o erro de .result no SimulateTransactionResponse)
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    console.error('Erro na simulação do contrato:', simulation.error);
    throw new BadRequestException(
      `Erro na simulação: ${simulation.error}`,
    );
  }

  // 2. Assina a transação
  tx.sign(keypair);

  // 3. Envia para a rede
  const result = await this.rpcServer.sendTransaction(tx);

  // 4. Verifica erro (simplificado - evita .result().code que causa erro de tipo)
  if (result.status === 'ERROR') {
    console.error('Transação rejeitada pela rede:', result.errorResult);
    throw new BadRequestException(
      'Transação rejeitada pela blockchain. Verifique o console para detalhes.',
    );
  }

  console.log(`✅ Transação enviada com status: ${result.status} | Hash: ${result.hash}`);

  return result.hash;
}
  // =============================================
  // EXEMPLO: MINT TOKEN (DeFi)
  // =============================================
  async mintToken(
    userPublicKey: string,
    encryptedSecret: string,
    contractId: string,
    to: string,
    amount: bigint,
  ): Promise<string> {
    const toAddress = StellarSdk.Address.fromString(to).toScVal();
    const amountScVal = StellarSdk.nativeToScVal(amount, { type: 'i128' });

    return this.invokeContract(userPublicKey, encryptedSecret, contractId, 'mint', [
      toAddress,
      amountScVal,
    ]);
  }

  // =============================================
// EXEMPLO: HELLO (teste do contrato) – VERSÃO CORRIGIDA 2026
// =============================================
async helloContract(contractId: string, name: string): Promise<any> {
  const nameScVal = StellarSdk.nativeToScVal(name, { type: 'string' });

  // Conta dummy só para simulação (não precisa de assinatura)
  const dummyAccount = await this.rpcServer.getAccount(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' // conta de teste
  );

  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: this.networkPassphrase,
  })
    .addOperation(contract.call('hello', nameScVal))
    .setTimeout(30)
    .build();

  const simulation = await this.rpcServer.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    console.error('Erro na simulação hello:', simulation.error);
    throw new BadRequestException(`Erro na simulação: ${simulation.error}`);
  }

  // Agora o TypeScript sabe que é sucesso → .result existe
  return simulation.result;
}
}