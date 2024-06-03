# SSSL DNS

This project contains a DNS server and a custom Nginx configuration intended to be used in conjunction with
[SSSL](https://github.com/PretendoNetwork/SSSL).

## Usage

The provided [example Docker Compose file](./compose.yml) shows a setup that runs both the DNS server and Nginx
together. Here's how to set it up:

1. Clone this repository: `git clone https://github.com/PretendoNetwork/SSSL-DNS.git`.
2. Use [SSSL](https://github.com/PretendoNetwork/SSSL) to create your own patched SSL certficiates.
3. Copy the `cert-chain.pem` and `ssl-cert-private-key.pem` from SSSL to the `nginx` directory in this repository.
4. Create an Nginx configuration file `nginx.conf` in the `nginx` directory. Check the
   [Nginx configuration README](./nginx/README.md) for more information.
5. Create a `.env` file in the `dns` directory. Check the [DNS server README](./dns/README.md) for more information.
6. Run `docker-compose up -d --build` to build and start your SSSL environment. This will take some time the first time
   you run it but will be faster on subsequent runs.
