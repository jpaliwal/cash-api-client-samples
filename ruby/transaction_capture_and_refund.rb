# frozen_string_literal: true

require 'net/https'
require 'net/http/responses'
require 'json'
require 'base64'
require_relative 'transaction_w_credit_card'

def capture_charge(transaction_id, body, api_key)
  uri = URI("https://api-v2.sandbox.holacash.mx/v2/transaction/capture/#{transaction_id}")
  request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  request['X-Api-Client-Key'] = api_key
  request.body = body.to_json

  http = Net::HTTP.new(uri.hostname, uri.port)
  http.use_ssl = true
  response = http.request(request)

  return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

  raise "Server error #{response.body}"
end

def refund_charge(transaction_id, body, api_key)
  uri = URI("https://api-v2.sandbox.holacash.mx/v2/transaction/refund/#{transaction_id}")
  request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  request['X-Api-Client-Key'] = api_key
  request.body = body.to_json

  http = Net::HTTP.new(uri.hostname, uri.port)
  http.use_ssl = true
  response = http.request(request)

  return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

  raise "Server error #{response.body}"
end

# Your API Key, if key type is secret (starts with skt) do NOT share it or use it in the frontend
# for the purposes of this script you can setup an env variable called HOLACASH_API_KEY
api_key = ENV['HOLACASH_API_KEY']

# Antifraud metadata
# Check https://developers.holacash.mx/openapi/cashspa/#tag/tokenization for details on
# possible values on X-Cash-Anti-Fraud-Metadata
antifraud_metadata = { ip_address: '192.168.0.100', device_id: 'somedevice_123456', user_timezone: '-06:00' }

create_charge_request = {
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
    auto_capture: false
  }
}

if __FILE__ == $PROGRAM_NAME
  puts 'Creating uncaptured charge with credit card'
  create_charge_w_cc_response = create_charge(create_charge_request, api_key, antifraud_metadata)
  puts "Charge created: #{create_charge_w_cc_response}"

  transaction_id = create_charge_w_cc_response['id']
  puts "Capturing transaction_id=#{transaction_id}"
  capture_charge_response = capture_charge(
    transaction_id,
    { amount: 100, currency_code: 'MXN' },
    api_key
  )
  puts "Charge captured: #{capture_charge_response}"

  puts "Issuing refund"
  refund_charge_response = refund_charge(
    transaction_id,
    { amount: 100, currency_code: 'MXN' },
    api_key
  )
  puts "Charge refunded: #{refund_charge_response}"
end
