# Upload Example with AI-Powered Security

This project demonstrates a simple file upload endpoint and deployed on [Azion web platform](https://www.azion.com/). The main purpose is to showcase how to use **Azion's AI Inference** to protect upload endpoints from malicious content.

## Overview

The application provides a `/upload` endpoint that accepts file uploads and returns basic file information (filename, extension, and MIME type). The security layer uses Azion's AI Inference to analyze uploaded content and block potentially malicious files before they reach your application.

## Features

- 🚀 Simple file upload endpoint
- 🛡️ AI-powered security at the edge using [Azion AI Inference](https://www.azion.com/en/products/ai-inference/)
- 📊 Returns file metadata (filename, extension, MIME type)
- ✅ Comprehensive unit tests with Vitest
- 🌐 Deployed on [Azion web platform](https://www.azion.com/)

## Installation

Install dependencies using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Development

### Build Command

```bash
npx edge-functions@latest build
```

### Run Local Development Server

```bash
npx edge-functions@latest dev
```

### Run Tests

```bash
npm test
# or for watch mode
npm run test:watch
```

## API Endpoints

### POST /upload

Upload a file and receive metadata information.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with a `file` field

**Response:**

```json
{
  "filename": "document.pdf",
  "extension": "pdf",
  "mimeType": "application/pdf"
}
```

**Error Response:**

```json
{
  "error": "No file uploaded"
}
```

**Example using cURL:**

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/your/file.pdf"
```

## AI-Powered Security with Azion Firewall

This project demonstrates how to protect upload endpoints using Azion's AI Inference at the Firewall level. The AI analyzes uploaded content in real-time and blocks malicious files before they reach your application.

### Firewall Function

The following function should be configured in your Azion Firewall to protect the upload endpoint:

```javascript
async function handleRequest(event) {
  try {
    const requestBody = await event.request.text();
    const { model, action, prompt } = event.args;
    const contentType = event.request.headers.get("content-type");

    // Allow images
    if (contentType && contentType.startsWith("image/")) {
      event.continue();
      return;
    }

    // Decodes the content if it is base64
    const decodedBody = contentType && contentType.includes("base64")
      ? atob(requestBody.split(",")[1])
      : requestBody;

    // Calls the model via Azion.AI.run
    const modelResponse = await Azion.AI.run(model, {
      stream: false,
      seed: 42,
      temperature: 0,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `${prompt}` 
        },
        {
          role: "user",
          content: decodedBody
        }
      ]
    });

    // Extracts the model response
    const result = modelResponse?.choices?.[0]?.message?.content?.trim();

    if (result === "true") {
      event.console.warn(`[AI] ${result}`);
      event[action](); // Executes the action (ex: deny)
      return;
    }
  } catch (err) {
    event.console.error("Error handling request:", err.message);
    event.continue();
    return;
  }

  event.continue(); // If not malicious, let it pass
}

// Maintains the event listener
addEventListener("firewall", event => {
  event.waitUntil(handleRequest(event));
});
```

### Function Arguments

Configure the following arguments in your Azion Firewall rule:

```json
{
  "model": "casperhansen-mistral-small-24b-instruct-2501-awq",
  "prompt": "You are a security assistant specialized in detecting malicious PDF files. Analyze the provided content carefully and return 'true' only if you identify malicious content, such as embedded scripts, suspicious patterns, or known vulnerabilities. Do not classify a file as malicious based solely on its structure or the presence of a PDF header. If the content is safe or does not contain clear malicious indicators, return 'false'. Do not provide any additional explanation or output.",
  "action": "deny"
}
```

### How It Works

1. **Request Interception**: The firewall function intercepts all requests to the upload endpoint
2. **Content Analysis**: The AI model analyzes the uploaded content using the specified prompt
3. **Decision Making**: If malicious content is detected (`result === "true"`), the request is denied
4. **Action Execution**: The specified action (e.g., `deny`) is executed to block the request
5. **Safe Passage**: Safe content is allowed to continue to the application

### Configuration Parameters

- **model**: The AI model to use for content analysis (Mistral Small 24B Instruct)
- **prompt**: Instructions for the AI on how to analyze and classify content
- **action**: The action to take when malicious content is detected (`deny`, `drop`, etc.)

### Benefits

- ✅ **Edge-Level Protection**: Security checks happen at the edge, before reaching your origin
- ✅ **AI-Powered Detection**: Advanced threat detection using state-of-the-art language models
- ✅ **Low Latency**: Fast analysis and response times
- ✅ **Customizable**: Adjust prompts and models for different use cases
- ✅ **Cost-Effective**: Blocks malicious requests early, reducing server load

## Project Structure

```plaintext
upload-example/
├── src/
│   ├── app.ts           # Main application with routes
│   ├── index.ts         # Entry point
│   └── index.test.ts    # Unit tests
├── azion.config.mjs     # Azion deployment configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vitest.config.ts     # Vitest test configuration
```

## License

ISC
