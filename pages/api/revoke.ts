// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { VeramoClient } from "../../src/vc/veramo-agent";

type Data = {
	status: string;
	version: string;
};

const SETTINGS = {
	client_id: process.env.NEXT_PUBLIC_ID_PORTEN_CLIENT_ID!,
	redirect_uri: process.env.NEXT_PUBLIC_ID_PORTEN_CALLBACK_URL!,
};

// API handler function that takes two arguments: code and state
// The code is the authorization code that we need to exchange for an access token
// The state is the state that we sent to the authorization server, and we need to verify that it matches the state that we sent
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { code, state } = req.query;

	// Exchange the authorization code for an access token
	// Make POST request to the token endpoint with the authorization code
	const response = await fetch("https://oidc-ver2.difi.no/idporten-oidc-provider/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${process.env.ID_PORTEN_BASIC_AUTH!}`,
		},
		body: new URLSearchParams({
			grant_type: "authorization_code",
			code: code as string,
			client_id: SETTINGS.client_id,
			redirect_uri: SETTINGS.redirect_uri,
		}),
	});

	const json = await response.json();
	// Chek if the response contains an access token
	if (!("access_token" in json)) {
		console.log("Malformed response from idporten", json);
		if ("error_description" in json) {
			return res.status(400).json(json.error_description);
		} else {
			throw new Error(JSON.stringify(json));
		}
	}

	// json contains access_token, id_token, refresh_token, expires_in, token_type
	// base64 decode the access_token to get the user info
	const token = json.access_token;
	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const userInfo = JSON.parse(Buffer.from(base64, "base64").toString());
	// Create VC with Veramo
	const veramoClient = await VeramoClient.init(
		{
			wallet: ethers.Wallet.fromMnemonic(process.env.ISSUER_SECRET!),
			alias: "issuerWallet",
		},
		{
			dataSourceName: process.env.NODE_ENV === "production" ? "production:veramo" : "test:veramo",
		},
	);
	const vc = await veramoClient.createVC(userInfo.pid);
	return res.json({
		vc: JSON.stringify(vc),
	});
}
