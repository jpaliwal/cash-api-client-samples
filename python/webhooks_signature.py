import json
import hmac
from hashlib import sha256

exampleSignature = '1648494267.420919,AEDA2755230486477F9BF063E66852930795AF5F3CD8546F17C6B20F6FF9B059'
exampleKey = 'whk_local_o68NxNkDvMbqR669FKoL68D4zagIFck1eKmh2tv5'
sampleJson = {
    "event_type": "charge.succeeded",
    "payload": {
        "id": "8120c191-094c-49ff-87f0-5c534d0d87e0",
        "status_details": {
            "status": "success",
            "message": "charge created",
            "date_created": 1648185307808,
            "detail": {
                "code": None,
                "message": None,
                "additional_details": [
                    {
                        "name": "card_brand",
                        "data": "visa"
                    },
                    {
                        "name": "card_type",
                        "data": "credit"
                    },
                    {
                        "name": "card_bin",
                        "data": "424242"
                    },
                    {
                        "name": "card_last_four_digits",
                        "data": "4242"
                    },
                    {
                        "name": "currency_code",
                        "data": "MXN"
                    },
                    {
                        "name": "expiration_year",
                        "data": "24"
                    },
                    {
                        "name": "expiration_month",
                        "data": "12"
                    },
                    {
                        "name": "charge_status",
                        "data": "captured"
                    }
                ]
            }
        },
        "charge": {
            "description": "This is a test order",
            "amount_details": {
                "amount": 5000,
                "currency_code": "MXN"
            },
            "payment_detail": {
                "credentials": {
                    "payment_method": {
                        "method": "credit_or_debit_card",
                        "display_name": None,
                        "logo": None
                    },
                    "holacash_payment_token": None,
                    "credit_or_debit_card": {
                        "card_number": "424242XXXXXX4242",
                        "expiration_month": "12",
                        "expiration_year": "2024",
                        "card_validation_code": "XXX"
                    },
                    "pay_by_store_type": None
                },
                "address": None,
                "contact": None,
                "name": None
            },
            "processing_instructions": {
                "auto_capture": True
            },
            "purchase_details": {
                "external_system_order_id": None,
                "holacash_system_order_id": "096e06f5-ef85-4b54-b00a-e47eb0e94226",
                "order_data": None
            },
            "consumer_details": {
                "external_consumer_id": "9087321403udfs",
                "address": None,
                "contact": {
                    "phone_1": None,
                    "email": "test_user@gmail.com",
                    "additional_contact_info": None
                },
                "name": {
                    "first_name": "Test",
                    "second_first_name": "Hola",
                    "first_last_name": "Cash",
                    "second_last_name": "User"
                }
            },
            "shipping_details": None,
            "additional_details": None
        },
        "related_transactions": None,
        "additional_detail": None
    },
}


def validate_holacash_signature(key: str, payload: dict, holacash_sign: str) -> bool:
    # Split sign header into the timestamp and signature components
    split_sign = holacash_sign.split(",")
    timestamp = split_sign[0]
    server_signature = split_sign[1]
    
    # To generate the string to sign you have to concat the timestamp, a dot and the JSON.
    # The JSON should be a single line without spaces. Separators option help us to achieve this
    string_to_sign = f"{timestamp}.{json.dumps(payload, separators=(',',':'))}"
    
    # The signature is done with HMAC_SHA256 algorithm and the key you can get from the portal (Exclusive for webhooks)
    # The digest is converted to a Hex string for debugging purposes. You can use the bytes digest for the compare.
    client_signature = (
        hmac.new(bytes(key, "utf-8"), msg=bytes(string_to_sign, "utf-8"), digestmod=sha256)
        .hexdigest()
        .upper()
    )
    
    # Cryptographically compare the 2 signatures. In this case we use the timingSafeEqual function from the crypto lib in node
    # You can use any crypto comparison. Avoid at any costs comparing strings.
    signs_are_equal = hmac.compare_digest(bytes(client_signature,"utf-8"), bytes(server_signature,"utf-8"))
    return signs_are_equal

# Print the result of the comparison
print("Are your signatures equal? " + str(validate_holacash_signature(exampleKey, sampleJson, exampleSignature)))