// Core interfaces
import {
	createAgent,
	IDIDManager,
	IResolver,
	IDataStore,
	IKeyManager,
	IDataStoreORM,
	ICredentialIssuer,
	TAgent,
} from "@veramo/core";

// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";

// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// Web did identity provider

// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations } from "@veramo/data-store";

// TypeORM is installed with `@veramo/data-store`
import { DataSource } from "typeorm";
import { ethers } from "ethers";
import { CredentialPlugin } from "@veramo/credential-w3c";

export type VeramoAgent = TAgent<
	IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialIssuer
>;

export function initAgent(dataSource: DataSource) {
	const agentConfig = getAgentConfig(dataSource, process.env.SECRET);
	return createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialIssuer>(
		agentConfig,
	);
}

export function getDatasource(databaseFileName: string) {
	return new DataSource({
		migrations,
		migrationsRun: true,
		type: "sqlite",
		database: process.env.NODE_ENV !== "production" ? ":memory:" : databaseFileName,
		synchronize: false,
		logging: ["error", "info", "warn"],
		entities: Entities,
		name: databaseFileName,
	});
}

export function getAgentConfig(dataSource: DataSource, secretKey?: string) {
	if (!process.env.RPC_URL) {
		throw new Error("RPC_URL not set");
	}
	if (!process.env.DID_NAMESPACE) {
		throw new Error("DID_NAMESPACE not set");
	}
	if (!process.env.CHAIN_ID) {
		throw new Error("CHAIN_ID not set");
	}
	return {
		plugins: [
			new KeyManager({
				store: new KeyStore(dataSource),
				kms: {
					local: new KeyManagementSystem(
						new PrivateKeyStore(dataSource, secretKey ? new SecretBox(secretKey) : undefined),
					),
				},
			}),
			new DIDManager({
				store: new DIDStore(dataSource),
				defaultProvider: "did:ethr:1729",
				providers: {
					"did:ethr:1729": new EthrDIDProvider({
						defaultKms: "local",
						network: process.env.CHAIN_ID,
						rpcUrl: process.env.RPC_URL,
						//   registry: EthereumDIDRegistry,
					}),
					// 'did:ethr:31337': new EthrDIDProvider({
					//   defaultKms: 'local',
					//   network: parseInt(process.env.PROVIDER_NETWORK),
					//   rpcUrl: process.env.PROVIDER_URL,
					//   registry: Deployments[process.env.BROK_ENVIROMENT].contracts.EthereumDIDRegistry.address,
					// }),
				},
			}),
			new DIDResolverPlugin({
				resolver: new Resolver({
					...ethrDidResolver({
						provider: new ethers.providers.JsonRpcProvider({
							url: process.env.RPC_URL,
							//   registry: Deployments[process.env.BROK_ENVIROMENT].contracts.EthereumDIDRegistry.address,
							//   chainId:CHAIN_ID,
							//   name: process.env.PROVIDER_NETWORK,
						}),
					}),
				}),
			}),
			new CredentialPlugin(),
		],
	};
}
