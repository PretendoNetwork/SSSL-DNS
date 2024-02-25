# SSSL DNS
Custom DNS server intended to be used in conjunction with [SSSL](https://github.com/PretendoNetwork/SSSL). Redirects Nintendo hostnames to an SSSL powered server.

## Config
The only 2 addresses required are for `conntest.nintendowifi.net` and `account.nintendo.net`. These can either be set using the default address or explicitly mapping them. Additional addresses may be added using `SSSL_DNS_MAP`.

| Name                       | Description                                                                            | Required                               |
|----------------------------|----------------------------------------------------------------------------------------|----------------------------------------|
| `SSSL_UDP_PORT`            | UDP port for the DNS server.                                                           | Only if not using TCP.                 |
| `SSSL_TCP_PORT`            | TPC port for the DNS server.                                                           | Only if not using UDP.                 |
| `SSSL_DNS_DEFAULT_ADDRESS` | The default address to use for `conntest.nintendowifi.net` and `account.nintendo.net`. | Only if not explicitly mapped.         |
| `SSSL_DNS_MAP_hostname`    | An explicit mapping of a hostname to an address.                                       | Only if not using the default address. |

### Example:

```
# Listen on port 5335
SSSL_UDP_PORT=5335

# Use the default address for conntest.nintendowifi.net and account.nintendo.net
SSSL_DNS_DEFAULT_ADDRESS=127.0.0.1

# Explicitly mapping addresses
SSSL_DNS_MAP_conntest.nintendowifi.net=127.0.0.1
SSSL_DNS_MAP_account.nintendo.net=127.0.0.1
SSSL_DNS_MAP_discovery.olv.nintendo.net=127.0.0.1
```

## Docker
The provided `Dockerfile` creates an image which runs both the DNS server and a custom build of nginx with TLS 1.0/1.1, and legacy SSL ciphers, enabled, as these are required for the Wii U. To build the image:

1. Use [SSSL](https://github.com/PretendoNetwork/SSSL) to create your patched SSL certficiates.
2. Copy the `ssl-cert-private-key.pem` from SSSL file to `docker/private.key` (or modify the private key name in step 4) in SSSL-DNS.
3. Copy the `cert-chain.pem` from SSSL file to `docker/ca.pem` (or modify the certificate chain name in step 4) in SSSL-DNS.
4. Modify `docker/nginx.conf` to your liking. This will be used as the nginx default configuration, *not* a separate site config. Add any additional hostnames you may need.
5. Create a `.env` file in the same directory as the `Dockerfile` following the above guide.
6. `docker build -t IMAGE_NAME .`
7. Create a container with the image, exposing ports 80, 443 and the DNS server port (by default the Wii U only supports the default port 53)