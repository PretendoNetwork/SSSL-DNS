import DNS, { createServer, Packet } from 'dns2';
import { table } from 'table';
import colors from '@colors/colors';
import dotenv from 'dotenv';
import type { DnsResponse } from 'dns2';

process.on('SIGTERM', () => {
	process.exit();
});

dotenv.config();

const addressMap: Record<string, string> = {};
const wiimmfiResolver = new DNS({
	nameServers: [
		'95.217.77.181' // * https://wiimmfi.de/patcher/dnspatch
	]
});
const fallbackResolver = new DNS({
	// * dns2 will run queries to all of these servers at once, and use the first response it gets
	nameServers: [
		'9.9.9.9', // * https://quad9.net
		'1.1.1.1', // * https://www.cloudflare.com/learning/dns/what-is-1.1.1.1
		'8.8.8.8' // * https://developers.google.com/speed/public-dns
	]
});

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

if (process.env.SSSL_UDP_PORT) {
	udpPort = Number(process.env.SSSL_UDP_PORT);
}

if (process.env.SSSL_TCP_PORT) {
	tcpPort = Number(process.env.SSSL_TCP_PORT);
}

if (Number.isNaN(udpPort)) {
	console.log(colors.bgRed('Invalid UDP port'));
	process.exit();
}

if (Number.isNaN(tcpPort)) {
	console.log(colors.bgRed('Invalid TCP port'));
	process.exit();
}

if (udpPort === 0 && tcpPort === 0) {
	console.log(colors.bgRed('No server port set. Set one of SSSL_UDP_PORT or SSSL_TCP_PORT'));
	process.exit();
}

if (udpPort === tcpPort) {
	console.log(colors.bgRed('UDP and TCP ports cannot match'));
	process.exit();
}

if (udpPort === 0) {
	console.log(colors.bgYellow('UDP port not set. One will be randomly assigned'));
}

if (tcpPort === 0) {
	console.log(colors.bgYellow('TCP port not set. One will be randomly assigned'));
}

const server = createServer({
	udp: true,
	tcp: true,
	handle: async (request, send) => {
		const [ question ] = request.questions;
		const { name } = question;
		let response: DnsResponse | null = null;

		try {
			if (addressMap[name]) {
				// * If requesting one of our known domains, use our servers
				response = Packet.createResponseFromRequest(request);

				response.answers.push({
					name,
					type: Packet.TYPE.A,
					class: Packet.CLASS.IN,
					ttl: 300,
					address: addressMap[name]
				});
			} else if (name.endsWith('nintendowifi.net')) {
				// * Assume Wiimmfi. WiiLink NAS will not work with our DNS
				// * NOTE - This still points conntest.nintendowifi.net to OUR servers, since the Wii U also uses it
				response = await wiimmfiResolver.resolve('nas.nintendowifi.net');
			} else {
				// * Fallback to public DNS servers for everything else
				response = await fallbackResolver.resolve(name);
			}
		} catch {
			// * Eat errors for now
			// TODO - Send a SERVFAIL response
		}

		if (response) {
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

	console.log(colors.green('SSSL-DNS listening on the following addresses'));
	console.log(table(tableData, tableConfig));
});

server.listen({
	udp: udpPort !== 0 ? udpPort : undefined,
	tcp: tcpPort !== 0 ? tcpPort : undefined
});
