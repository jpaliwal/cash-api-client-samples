const https = require('https');

const captureCharge = (transactionId, body, apiKey) => {
    const options = {
        method: 'POST',
        headers: {
            'X-Api-Client-Key': apiKey,
            'Content-Type': 'application/json'
        },
    };
    const url = `https://api-v2.sandbox.holacash.mx/v2/transaction/capture/${transactionId}`;
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

const refundCharge = (transactionId, body, apiKey) => {
    const options = {
        method: 'POST',
        headers: {
            'X-Api-Client-Key': apiKey,
            'Content-Type': 'application/json'
        },
    };
    const url = `https://api-v2.sandbox.holacash.mx/v2/transaction/refund/${transactionId}`;
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

if (require.main === module) {
    const { CREATE_CHARGE_REQUEST, createCharge, ANTIFRAUD_METADATA } = require('./transaction-w-credit-card');

    // set auto_capture to false to capture the charge manually
    CREATE_CHARGE_REQUEST.processing_instructions.auto_capture = false;

    createCharge(CREATE_CHARGE_REQUEST, process.env.HOLACASH_API_KEY, ANTIFRAUD_METADATA)
        .then((body) => {
            console.log(body);
            console.log('Capturing charge...');
            const transactionId = body.id;
            captureCharge(transactionId, { amount: 100, currency_code: 'MXN' }, process.env.HOLACASH_API_KEY)
            .then(captureChargeResponse => console.log(captureChargeResponse));
        })
        .catch((body) => {
            console.error(body);
        });

    createCharge(CREATE_CHARGE_REQUEST, process.env.HOLACASH_API_KEY, ANTIFRAUD_METADATA)
        .then((body) => {
            console.log(body);
            console.log('Issuing refund...');
            const transactionId = body.id;
            refundCharge(transactionId, { amount: 100, currency_code: 'MXN' }, process.env.HOLACASH_API_KEY)
            .then(captureChargeResponse => console.log(captureChargeResponse));
        })
        .catch((body) => {
            console.error(body);
        });
}

