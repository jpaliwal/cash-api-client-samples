# frozen_string_literal: true

require 'net/https'
require 'net/http/responses'
require 'json'
require 'base64'

# Creates a payment token to be used when issuing charges
def create_payment_token(body, api_key, cash_antifraud_metadata)
  uri = URI('https://api-v2.play.holacash.mx/v2/tokenization/payment_token')
  request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
  request['X-Api-Client-Key'] = api_key
  request['X-Cash-Anti-Fraud-Metadata'] = Base64.encode64(cash_antifraud_metadata.to_json).gsub("\n", '')
  request.body = body.to_json

  http = Net::HTTP.new(uri.hostname, uri.port)
  http.use_ssl = true
  response = http.request(request)

  return JSON.parse(response.body) if response.is_a?(Net::HTTPSuccess)

  raise "Server error #{response.body}"
end

# Gets an existing payment token
def get_payment_token(token_id, api_key)
  uri = URI("https://api-v2.play.holacash.mx/v2/tokenization/payment_token/#{token_id}")
  request = Net::HTTP::Get.new(uri, 'Content-Type' => 'application/json')
  request['X-Api-Client-Key'] = api_key
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

# Create payment token input
CREATE_TOKEN_REQUEST = {
    credential: {
        payment_method: {
            method: 'credit_or_debit_card'
        },
        credit_or_debit_card: {
            card_number: '4242424242424242',
            expiration_month: '12',
            expiration_year: '2034',
            card_validation_code: '123'
        }
    },
    consumer_details: {
        contact: {
            email: 'abc@abc.com'
        },
        name: {
            first_name: 'Test',
            second_first_name: 'Hola',
            first_last_name: 'Cash',
            second_last_name: 'User'
        }
    }
}

if __FILE__ == $PROGRAM_NAME
  puts 'Creating payment token...'
  create_payment_token_response = create_payment_token(create_token_request, api_key, antifraud_metadata)
  puts "Create token response: #{create_payment_token_response}"
  puts 'Token created, getting recently created token'
  token_id = create_payment_token_response['token_details']['token']
  get_token_response = get_payment_token(token_id, api_key)
  puts "Get token response: #{get_token_response}"
end
