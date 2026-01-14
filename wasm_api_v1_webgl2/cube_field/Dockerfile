# Use the official Rust image as the base
# https://hub.docker.com/layers/library/rust/latest/images/sha256-612db8ad5234fec88a2811e6c8dfca298a97192bfc9a81977b92e200e51bf5ad
FROM rust@sha256:612db8ad5234fec88a2811e6c8dfca298a97192bfc9a81977b92e200e51bf5ad

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    pkg-config \
    cmake \
    curl \
    unzip \
    vim \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install WebAssembly things
RUN cargo install wasm-pack wasm-bindgen-cli

# Install wasm-opt for WebAssembly optimizations (via Binaryen)
RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_125/binaryen-version_125-x86_64-linux.tar.gz | tar -xz -C /usr/local --strip-components=1

# Install WebAssembly target for Rust
RUN rustup target add wasm32-unknown-unknown

# Set up the working directory
WORKDIR /app

# Copy Cargo.toml and Cargo.lock for dependency caching
COPY app/.cargo ./cargo
COPY app/Cargo.* ./

# Copy the src/main.rs so cargo fetch doesn't complain about missing [bin]. connected as volume later
COPY app/src ./src

# Pre-fetch dependencies
RUN cargo fetch

# Use bash instead of sh (e.g. in Docker Exec window)
RUN ln -sf /bin/bash /bin/sh

# Expose the port to serve on
EXPOSE 8080

# Default command: Use bash for flexibility during container runs
CMD ["bash"]
