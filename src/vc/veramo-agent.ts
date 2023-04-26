import { IIdentifier, TKeyType } from "@veramo/core";
import { ethers } from "ethers";
import { getDatasource, initAgent, VeramoAgent } from "./veramo-init";

export class VeramoClient {
	protected agent: VeramoAgent;
	protected identifier: IIdentifier;
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		this.agent = agent;
		this.identifier = identifier;
	}

	static async init(
		walletArgs: {
			wallet: ethers.Wallet;
			alias: string;
		},
		_args?: { dataSourceName: string },
	) {
		const args = {
			...{
				dataSourceName: "test:veramo",
			},
			..._args,
		};
		const agent = initAgent(getDatasource(args.dataSourceName));

		const identifier = await VeramoClient.identityFromWallet(agent, walletArgs);
		return new VeramoClient(agent, identifier);
	}

	static async identityFromWallet(agent: VeramoAgent, walletArgs: { wallet: ethers.Wallet; alias: string }) {
		const privateKeyHex = walletArgs.wallet.privateKey.substr(2);
		const compressedPublicKey = walletArgs.wallet._signingKey().compressedPublicKey;
		if (!process.env.DID_NAMESPACE) throw Error("DID_NAMESPACE not set");
		const didId = `${process.env.DID_NAMESPACE}:${compressedPublicKey}`;
		try {
			const exsisitingIdentifier = await agent.didManagerGetByAlias({
				alias: walletArgs.alias,
			});
			return exsisitingIdentifier;
		} catch (error) {
			console.log("Creating new DID", didId, "with alias", walletArgs.alias);
			return await agent.didManagerImport({
				keys: [
					{
						privateKeyHex: privateKeyHex,
						type: <TKeyType>"Secp256k1",
						kms: "local",
						kid: compressedPublicKey,
					},
				],
				did: didId,
				controllerKeyId: compressedPublicKey,
				alias: walletArgs.alias,
				provider: process.env.DID_NAMESPACE,
			});
		}
	}

	async createVC(idNumber: string) {
		const vc = await this.agent.createVerifiableCredential({
			credential: {
				"@context": ["https://www.w3.org/2018/credentials/v1", "https://www.symfoni.dev/credentials/v1"],
				type: ["VerifiableCredential", "NorwegianIdNumber"],
				credentialSubject: {
					idNumber: idNumber,
				},
				issuer: {
					id: this.identifier.did,
				},
			},
			proofFormat: "jwt",
		});
		return vc;
	}
}
