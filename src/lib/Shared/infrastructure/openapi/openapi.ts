const specUrl = "/api/v1/openapi.json";

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "WhatsApp n8n Server API",
    version: "1.0.0",
    description:
      "REST API for automating WhatsApp messaging through whatsapp-web.js and n8n.",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    {
      name: "System",
      description: "Health and documentation endpoints.",
    },
    {
      name: "WhatsApp",
      description:
        "Endpoints for QR access, sending, replying and broadcasting messages.",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "Redirect to the Scalar documentation UI.",
        responses: {
          302: {
            description: "Redirect to the documentation page.",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check server health.",
        responses: {
          200: {
            description: "Server is healthy.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/qr-code": {
      get: {
        tags: ["WhatsApp"],
        summary: "Get the current WhatsApp QR state.",
        security: [{ apiKeyAuth: [] }],
        responses: {
          200: {
            description: "QR available or WhatsApp already connected.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QrCodeResponse" },
              },
            },
          },
          202: {
            description: "Client is still initializing.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QrCodeResponse" },
              },
            },
          },
          401: {
            description: "Missing or invalid API key.",
          },
        },
      },
    },
    "/status": {
      get: {
        tags: ["WhatsApp"],
        summary: "Get the current WhatsApp connection status.",
        security: [{ apiKeyAuth: [] }],
        responses: {
          200: {
            description: "Current WhatsApp connection status.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WhatsappStatusResponse",
                },
              },
            },
          },
          401: {
            description: "Missing or invalid API key.",
          },
        },
      },
    },
    "/send-message": {
      post: {
        tags: ["WhatsApp"],
        summary: "Send a message to a WhatsApp chat.",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SendMessageRequest" },
              examples: {
                default: {
                  summary: "Send a text message",
                  value: {
                    chatId: "51123456789",
                    message: "Hello from WhatsApp n8n Server",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message sent successfully.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SendMessageResponse" },
              },
            },
          },
          400: { description: "Invalid request data." },
          401: { description: "Missing or invalid API key." },
          404: { description: "Recipient not found." },
          500: { description: "Unexpected server error." },
        },
      },
    },
    "/reply-message": {
      post: {
        tags: ["WhatsApp"],
        summary: "Reply to an existing WhatsApp message.",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReplyMessageRequest" },
              examples: {
                default: {
                  summary: "Reply to a message",
                  value: {
                    chatId: "51123456789",
                    messageId: "MESSAGE_ID",
                    message: "This is a reply from WhatsApp n8n Server",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Reply sent successfully.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReplyMessageResponse" },
              },
            },
          },
          400: { description: "Invalid request data." },
          401: { description: "Missing or invalid API key." },
          404: { description: "Target message not found." },
          500: { description: "Unexpected server error." },
        },
      },
    },
    "/broadcast-message": {
      post: {
        tags: ["WhatsApp"],
        summary: "Send the same message to multiple chats.",
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BroadcastMessageRequest" },
              examples: {
                default: {
                  summary: "Broadcast to several chats",
                  value: {
                    chatIds: ["51123456789", "51987654321", "51555666777"],
                    message: "Hello everyone from WhatsApp n8n Server.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Broadcast sent successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BroadcastMessageResponse",
                },
              },
            },
          },
          400: { description: "Invalid request data." },
          401: { description: "Missing or invalid API key." },
          404: { description: "One of the recipients was not found." },
          500: { description: "Unexpected server error." },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["status", "service", "timestamp"],
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "whatsapp-n8n-server" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      QrCodeResponse: {
        type: "object",
        required: ["message", "status"],
        properties: {
          message: { type: "string" },
          status: {
            type: "string",
            enum: [
              "initializing",
              "qr",
              "authenticating",
              "ready",
              "disconnected",
            ],
          },
          qrCode: { type: "string" },
        },
      },
      WhatsappStatusResponse: {
        type: "object",
        required: ["status", "service", "timestamp"],
        properties: {
          status: {
            type: "string",
            enum: [
              "initializing",
              "qr",
              "authenticating",
              "ready",
              "disconnected",
            ],
          },
          service: { type: "string", example: "whatsapp" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      SendMessageRequest: {
        type: "object",
        required: ["chatId", "message"],
        properties: {
          chatId: { type: "string", example: "51123456789" },
          message: { type: "string", minLength: 1 },
        },
      },
      SendMessageResponse: {
        type: "object",
        required: ["status", "message", "data"],
        properties: {
          status: { type: "string", example: "OK" },
          message: { type: "string", example: "Message sent successfully" },
          data: {
            type: "object",
            required: ["chatId", "message"],
            properties: {
              chatId: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      ReplyMessageRequest: {
        type: "object",
        required: ["chatId", "messageId", "message"],
        properties: {
          chatId: { type: "string", example: "51123456789" },
          messageId: { type: "string", example: "MESSAGE_ID" },
          message: { type: "string", minLength: 1 },
        },
      },
      ReplyMessageResponse: {
        type: "object",
        required: ["status", "message", "data"],
        properties: {
          status: { type: "string", example: "OK" },
          message: { type: "string", example: "Message replied successfully" },
          data: {
            type: "object",
            required: ["chatId", "messageId", "message"],
            properties: {
              chatId: { type: "string" },
              messageId: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      BroadcastMessageRequest: {
        type: "object",
        required: ["chatIds", "message"],
        properties: {
          chatIds: {
            type: "array",
            minItems: 1,
            items: { type: "string", example: "51123456789" },
          },
          message: { type: "string", minLength: 1 },
        },
      },
      BroadcastMessageResponse: {
        type: "object",
        required: ["status", "message", "data"],
        properties: {
          status: { type: "string", example: "OK" },
          message: {
            type: "string",
            example: "Broadcast message sent successfully",
          },
          data: {
            type: "object",
            required: ["chatIds", "message"],
            properties: {
              chatIds: {
                type: "array",
                items: { type: "string" },
              },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;

export const renderScalarHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WhatsApp n8n Server API</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0b1020;
      }

      html,
      body {
        height: 100%;
        margin: 0;
      }

      body {
        background:
          radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 35%),
          linear-gradient(180deg, #0b1020 0%, #111827 100%);
      }

      #app {
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      if (!window.Scalar?.createApiReference) {
        document.getElementById('app').innerHTML = '<p style="color:white;padding:24px;font-family:monospace">Scalar failed to load.</p>';
      } else {
        window.Scalar.createApiReference('#app', {
          url: '${specUrl}',
        });
      }
    </script>
  </body>
</html>`;
