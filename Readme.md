# ahref_scrapping

Simple Scrapper through API using puppeteer.


## Steps to Initiate a Server:

1. Download & install the node
2. run `npm i` command in terminal where package.json is located
3. run `npm run start`
4. When Message 'Expresso is on Port 3050' appears
5. Send a Request from Postman or from below mention Powershell command.


## For executing it through Powershell
Paste the below command in Powershell window and press Enter

    $response = Invoke-WebRequest -Uri 'http://localhost:3050/find_keywords?url=test.com' -Method GET 
    
##### Sample Request Example:

Sample Request Format:

URL with endpoint - `<localhost>`:3050/find_keywords

Request Method - GET

Query Parameters - 

    1. url = test.com


