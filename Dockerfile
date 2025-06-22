FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        poppler-utils \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV SEPARATOR=","
ENV QUOTE="\""
COPY traderepublic.js /app
COPY start.sh /app
RUN chmod 777 /app/start.sh

# Startbefehl
CMD ["./start.sh"]