FROM    ubuntu

RUN apt-get update && \
    apt-get -y install curl && \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get -y install python build-essential nodejs

WORKDIR /src
ADD . /
RUN cd /src  && npm install
EXPOSE  8080
CMD ["node", "/src/server.js"]
