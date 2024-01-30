import { createServer, Packet } from 'dns2';
import { table } from 'table';
import colors from '@colors/colors';
import dotenv from 'dotenv';

dotenv.config();

const addressMap: Record<string, string> = {};

for (const variable in process.env) {
	if (variable.startsWith('SSSL_DNS_MAP')) {
		const hostname = variable.split('SSSL_DNS_MAP_')[1];
		const address = process.env[variable]!;

		addressMap[hostname] = address;
	}
}

if (!addressMap['conntest.nintendowifi.net']) {
	if (!process.env.SSSL_DNS_DEFAULT_ADDRESS) {
		console.log(colors.bgRed('Mapping for conntest.nintendowifi.net not found and no default address set. Set either SSSL_DNS_DEFAULT_ADDRESS or SSSL_DNS_MAP_conntest.nintendowifi.net'));
		process.exit();
	}

	addressMap['conntest.nintendowifi.net'] = process.env.SSSL_DNS_DEFAULT_ADDRESS;
}

if (!addressMap['account.nintendo.net']) {
	if (!process.env.SSSL_DNS_DEFAULT_ADDRESS) {
		console.log(colors.bgRed('Mapping for account.nintendo.net not found and no default address set. Set either SSSL_DNS_DEFAULT_ADDRESS or SSSL_DNS_MAP_account.nintendo.net'));
		process.exit();
	}

	addressMap['account.nintendo.net'] = process.env.SSSL_DNS_DEFAULT_ADDRESS;
}

const server = createServer({
	udp: true,
	handle: (request, send) => {
		const [ question ] = request.questions;
		const { name } = question;

		if (addressMap[name]) {
			const response = Packet.createResponseFromRequest(request);

			response.answers.push({
				name,
				type: Packet.TYPE.A,
				class: Packet.CLASS.IN,
				ttl: 300,
				address: addressMap[name]
			});

			send(response);
		}
	}
});

server.on('listening', () => {
	const config = {
		//singleLine: true,
		border: {
			topBody: '─',
			topJoin: '┬',
			topLeft: '┌',
			topRight: '┐',

			bottomBody: '─',
			bottomJoin: '┴',
			bottomLeft: '└',
			bottomRight: '┘',

			bodyLeft: '│',
			bodyRight: '│',
			bodyJoin: '│',

			joinBody: '─',
			joinLeft: '├',
			joinRight: '┤',
			joinJoin: '┼'
		}
	};

	const addresses = server.addresses();
	const tableData = [
		[colors.cyan('Protocol'), colors.cyan('Address')]
	];

	if (addresses.udp) {
		tableData.push([
			colors.green('UDP'), colors.green(`${addresses.udp.address}:${addresses.udp.port}`)
		]);
	}

	if (addresses.tcp) {
		tableData.push([
			colors.green('TCP'), colors.green(`${addresses.tcp.address}:${addresses.tcp.port}`)
		]);
	}

	if (addresses.doh) {
		tableData.push([
			colors.green('DOH'), colors.green(`${addresses.doh.address}:${addresses.doh.port}`)
		]);
	}

	console.log(colors.green('SSSL-DNS listening on the following addresses'));
	console.log(table(tableData, config));
});

server.listen({
	udp: 53
});