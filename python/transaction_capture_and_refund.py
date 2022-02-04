import requests # needs: pip install requests
import os
import json


def capture_charge(transaction_id, body, api_key):
    url = (
        "https://api-v2.sandbox.holacash.mx/v2/transaction/capture/"
        f"{transaction_id}"
    )
    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "X-Api-Client-Key": api_key,
        },
        json=body,
    )
    return response.json()


def refund_charge(transaction_id, body, api_key):
    url = (
        "https://api-v2.sandbox.holacash.mx/v2/transaction/refund/"
        f"{transaction_id}"
    )
    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "X-Api-Client-Key": api_key,
        },
        json=body,
    )
    return response.json()


API_KEY = os.environ.get("HOLACASH_API_KEY")


if __name__ == "__main__":
    from transaction_w_credit_card import (
        create_charge, CREATE_CHARGE_REQUEST, ANTIFRAUD_METADATA
    )
    CREATE_CHARGE_REQUEST["processing_instructions"]["auto_capture"] = False
    charge_response = create_charge(
        CREATE_CHARGE_REQUEST, API_KEY, ANTIFRAUD_METADATA
    )
    print(json.dumps(charge_response))
    print("Capturing charge...")
    capture_charge_response = capture_charge(
        charge_response["id"],
        {"amount": 100, "currency_code": "MXN"},
        API_KEY
    )
    print(json.dumps(capture_charge_response))
    CREATE_CHARGE_REQUEST["processing_instructions"]["auto_capture"] = True
    charge_response = create_charge(
        CREATE_CHARGE_REQUEST, API_KEY, ANTIFRAUD_METADATA
    )
    print(json.dumps(charge_response))
    print("Issuing refund...")
    refund_charge_response = refund_charge(
        charge_response["id"],
        {"amount": 100, "currency_code": "MXN"},
        API_KEY
    )
    print(json.dumps(refund_charge_response))

