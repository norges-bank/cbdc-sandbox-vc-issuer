import { Button, Grid, Text, Textarea } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

interface Props {}

export const Login: React.FC<Props> = ({ ...props }) => {
	const [VC, setVC] = useState<string>();
	const [error, setError] = useState<string>();

	const login = async () => {
		const url = new URL("https://oidc-ver2.difi.no/idporten-oidc-provider/authorize");
		url.searchParams.append("scope", "openid profile");
		url.searchParams.append("acr_values", "Level3");
		url.searchParams.append("client_id", process.env.NEXT_PUBLIC_ID_PORTEN_CLIENT_ID!);
		url.searchParams.append("redirect_uri", process.env.NEXT_PUBLIC_ID_PORTEN_CALLBACK_URL!);
		url.searchParams.append("response_type", "code");
		url.searchParams.append("ui_locales", "nb");

		window.location.href = url.toString();
	};

	const handleDownloadVC = () => {
		if (!VC) {
			throw Error("No VC found");
		}
		const element = document.createElement("a");
		const file = new Blob([VC], { type: "text/plain" });
		element.href = URL.createObjectURL(file);

		const date = new Date();
		const dateString = date.toISOString().replace(/:/g, "-");
		element.download = `UTC--${dateString}--idNumberVC`;

		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	};

	useEffect(() => {
		let isMounted = true;

		const doAsync = async () => {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");

			// Remove code from url to avoid this function running multiple times
			window.history.replaceState({}, document.title, "/");

			if (code && !VC) {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/api/login?code=${code}`);
				if (response.status !== 200) {
					return setError(`Login response returned status ${response.status}`);
				}
				const json = await response.json();
				if ("vc" in json) {
					console.log(JSON.parse(json.vc));
					setVC(json.vc);
				}
			}
		};

		doAsync();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<form>
			<Grid.Container gap={2}>
				<Grid xs={12}></Grid>
				<Grid xs={12}>
					<Button id="login" onPress={() => login()}>
						Opprett VC
					</Button>
				</Grid>
				{error && (
					<Grid xs={12}>
						<Text color="error">{error}</Text>
					</Grid>
				)}
				{VC && <Grid xs={12}>{VC && <Textarea id="vc-string" value={VC}></Textarea>}</Grid>}
				{VC && (
					<Grid xs={12}>
						<Button id="vc-download" onPress={() => handleDownloadVC()}>
							Download VC
						</Button>
					</Grid>
				)}
			</Grid.Container>
		</form>
	);
};
