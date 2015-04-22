FROM    ubuntu

RUN apt-get update && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get -y install python build-essential nodejs

RUN npm install
WORKDIR /src
ADD . /src
EXPOSE  8080
CMD ["node", "/src/server.js"]
