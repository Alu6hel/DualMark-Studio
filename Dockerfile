# DualMark Studio Headless Packaging Automation Microservice
FROM node:20-alpine

WORKDIR /app

COPY cli/ /app/cli/
COPY package.json /app/

RUN chmod +x /app/cli/dualmark-cli.mjs

ENTRYPOINT ["node", "/app/cli/dualmark-cli.mjs"]
CMD ["--format", "json"]
