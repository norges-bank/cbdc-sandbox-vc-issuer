import { Navbar, Avatar, Text, Container, Grid, Col } from "@nextui-org/react";
import React from "react";

interface Props {}

export const NavBar: React.FC<Props> = ({ ...props }) => {
	return (
		<Navbar variant="static" maxWidth={"fluid"}>
			<Navbar.Toggle showIn={"xs"} aria-label="toggle navigation" />
			<Navbar.Brand>
				<Text h1>VC Issuer</Text>
			</Navbar.Brand>
			<Navbar.Content enableCursorHighlight activeColor="secondary" hideIn="xs" variant="underline">
				<Navbar.Link href="/">Issue</Navbar.Link>
			</Navbar.Content>
			<Navbar.Content>
				<Navbar.Collapse>
					<Grid.Container gap={5} justify="center">
						<Grid>
							<Navbar.Link href="/">Issue</Navbar.Link>
						</Grid>
					</Grid.Container>
				</Navbar.Collapse>
			</Navbar.Content>
		</Navbar>
	);
};
