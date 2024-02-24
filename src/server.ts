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

let udpPort = 0;
let tcpPort = 0;
let dohPort = 0;

if (process.env.SSSL_UDP_PORT) {
	udpPort = Number(process.env.SSSL_UDP_PORT);
}

if (process.env.SSSL_TCP_PORT) {
	tcpPort = Number(process.env.SSSL_TCP_PORT);
}

if (process.env.SSSL_DOH_PORT) {
	dohPort = Number(process.env.SSSL_DOH_PORT);
}

if (Number.isNaN(udpPort)) {
	console.log(colors.bgRed('Invalid UDP port'));
	process.exit();
}

if (Number.isNaN(tcpPort)) {
	console.log(colors.bgRed('Invalid TCP port'));
	process.exit();
}

if (Number.isNaN(dohPort)) {
	console.log(colors.bgRed('Invalid DoH port'));
	process.exit();
}

if (udpPort === 0 && tcpPort === 0  && dohPort === 0) {
	console.log(colors.bgRed('No server port set. Set one of SSSL_UDP_PORT, SSSL_TCP_PORT or SSSL_DOH_PORT'));
	process.exit();
}

if (dohPort !== 0) {
	console.log(colors.bgBrightYellow('DoH port set. The Wii U does not support DoH'));
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
	const tableConfig = {
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
			colors.green('DoH'), colors.green(`${addresses.doh.address}:${addresses.doh.port}`)
		]);
	}

	console.log(colors.green('SSSL-DNS listening on the following addresses'));
	console.log(table(tableData, tableConfig));
});

server.listen({
	udp: udpPort !== 0 ? udpPort : undefined,
	tcp: tcpPort !== 0 ? tcpPort : undefined,
	doh: dohPort !== 0 ? dohPort : undefined
});