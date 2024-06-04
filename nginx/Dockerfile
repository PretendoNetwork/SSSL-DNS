# syntax=docker/dockerfile:1

ARG openssl_version="1.1.1w"
ARG openssl_dir="/opt/openssl"
ARG nginx_version="1.24.0"
ARG nginx_dir="/opt/nginx"


FROM ubuntu:24.04 AS build

# * Install build dependencies
RUN apt-get update \
	&& apt-get install -y \
	curl \
	build-essential \
	libffi-dev \
	pkg-config \
	libssl-dev \
	libpcre3 \
	libpcre3-dev \
	zlib1g-dev \
	&& apt-get clean

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
	--without-http_rewrite_module
RUN make -j$(nproc)
RUN make install


FROM ubuntu:24.04 AS final

# * Create required directories
RUN mkdir -p /var/log/nginx

# * Move the nginx and OpenSSL to the container
ARG openssl_dir nginx_dir
COPY --from=build ${openssl_dir} ${openssl_dir}
COPY --from=build ${nginx_dir} ${nginx_dir}

# * Set PATH to include custom OpenSSL and nginx
ENV PATH="${nginx_dir}/sbin:${PATH}"
ENV LD_LIBRARY_PATH="${openssl_dir}/lib:${LD_LIBRARY_PATH}"

# * Copy the default nginx configuration
COPY nginx.default.conf /opt/nginx/conf/nginx.conf

# * nginx ports
EXPOSE 80 443

# * Start nginx
CMD ["nginx", "-g", "daemon off;"]
