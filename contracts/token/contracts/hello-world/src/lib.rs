#![no_std]  // Rust sem biblioteca padrão (deixa o contrato bem pequeno)

use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, String, Vec};

#[contract]  // Diz ao Soroban: "essa struct é o contrato"
pub struct Token;

#[contractimpl]  // Diz: "as funções abaixo são públicas na blockchain"
impl Token {
    // Inicializa o token (só o dono pode chamar)
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        admin.require_auth();  // Só o admin pode chamar
        // Guarda dados no storage da blockchain (como um banco interno)
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("name"), &name);
        env.storage().instance().set(&symbol_short!("symbol"), &symbol);
        env.storage().instance().set(&symbol_short!("decimals"), &decimals);
    }

    // Cria novos tokens (mint) – função DeFi básica
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        admin.require_auth();  // Só admin
        to.require_auth();

        // Aqui você poderia adicionar lógica de lending, mas por enquanto só mint
        // (vamos expandir depois)
        env.storage().instance().set(&to, &(amount));  // Exemplo simples
    }

    // Função de teste: retorna "Hello" + nome
    pub fn hello(env: Env, to: String) -> Vec<String> {
        vec![&env, String::from_str(&env, "Hello"), to]
    }
}