const fs = require('fs');
const Converter = require('openapi-to-postmanv2');

const openapiData = fs.readFileSync('swagger-output.json', { encoding: 'UTF8' });

Converter.convert({ type: 'string', data: openapiData },
  { folderStrategy: 'Tags', includeAuthInfoInExample: true },
  (err, conversionResult) => {
    if (!conversionResult.result) {
      console.log('Could not convert', conversionResult.reason);
    } else {
      const collection = conversionResult.output[0].data;
      
      // Inject Pre-request Scripts globally or conditionally for Auth routes
      const encryptScript = `
        const rawBody = pm.request.body.raw;
        if (rawBody && pm.request.url.getPath().includes('/auth')) {
            const secret = pm.environment.get("crypto_secret") || "default_secret_key";
            const encrypted = CryptoJS.AES.encrypt(rawBody, secret).toString();
            pm.request.body.update(JSON.stringify({ encryptedData: encrypted }));
        }
      `;
      
      collection.event = [
        {
          listen: "prerequest",
          script: { type: "text/javascript", exec: encryptScript.split('\n') }
        }
      ];

      fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 2));
      console.log('Postman Collection generated successfully at postman_collection.json');
    }
  }
);
