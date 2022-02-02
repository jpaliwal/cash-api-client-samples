const https = require('https');
const Buffer = require('buffer').Buffer;


const createPaymentToken = (body, apiKey, antifraudMetadata) => {
    const antifraudMetadataBase64 = Buffer.from(JSON.stringify(antifraudMetadata)).toString('base64');
    const options = {
        method: 'POST',
        headers: {
            'X-Api-Client-Key': apiKey,
            'X-Cash-Anti-Fraud-Metadata': antifraudMetadataBase64,
            'Content-Type': 'application/json'
        },
    };
    const url = 'https://api-v2.sandbox.holacash.mx/v2/tokenization/payment_token';
    return new Promise((resolve, reject) => {
        const request = https.request(url, options, (response) => {
            let data = ''
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                const parsedData = JSON.parse(data);
                if ([200, 201].includes(response.statusCode)) {
                    resolve(parsedData);
                    return;
                }
                reject(parsedData);
            });
        }).on('error', err => reject(err));
        request.write(JSON.stringify(body));
        request.end();
    });
};

const getPaymentToken = (tokenId, apiKey) => {
    const options = {
        method: 'GET',
        headers: {
            'X-Api-Client-Key': apiKey,
            'Content-Type': 'application/json'
        },
    };
    const url = `https://api-v2.sandbox.holacash.mx/v2/tokenization/payment_token/${tokenId}`;
    return new Promise((resolve, reject) => {
        const request = https.request(url, options, (response) => {
            let data = ''
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                const parsedData = JSON.parse(data);
                if ([200, 201].includes(response.statusCode)) {
                    resolve(parsedData);
                    return;
                }
                reject(parsedData);
            });
        }).on('error', err => reject(err));
        request.end();
    });
};

const ANTIFRAUD_METADATA = {
    ip_address: '192.168.0.100',
    device_id: 'somedevice_123456',
    user_timezone: '-06:00'
};

const CREATE_TOKEN_REQUEST = {
    credential: {
        payment_method: {
            method: 'credit_or_debit_card'
        },
        credit_or_debit_card: {
            card_number: '4242424242424242',
            expiration_month: '12',
            expiration_year: '2034',
            card_validation_code: '123'
        }
    },
    consumer_details: {
        contact: {
            email: 'abc@abc.com'
        },
        name: {
            first_name: 'Test',
            second_first_name: 'Hola',
            first_last_name: 'Cash',
            second_last_name: 'User'
        }
    }
};

// To reuse in other examples
exports.createPaymentToken = createPaymentToken;
exports.ANTIFRAUD_METADATA = ANTIFRAUD_METADATA;
exports.CREATE_TOKEN_REQUEST = CREATE_TOKEN_REQUEST;

if (require.main === module) {
    createPaymentToken(CREATE_TOKEN_REQUEST, process.env.HOLACASH_API_KEY, ANTIFRAUD_METADATA)
        .then((body) => {
            console.log(body);
            console.log('Getting token...');
            const tokenId = body.token_details.token;
            getPaymentToken(tokenId, process.env.HOLACASH_API_KEY)
            .then(tokenResponse => console.log(tokenResponse));
        })
        .catch((body) => {
            console.error(body);
        });
}
