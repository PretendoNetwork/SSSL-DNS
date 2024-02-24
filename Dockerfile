# syntax=docker/dockerfile:1

ARG openssl_version="1.1.1w"
ARG openssl_dir="/usr/local/ssl"
ARG nginx_version="1.24.0"
ARG nginx_dir="/opt/nginx"

# * Use Ubuntu 18.04 as the build image as it's known-good for TLS 1.0/1.1
FROM ubuntu:18.04 AS build

# * Install build dependencies
RUN apt-get update
RUN apt-get install -y \
	curl \
	build-essential \
	libffi-dev \
	pkg-config \
	libssl-dev \
	libpcre3 \
	libpcre3-dev \
	zlib1g-dev

# * Download and compile old OpenSSL
ARG openssl_version openssl_dir
RUN curl -fSL https://www.openssl.org/source/openssl-${openssl_version}.tar.gz | tar xz -C /tmp/
WORKDIR /tmp/openssl-${openssl_version}
RUN ./config --prefix=${openssl_dir} --openssldir=${openssl_dir} -Wl,-Bsymbolic-functions -fPIC shared
RUN make -j$(nproc)
RUN make install_sw

# * Download and compile old nginx with custom OpenSSL
ARG nginx_version nginx_dir
RUN curl -fSL http://nginx.org/download/nginx-${nginx_version}.tar.gz | tar xz -C /tmp/
WORKDIR /tmp/nginx-${nginx_version}
RUN ./configure \
	--prefix=${nginx_dir} \
	--with-http_ssl_module \
	--with-openssl=/tmp/openssl-${openssl_version} \
	--with-openssl-opt="enable-weak-ssl-ciphers" \
	--with-pcre
RUN make -j$(nproc)
RUN make install

# * Use Ubuntu as we need to install several pieces of software
FROM ubuntu:latest

# * Create required directories
RUN mkdir /app
RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /var/log/nginx

# * Move the nginx and OpenSSL to the container
ARG openssl_dir nginx_dir
COPY --from=build ${openssl_dir} ${openssl_dir}
COPY --from=build ${nginx_dir} ${nginx_dir}

# * Set PATH to include custom OpenSSL and nginx
ENV PATH="${nginx_dir}/sbin:${PATH}"
ENV LD_LIBRARY_PATH="${openssl_dir}/lib:${LD_LIBRARY_PATH}"

# * Install NodeJS and PM2
RUN apt-get update && apt-get install -y curl software-properties-common
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g pm2

# * Copy the built DNS server
COPY dist /app/dist
COPY package.json /app
COPY .env /app

# * Copy the nginx files
COPY docker/nginx.conf /opt/nginx/conf/nginx.conf
COPY docker/ca.pem /etc/nginx/ssl/ca.pem
COPY docker/private.key /etc/nginx/ssl/private.key

# * nginx ports
EXPOSE 80 443

# * Start nginx and DNS server at boot
WORKDIR /app
RUN npm i
CMD nginx -g 'daemon off;' & pm2 start . --no-daemon