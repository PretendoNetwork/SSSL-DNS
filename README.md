# SSSL DNS
Custom DNS server intended to be used in conjunction with [SSSL](https://github.com/PretendoNetwork/SSSL). Redirects Nintendo hostnames to an SSSL powered server.

## Config
The only 2 addresses required are for `conntest.nintendowifi.net` and `account.nintendo.net`. These can either be set using the default address or explicitly mapping them. Additional addresses may be added using `SSSL_DNS_MAP`.

| Name                       | Description                                                                            | Required                               |
|----------------------------|----------------------------------------------------------------------------------------|----------------------------------------|
| `SSSL_UDP_PORT`            | UDP port for the DNS server.                                                           | Only if not using TCP.                 |
| `SSSL_TCP_PORT`            | TPC port for the DNS server.                                                           | Only if not using UDP.                 |
| `SSSL_DOH_PORT`            | DoH port for the DNS server. Wii U does not support DoH.                               | Should not be used.                    |
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