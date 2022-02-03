import requests # needs: pip install requests
import os
import base64
import json


def create_payment_token(
    body: dict,
    api_key: str,
    cash_antifraud_metadata: dict
) -> dict:
    url = "https://api-v2.play.holacash.mx/v2/tokenization/payment_token"
    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "X-Api-Client-Key": api_key,
            "X-Cash-Anti-Fraud-Metadata": (
                base64.b64encode(
                    bytes(json.dumps(cash_antifraud_metadata), "utf-8")
                )
            )
        },
        json=body,
    )
    response.raise_for_status()
    return response.json()


def get_payment_token(
    token_id: str,
    api_key: str,
) -> dict:
    url = (
        "https://api-v2.play.holacash.mx/v2"
        f"/tokenization/payment_token/{token_id}"
    )
    response = requests.get(
        url,
        headers={
            "Content-Type": "application/json",
            "X-Api-Client-Key": api_key,
        },
    )
    response.raise_for_status()
    return response.json()

# Create payment token input
CREATE_TOKEN_REQUEST = {
    "credential": {
        "payment_method": {
            "method": 'credit_or_debit_card'
        },
        "credit_or_debit_card": {
            "card_number": '4242424242424242',
            "expiration_month": '12',
            "expiration_year": '2034',
            "card_validation_code": '123'
        }
    },
    "consumer_details": {
        "contact": {
            "email": 'abc@abc.com'
        },
        "name": {
            "first_name": 'Test',
            "second_first_name": 'Hola',
            "first_last_name": 'Cash',
            "second_last_name": 'User'
        }
    }
}

ANTIFRAUD_METADATA = {
    "ip_address": '192.168.0.100',
    "device_id": 'somedevice_123456',
    "user_timezone": '-06:00',
}

API_KEY = os.environ.get("HOLACASH_API_KEY")

if __name__ == "__main__":
    payment_token_response = create_payment_token(
        CREATE_TOKEN_REQUEST,
        API_KEY,
        ANTIFRAUD_METADATA,
    )
    print(json.dumps(payment_token_response))
    print("Getting token...")
    token_id = payment_token_response["token_details"]["token"]
    get_token_response = get_payment_token(
        token_id,
        API_KEY,
    )
    print(json.dumps(get_token_response))
