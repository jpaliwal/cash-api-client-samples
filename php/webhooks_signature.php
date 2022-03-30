<?php
$exampleSignature = '1648494267.420919,AEDA2755230486477F9BF063E66852930795AF5F3CD8546F17C6B20F6FF9B059';
$exampleKey = 'whk_local_o68NxNkDvMbqR669FKoL68D4zagIFck1eKmh2tv5';
$sampleJson = json_encode(preg_replace("/\r|\n|\t/", "", '{"event_type":"charge.succeeded","payload":{"id":"8bbbb394-a8c5-4752-96c3-6ff1252a06e2","status_details":{"status":"success","message":"charge created","date_created":1648571269821,"detail":{"code":null,"message":null,"additional_details":[{"name":"card_brand","data":"visa"},{"name":"card_type","data":"credit"},{"name":"card_bin","data":"424242"},{"name":"card_last_four_digits","data":"4242"},{"name":"currency_code","data":"MXN"},{"name":"expiration_year","data":"23"},{"name":"expiration_month","data":"12"},{"name":"charge_status","data":"captured"}]}},"charge":{"description":"testing","amount_details":{"amount":4500,"currency_code":"MXN"},"payment_detail":{"credentials":{"payment_method":{"method":"credit_or_debit_card","display_name":null,"logo":null},"holacash_payment_token":null,"credit_or_debit_card":{"card_number":"424242XXXXXX4242","expiration_month":"12","expiration_year":"2023","card_validation_code":"XXX"},"pay_by_store_type":null},"address":null,"contact":null,"name":null},"processing_instructions":{"auto_capture":true},"purchase_details":{"external_system_order_id":null,"holacash_system_order_id":"a85610ac-4eab-444d-97d8-4e610011be5e","order_data":null},"consumer_details":{"external_consumer_id":null,"address":null,"contact":{"phone_1":"13212312412","email":"asdasd@holacash.mx","additional_contact_info":null},"name":{"first_name":"asdasd","second_first_name":null,"first_last_name":null,"second_last_name":null}},"shipping_details":null,"additional_details":null},"related_transactions":null,"additional_detail":null}}'));


function validateHolaCashSignature($key, $payload, $holaCashSignHeader)
{
    // Split sign header into the timestamp and signature components
    [$timestamp, $server_signature] = explode(",", $holaCashSignHeader);

    // To generate the string to sign you have to concat the timestamp, a dot and the JSON.
    // The JSON should be a single line without spaces (The default behaviour of stringify function)
    $stringToSign = $timestamp . "." . json_decode($payload, true);


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

