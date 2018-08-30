#----------------------------------------
# Building search server                :
#----------------------------------------

FROM golang as builder

RUN go get github.com/blevesearch/bleve
RUN go get github.com/gorilla/mux
RUN go get github.com/blevesearch/bleve-mapping-ui
RUN go get github.com/blevesearch/snowballstem
RUN go get github.com/couchbase/moss
RUN go get github.com/syndtr/goleveldb/leveldb
RUN go get golang.org/x/text/unicode/norm
RUN go get github.com/willf/bitset
RUN go get github.com/mohae/deepcopy

RUN mkdir /build
ADD searchServer/. /build/searchServer

RUN mkdir -p /go/src/github.com/projectOpenRAP/OpenRAP/
RUN ln -s /build/searchServer /build $GOPATH/src/github.com/projectOpenRAP/OpenRAP/

WORKDIR /build/searchServer

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o searchServer .

#----------------------------------------
# Building main image                   :
#----------------------------------------

FROM node:8

WORKDIR /opt/opencdn

#----------------------------------------
# Setting up supervisor                 :
#----------------------------------------

RUN apt-get update && apt-get install -y supervisor

RUN mkdir -p /var/log/supervisor

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

#----------------------------------------
# Adding SDK's                          :
#----------------------------------------

ADD dbsdk/package*.json dbsdk/
RUN npm install --prefix dbsdk/

ADD dbsdk2/package*.json dbsdk2/
RUN npm install --prefix dbsdk2/

ADD filesdk/package*.json filesdk/
RUN npm install --prefix filesdk/

ADD searchsdk/package*.json searchsdk/
RUN npm install --prefix searchsdk/

ADD telemetrysdk/package*.json telemetrysdk/
RUN npm install --prefix telemetrysdk/

ADD dbsdk/. dbsdk/
ADD dbsdk2/. dbsdk2/
ADD filesdk/. filesdk/
ADD searchsdk/. searchsdk/
ADD telemetrysdk/. telemetrysdk/

#----------------------------------------
# Adding other necessary files          :
#----------------------------------------

ADD CDN/. CDN/
ADD wait-for-it.sh .

#----------------------------------------
# Adding search server                  :
#----------------------------------------

RUN mkdir -p /opt/searchEngine/bleveDbDir
COPY --from=builder /build/searchServer CDN/

#----------------------------------------
# Adding app server                     :
#----------------------------------------

ADD appServer/package*.json appServer/
RUN npm install --prefix appServer/

ADD appServer/. appServer/

EXPOSE 9090

#----------------------------------------
# Adding devmgmt server                 :
#----------------------------------------

ADD devmgmtV2/package*.json devmgmtV2/
RUN npm install --prefix devmgmtV2/

ADD devmgmtV2/. devmgmtV2/

EXPOSE 8080

#----------------------------------------
# Adding devmgmtui                      :
#----------------------------------------

#ADD devmgmtui/package*.json devmgmtui/
#RUN npm install --prefix devmgmtui/
#RUN mkdir -p ./devgmtmui/node_modules && npm install --prefix devmgmtui/

#ADD devmgmtui/. devmgmtui/
#RUN npm run build --prefix devmgmtui/
#ADD devmgmtui/build/. /var/www/html/admin/

# Running supervisor
CMD /usr/bin/supervisord

EXPOSE 80
