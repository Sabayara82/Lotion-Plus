# add your get-notes function here
import json
import boto3
import urllib.parse
import urllib.request
from boto3.dynamodb.conditions import Key, Attr
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion-30159309-30139710")


def handler(event, context):
    access_token = event['headers']['authentication']
    validation_url = f'https://www.googleapis.com/oauth2/v1/userinfo?access_token=%7Baccess_token%7D'
    response = urllib.request.urlopen(validation_url)

    # Parse the response as JSON
    token_info = json.loads(response.read())

    # Check if the token is valid
    if 'error' in token_info:
        return {
            'statusCode': 401,
            'body': 'Authentication error'
        }


    try:
        email = event['queryStringParameters']['email']
        response = table.query(KeyConditionExpression=Key('email').eq(email))

        if response['Count'] == 0:
            response = {
                "statusCode": 200,
                "body": json.dumps({
                    'message': "Success",
                    'data': []
                })
            }
            return response
        response = {
            "statusCode": 200,
            "body": json.dumps({
                'message': "Success",
                'data': response['Items']
            })
        }
        return response

    except Exception as e:
        response={
            "statusCode":404,
            "body":json.dumps(
                {
                    'message':"It is not working."
                }
            )
        }
        return response
