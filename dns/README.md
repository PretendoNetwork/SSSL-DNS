# SSSL DNS server

Custom DNS server intended to be used in conjunction with [SSSL](https://github.com/PretendoNetwork/SSSL). It redirects Nintendo hostnames to an SSSL-powered server using DNS spoofing.

## Config

The only 2 addresses required are for `conntest.nintendowifi.net` and `account.nintendo.net`. These can either be set using the default address or explicitly mapping them. Additional addresses may be added using `SSSL_DNS_MAP`.

| Name                       | Description                                                                            | Required                               |
| -------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| `SSSL_UDP_PORT`            | UDP port for the DNS server.                                                           | Only if not using TCP.                 |
| `SSSL_TCP_PORT`            | TPC port for the DNS server.                                                           | Only if not using UDP.                 |
| `SSSL_DNS_DEFAULT_ADDRESS` | The default address to use for `conntest.nintendowifi.net` and `account.nintendo.net`. | Only if not explicitly mapped.         |
| `SSSL_DNS_MAP_hostname`    | An explicit mapping of a hostname to an address.                                       | Only if not using the default address. |

These environment variables can be set manually or loaded from a `.env` file. See [example.env](./example.env) for an example configuration.

## Docker

The provided `Dockerfile` creates an image that runs the DNS server with Node.js. The configuration environment variables should either be provided to the container directly or mounted as a `.env` file in `/home/node/app/.env`. The [example Docker Compose file](../compose.yml) shows a setup that loads the configuration from a `.env` file in this directory.
