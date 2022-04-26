<?php
$exampleSignature = '1649141306.569352,0AB7D70E3ADE77C043D7620B4268A3165E0813119A59F79625C3A252161809B0';
$exampleKey = 'whk_play_xlKAzBOd927WMvzuqSHBcv0tblep3K9bVLL0KsrC';


$sampleJson = '{"event_type": "charge.succeeded", "payload": {"id": "974ac4ce-3a4e-4b9c-8f35-e5371aa2fbc5", "status_details": {"status": "success", "message": "charge created", "date_created": 1649141306431, "detail": {"code": null, "message": null, "additional_details": [{"name": "card_brand", "data": "visa"}, {"name": "card_type", "data": "credit"}, {"name": "card_bin", "data": "424242"}, {"name": "card_last_four_digits", "data": "4242"}, {"name": "currency_code", "data": "MXN"}, {"name": "expiration_year", "data": "24"}, {"name": "expiration_month", "data": "12"}, {"name": "charge_status", "data": "captured"}]}}, "charge": {"description": "testing", "amount_details": {"amount": 4500, "currency_code": "MXN"}, "payment_detail": {"credentials": {"payment_method": {"method": "credit_or_debit_card", "display_name": null, "logo": null}, "holacash_payment_token": null, "credit_or_debit_card": {"card_number": "424242XXXXXX4242", "expiration_month": "12", "expiration_year": "2024", "card_validation_code": "XXX"}, "pay_by_store_type": null}, "address": null, "contact": null, "name": null}, "processing_instructions": {"auto_capture": true}, "purchase_details": {"external_system_order_id": null, "holacash_system_order_id": "54f5f5f7-3a97-4095-b5e6-5e4557b3072b", "order_data": null}, "consumer_details": {"external_consumer_id": null, "address": null, "contact": {"phone_1": "Avinash OXOO", "email": "user@example.com", "additional_contact_info": null}, "name": {"first_name": "Avinash OXOO", "second_first_name": null, "first_last_name": null, "second_last_name": null}}, "shipping_details": null, "additional_details": null}, "related_transactions": null, "additional_detail": null}}';


function validateHolaCashSignature($key, $payload, $holaCashSignHeader)
{
    // Split sign header into the timestamp and signature components
    [$timestamp, $server_signature] = explode(",", $holaCashSignHeader);

    // To generate the string to sign you have to concat the timestamp, a dot and the JSON.
    // The JSON should be a single line without spaces (The default behaviour of stringify function)
    $stringToSign = $timestamp . "." . json_encode(json_decode($payload, true), JSON_UNESCAPED_SLASHES);


    // The signature is done with HMAC_SHA256 algorithm and the key you can get from the portal (Exclusive for webhooks)
    // The digest is converted to a Hex string for debugging purposes. You can use the bytes digest for the compare.
    $client_signature = strtoupper(hash_hmac('sha256', $stringToSign, $key));

    // Cryptographically compare the 2 signatures. In this case we use the timingSafeEqual function from the crypto lib in node
    // You can use any crypto comparison. Avoid at any costs comparing strings.
    $signs_are_equal = hash_equals($server_signature, $client_signature);

    return $signs_are_equal;
}

// Print the result of the comparison
echo "Are your signatures equal? ";
var_dump(validateHolaCashSignature($exampleKey, $sampleJson, $exampleSignature));
