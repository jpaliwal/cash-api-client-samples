const https = require('https');
const Buffer = require('buffer').Buffer;

const createCharge = (body, apiKey, antifraudMetadata) => {
    const antifraudMetadataBase64 = Buffer.from(JSON.stringify(antifraudMetadata)).toString('base64');
    const options = {
        method: 'POST',
        headers: {
            'X-Api-Client-Key': apiKey,
            'X-Cash-Anti-Fraud-Metadata': antifraudMetadataBase64,
            'Content-Type': 'application/json'
        },
    };
    const url = 'https://sandbox.api.holacash.mx/v2/transaction/charge';
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

const ANTIFRAUD_METADATA = {
    ip_address: '192.168.0.100',
    device_id: 'somedevice_123456',
    user_timezone: '-06:00'
};

const CREATE_CHARGE_REQUEST = {
    description: 'This is a test description',
    amount_details: {
        amount: 100,
        currency_code: 'MXN'
    },
    payment_detail: {
        credentials: {
            payment_method: {
                method: 'credit_or_debit_card'
            },
            credit_or_debit_card: {
                card_number: "4242424242424242",
                expiration_month: "12",
                expiration_year: "2024",
                card_validation_code: "324"
            }
        }
    },
    consumer_details: {
        external_consumer_id: 'your_consumer_id',
        contact: {
            email: 'test_user@example.com'
        },
        name: {
            first_name: 'Test',
            second_first_name: 'Hola',
            first_last_name: 'Cash',
            second_last_name: 'User'
        }
    },
    processing_instructions: {
        auto_capture: true
    }
};

// To reuse in another example
exports.createCharge = createCharge;
exports.CREATE_CHARGE_REQUEST = CREATE_CHARGE_REQUEST;
exports.ANTIFRAUD_METADATA = ANTIFRAUD_METADATA;

if (require.main === module) {
    createCharge(CREATE_CHARGE_REQUEST, process.env.HOLACASH_API_KEY, ANTIFRAUD_METADATA)
        .then((body) => {
            console.log(body);
        })
        .catch((body) => {
            console.error(body);
        });
}

