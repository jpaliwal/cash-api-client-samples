const https = require('https');
const Buffer = require('buffer').Buffer;

const createPaymentToken = (body, apiKey, antifraudMetadata) => {
    const antifraudMetadataBase64 = Buffer.from(JSON.stringify(antifraudMetadata)).toString('base64');
    const options = {
        method: 'POST',
        headers: {
            'X-Api-Client-Key': apiKey,
            'X-Cash-Anti-Fraud-Metadata': antifraudMetadataBase64
        },
        json: body,
        agent: false
    };
    const url = 'https://api-v2.sandbox.holacash.mx/v2/tokenization/payment_token';
    return new Promise((resolve, reject) => {
        https.request(url, options, (response) => {
            response.on('data', (buffer) => {
                const parsedData = JSON.parse(buffer.toString());
                if ([200, 201].includes(response.statusCode)) {
                    resolve(parsedData);
                    return;
                }

                reject(parsedData);
            });
        }).end();
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

module.exports = createPaymentToken;
module.exports = ANTIFRAUD_METADATA;
module.exports = CREATE_TOKEN_REQUEST;

if (require.main === module) {
    createPaymentToken(CREATE_TOKEN_REQUEST, process.env.HOLACASH_API_KEY, ANTIFRAUD_METADATA)
        .then((body) => {
            console.log(body);
        })
        .catch((body) => {
            console.error(body);
        });
}
