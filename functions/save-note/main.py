import boto3;
import json;
import urllib.parse
import urllib.request

dynamodb_resouce = boto3.resource('dynamodb')
table = dynamodb_resouce.Table('lotion-30159309-30139710')

def handler(event, context):
    print(event)

    # backend authentication check
    #how to get the token from the headers
    access_token = event['headers']['authentication']


    validation_url = f'https://www.googleapis.com/oauth2/v1/userinfo?access_token=%7Baccess_token%7D'
    print(validation_url)
    response = urllib.request.urlopen(validation_url)

    # Parse the response as JSON
    token_info = json.loads(response.read())

    # Check if the token is valid
    if 'error' in token_info:
        return {
            'statusCode': 401,
            'body': 'Authentication error'
        }
    # Delete note from DynamoDB
    body =json.loads(event['body'])
    try:
        table.put_item(Item=body)
        return {
             "isBase64Encoded": "false",
            'statusCode': 200,
            'body': json.dumps(body)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
