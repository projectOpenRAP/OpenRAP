#!/bin/bash
searchServerURL="http://localhost:9095"
indexName="myindex"

echo "Creating an index: $indexName into the searchServer ..."
sleep 1
curl -X PUT $searchServerURL/api/search/v2/index/$indexName 

for doc in abc.json xyz.json
do
    echo "Adding document: $doc into index: $indexName"
    sleep 1
    curl -X PUT $searchServerURL/api/search/v2/index/$indexName/document/$doc -d @$doc 
done

echo "Searching word: ekstep in the index : $indexName"
sleep 1
curl -X POST $searchServerURL/api/search/v2/index/$indexName/_search -d '{"query":{"query": "ekstep"}}'

docId="abc.json"
echo "Get documentById  for doc: $docId" 
sleep 1
curl -X GET $searchServerURL/api/search/v2/index/$indexName/document/$docId

echo "Searching word: game in the index : $indexName"
sleep 1
curl -X POST $searchServerURL/api/search/v2/index/$indexName/_search -d '{"query":{"query": "game"}}'


