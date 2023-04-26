import { ethers } from "ethers";
import React from "react";
import { Text } from "@nextui-org/react";
import { Copy } from "../Copy";

export const shortenAddress = (address: string, start = 4, end = 4) => {
	return `${address.slice(0, start + 2)}...${address.slice(-Math.abs(end))}`;
};

interface Props {
	address: string;
	copy?: boolean;
}

export const FormatAddress: React.FC<Props> = ({ ...props }) => {
	const parsed = ethers.utils.getAddress(props.address);

	if (!parsed) {
		throw Error(`Invalid address: ${props.address}`);
	}

	if (props.copy) {
		return (
			<Copy text={parsed}>
				<Text weight={"bold"}>{shortenAddress(props.address)}</Text>
			</Copy>
		);
	}
	return <Text weight={"bold"}>{shortenAddress(props.address)}</Text>;
};
