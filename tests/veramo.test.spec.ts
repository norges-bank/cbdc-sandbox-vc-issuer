import { test, expect } from "@playwright/test";
import { ethers } from "ethers";
import { loadEnvConfig } from "@next/env";
import { initAgent, getDatasource } from "../src/vc/veramo-init";
import { VeramoClient } from "../src/vc/veramo-agent";

test.beforeAll(() => {
	const projectDir = process.cwd();
	loadEnvConfig(projectDir);
});

test("get veramo agent raw", async ({ context }) => {
	const agent = initAgent(getDatasource("test:veramo"));
	expect(agent).toBeTruthy();
});
test("create identity from pk", async () => {
	const wallet = ethers.Wallet.fromMnemonic(process.env.ISSUER_SECRET!);
	const client = await VeramoClient.init({
		alias: "issuerWallet",
		wallet: wallet,
	});
	expect(client).toBeTruthy();
});

test("issue idNumber vc to person", async ({}) => {
	const wallet = ethers.Wallet.fromMnemonic(process.env.ISSUER_SECRET!);
	const client = await VeramoClient.init({
		alias: "issuerWallet",
		wallet: wallet,
	});
	const vc = await client.createVC("12345678901");
	expect(vc).toBeTruthy();
	expect(vc.credentialSubject.idNumber).toBe("12345678901");
});
