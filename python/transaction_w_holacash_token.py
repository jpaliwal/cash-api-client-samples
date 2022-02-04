import requests # needs: pip install requests
import os
import base64
import json


# Creates a charge
def create_charge(body, api_key, cash_antifraud_metadata):
    url = "https://api-v2.sandbox.holacash.mx/v2/transaction/charge"
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
    return response.json()


ANTIFRAUD_METADATA = {
    "ip_address": '192.168.0.100',
    "device_id": 'somedevice_123456',
    "user_timezone": '-06:00',
}

API_KEY = os.environ.get("HOLACASH_API_KEY")

CREATE_CHARGE_REQUEST = {
    "description": 'This is a test description',
    "amount_details": {
      "amount": 100,
      "currency_code": 'MXN'
    },
    "payment_detail": {
        "credentials": {
            "payment_method": {
                "method": 'pay_with_holacash_payment_token'
            },
            "holacash_payment_token": {
                "payment_token": "CHANGE_ME"
            }
        }
    },
    "consumer_details": {
        "external_consumer_id": 'your_consumer_id',
        "contact": {
          "email": 'test_user@example.com'
        },
        "name": {
            "first_name": 'Test',
            "second_first_name": 'Hola',
            "first_last_name": 'Cash',
            "second_last_name": 'User'
        }
    },
    "processing_instructions": {
      "auto_capture": True
    }
}


if __name__ == "__main__":
    from payment_token import create_payment_token, CREATE_TOKEN_REQUEST
    token_response = create_payment_token(
        CREATE_TOKEN_REQUEST, API_KEY, ANTIFRAUD_METADATA
    )
    token_id = token_response["token_details"]["token"]
    CREATE_CHARGE_REQUEST[
        "payment_detail"
    ]["credentials"]["holacash_payment_token"]["payment_token"] = token_id

    payment_token_response = create_charge(
        CREATE_CHARGE_REQUEST,
        API_KEY,
        ANTIFRAUD_METADATA,
    )
    print(json.dumps(payment_token_response))
