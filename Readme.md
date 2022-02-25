# ahref_scrapping

Simple Scrapper through API using puppeteer.


## Steps to Initiate a Server:

1. Download & install the node
2. run `npm i` command in terminal where package.json is located
3. run `npm run start`
4. When Message 'Expresso is on Port 3050' appears
5. Send a Request from Postman or from below mention Curl command.

### Request
`GET /get-dr/`

   curl --request GET \
  --url 'http://localhost:3050/get-dr?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

    {
        "Your_URL": "test.com",
        "Domain_Rating": "86"
    }
    Content-Type: application/json

## Getting the Domain Rating

### Request
`GET /get-competing-domains/`

   curl --request GET \
  --url 'http://localhost:3050/get-competing-domains?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

    {
        "Your_URL": "test.com",
        "Domain_Rating": "86",
        "Competing_Domain": "23andme.com"
    }
    Content-Type: application/json

## Getting the Domain Competant Domain

### Request
`GET /get-best-keywords/`

   curl --request GET \
  --url 'http://localhost:3050/get-best-keywords?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

    {
        "Your_URL": "test.com",
        "Domain_Rating": "86",
        "Competing_Domain": "23andme.com",
        "Selected_Keyword": "ancestry"
    }
    Content-Type: application/json

## Getting the Best Keyword

### Request
`GET /generate-article-titles/`

   curl --request GET \
  --url 'http://localhost:3050/generate-article-titles?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

    {
        "Your_URL": "test.com",
        "Domain_Rating": "86",
        "Competing_Domain": "23andme.com",
        "Selected_Keyword": "ancestry",
        "Article_Titles": [
            "1) \"My Ancestors: How They've Shaped Me\"",
            "2) \"Tracing Your Ancestry: A Guide to Finding Your Roots\"",
            "3) \"The Importance of Ancestry in Our Lives\""
        ]
    }
    Content-Type: application/json

## Getting the Article List by OpenAI

### Request
`GET /generate-surferseo-post/`

   curl --request GET \
  --url 'http://localhost:3050/generate-surferseo-post?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

    {
        "Your_Keyword": "mailchamp",
        "Response_Received": "DefaultURL",
        "URL_Received": {
            "state": "scheduled",
            "permalink_hash":"pn5vkXt_FjHuzwJaLw30cZWCu3"
            "id": 2865317
	}
}
    Content-Type: application/json

## Genearte the SUrfSEO
### Request
`GET /full-flow/`

   curl --request GET \
  --url 'http://localhost:3050/full-flow?url=test.com' \
  --header 'Authorization: Bearer YOUR_KEY'

### Response

     {
        "Your_URL": "test.com",
        "Domain_Rating": "86",
        "Competing_Domain": "23andme.com",
        "Selected_Keyword": "ancestry",
        "Article_Titles": [
            "1) \"My Ancestors: How They've Shaped Me\"",
            "2) \"Tracing Your Ancestry: A Guide to Finding Your Roots\"",
            "3) \"The Importance of Ancestry in Our Lives\""
        ]
    }
    Content-Type: application/json

## Executing the Full flow