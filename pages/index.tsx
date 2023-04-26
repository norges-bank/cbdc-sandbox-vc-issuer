import { Container, Grid, Spacer } from "@nextui-org/react";
import Head from "next/head";
import { NavBar } from "../src/components/NavBar";

import { Login } from "../src/components/Login";

export default function Home() {
	return (
		<div>
			<Head>
				<title>VC Issuer</title>
				<meta name="description" content="VC issuer" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<NavBar></NavBar>
			<Container
				as="main"
				display="flex"
				direction="column"
				// justify="center"
				alignItems="center"
				style={{ height: "100vh" }}
			>
				<Spacer y={5}></Spacer>
				<Grid.Container gap={1}>
					<Grid xs={12}>
						<Login></Login>
					</Grid>
				</Grid.Container>
			</Container>
		</div>
	);
}
