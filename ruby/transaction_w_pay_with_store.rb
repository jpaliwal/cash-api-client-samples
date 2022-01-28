# frozen_string_literal: true

require 'net/https'
require 'json'
require 'base64'

# Creates a charge
def create_charge(body, api_key, cash_antifraud_metadata)
  uri = URI('https://api-v2.sandbox.holacash.mx/v2/transaction/charge')
  request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  request['X-Api-Client-Key'] = api_key
  request['X-Cash-Anti-Fraud-Metadata'] = Base64.encode64(cash_antifraud_metadata.to_json).gsub("\n", '')
  request.body = body.to_json

  http = Net::HTTP.new(uri.hostname, uri.port)
  http.use_ssl = true
  response = http.request(request)

  JSON.parse(response.body)
end

# Your API Key, if key type is secret (starts with skt) do NOT share it or use it in the frontend
# for the purposes of this script you can setup an env variable called HOLACASH_API_KEY
api_key = ENV['HOLACASH_API_KEY']

# Antifraud metadata
# Check https://developers.holacash.mx/openapi/cashspa/#tag/tokenization for details on
# possible values on X-Cash-Anti-Fraud-Metadata
antifraud_metadata = { ip_address: '192.168.0.100', device_id: 'somedevice_123456', user_timezone: '-06:00' }

if __FILE__ == $PROGRAM_NAME
  create_charge_request = {
    description: 'This is a test description',
    amount_details: {
      amount: 100,
      currency_code: 'MXN'
    },
    payment_detail: {
      credentials: {
        payment_method: {
          method: 'pay_with_store'
        },
        pay_by_store_type: 'paynet'
      }
    },
    consumer_details: {
      external_consumer_id: 'your_consumer_id',
      contact: {
          email: 'test_user@example.com'
      }
    },
    processing_instructions: {
      auto_capture: true
    }
  }

  puts 'Creating charge with pay in store'
  create_charge_w_cc_response = create_charge(create_charge_request, api_key, antifraud_metadata)
  puts "Charge created: #{create_charge_w_cc_response}"
end
