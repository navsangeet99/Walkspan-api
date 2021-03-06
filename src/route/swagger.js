/**
 * @file swagger.js
 *
 * Auto generates API documentation
 * located at '/docs'
 */
const swaggerJsdoc = require("swagger-jsdoc");

const router = require("express").Router();

// Library that reads through comments and auto generates api docs
const openapiSpecification = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Walkspan API',
            version: '1.0.0',
            description: `
# Getting Started
In order to access our APIs, you will need an API Key. This key is generated when you register for our service and should be kept secret for all interactions with our resources.

# Widget
All of our api's can also be queried to return a widget instead of a JSON response.
To request a widget, just append \`&widget=true\` to the end of the endpoint.

To embed the requested widget to your webpage, include the code returned by the endpoint inside of an iframe html tag.

Example:
\`\`\`
    <iframe>
     {HTML CODE RETURNED FROM ENDPOINT}
    </iframe>
\`\`\`

# Authentication

Walkspan offers one form of authentication:
  - API Key
            `,
            'x-logo': {
                url: 'https://images.squarespace-cdn.com/content/5c9181caebfc7f1f4596f4bf/1553817211803-YQU03EYT42PP0SUGI6XR/WALKSPAN+new+logo_1500.png?format=1500w&content-type=image%2Fpng',
                altText: 'Walkspan Logo'
            }
        },
        servers: [
            {
                url: 'https://api.walkspan.com',
                description: 'Default server'
            }
        ],
        externalDocs: {
            description: 'Find out more about Walkspan!',
            url: 'https://www.walkspan.com'
        },
        tags: [
            {
                name: 'essentials_api',
                'x-displayName': 'The Lifestyle Essentials API',
                description: 'Ways to get Walkspan\'s score model for a specified location.'
            },
            {
                name: 'score_api',
                'x-displayName': 'The Score API',
                description: 'Ways to get Walkspan\'s score model for a specified location.'
            },
            {
                name: 'score_model',
                'x-displayName': 'The Score Model',
                description: `<SchemaDefinition schemaRef="#/components/schemas/ScoreModel" />`
            },
            {
                name: 'error_model',
                'x-displayName': 'The Error Model',
                description: `<SchemaDefinition schemaRef="#/components/schemas/Error" />`
            }
        ]
    },
    apis: [
        './src/route/*.js',
        './openapi-templates/*.yaml'
    ]
});

router.get('/', (req, res, next) => {
    // Generates the HTML code for the redoc documentation displayed at /docs

    return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Walkspan API Docs</title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>
            <redoc id="redoc-container"></redoc>
            <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0-rc.48/bundles/redoc.standalone.min.js"> </script>
            <script src="https://cdn.jsdelivr.net/gh/wll8/redoc-try@1.3.4/dist/try.js"></script>
            <script>
                initTry({
                    openApi: '${req.originalUrl}/openapi.json',
                    redocOptions: {
                        hideDownloadButton: true
                    }
                });
            </script>
          </body>
        </html>
    `);
});

router.get('/openapi.json', (req, res) => {
    // Returns the json containing the api docs auto generated by this file
    return res.status(200).json(openapiSpecification);
});

module.exports = router;
