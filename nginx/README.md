# SSSL Nginx configuration

Nginx configuration intended to be used in conjunction with [SSSL](https://github.com/PretendoNetwork/SSSL). It supports TLS 1.0/1.1 and legacy SSL ciphers, which are required for the Wii U.

## Configuration

This uses standard Nginx configuration files. Use these two example files as a starting point:

- `nginx.default.conf` is a simple Nginx configuration file that displays the default Nginx welcome page. It shows the basic configuration needed to create a server that uses an SSSL-patched certificate and supports the necessary legacy SSL ciphers.
- `nginx.example.conf` is an example Nginx configuration file that shows how to reverse-proxy incoming requests to a local Pretendo account server.

## Docker

The provided `Dockerfile` creates an image that compiles custom versions of OpenSSL and Nginx with support for TLS 1.0/1.1 and legacy SSL ciphers. Nginx is installed to `/opt/nginx`, so a custom configuration file should be mounted into the container at `/opt/nginx/conf/nginx.conf` as shown in the [example Docker Compose file](../compose.yml).

The default configuration requires an SSSL certificate to run. The `cert-chain.pem` and `ssl-cert-private-key.pem` files generated by [SSSL](https://github.com/PretendoNetwork/SSSL) should be mounted into the container at `/opt/nginx/ssl/` as `ca.pem` and `private.key` respectively, as shown in the [example Docker Compose file](../compose.yml).
