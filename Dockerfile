# Use the official Deno image
FROM denoland/deno:2.4.2@sha256:467d41805c2f531a48f84dfcd1b4f9244b8ebdbd505f752011d6d1b7daacc489

# Use root to install mysql client
USER root

# Install mysql client
RUN apt-get update && apt-get install -y default-mysql-client && apt-get clean

WORKDIR /app

COPY backend/ ./backend/
COPY source/ ./source/
COPY templates/ ./templates/
COPY deno.json .
COPY deno.lock .

RUN chown -R deno:deno /app

USER deno

RUN deno run --allow-read --allow-write backend/build.ts

EXPOSE 8000

CMD [\
  "deno",\
  "run",\
  "--allow-net",\
  "--allow-read",\
  "--allow-write",\
  "--allow-env",\
  "--allow-run=mysql",\
  "--allow-sys=osRelease",\
  "backend/app.ts"\
]
