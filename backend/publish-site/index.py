import json
import os
import psycopg2
import random
import string
from typing import Dict, Any

def generate_site_id() -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Publish website and generate shareable link or retrieve published site
    Args: event with httpMethod (POST to publish, GET to retrieve), body with html/css/js
    Returns: HTTP response with site_id or site content
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            html_content = body_data.get('html', '')
            css_content = body_data.get('css', '')
            js_content = body_data.get('js', '')
            project_name = body_data.get('projectName', '')
            description = body_data.get('description', '')
            
            site_id = generate_site_id()
            
            cur.execute(
                "INSERT INTO published_sites (site_id, project_name, html_content, css_content, js_content, description) VALUES (%s, %s, %s, %s, %s, %s)",
                (site_id, project_name, html_content, css_content, js_content, description)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'siteId': site_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters') or {}
            site_id = params.get('id', '')
            
            if not site_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing site id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT html_content, css_content, js_content, project_name FROM published_sites WHERE site_id = %s",
                (site_id,)
            )
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'text/html',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': '<html><body><h1>Site not found</h1></body></html>',
                    'isBase64Encoded': False
                }
            
            html_content, css_content, js_content, project_name = result
            
            cur.execute(
                "UPDATE published_sites SET views = views + 1 WHERE site_id = %s",
                (site_id,)
            )
            conn.commit()
            
            full_html = f"{html_content}\n<style>{css_content}</style>\n<script>{js_content}</script>"
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/html',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': full_html,
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
