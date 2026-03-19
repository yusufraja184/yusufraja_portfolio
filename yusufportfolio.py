from flask import Flask, request, jsonify, send_from_directory
import os
import csv
from datetime import datetime
from twilio.rest import Client

# Initialize the Flask app, setting the static repo to the current directory
app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def home():
    """Serve the main portfolio HTML file."""
    return send_from_directory('.', 'yusufportfoilo.html')

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    """Handle incoming contact form submissions."""
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    message = data.get('message')
    
    # Basic validation
    if not name or not email or not mobile or not message:
        return jsonify({'error': 'All fields are required.'}), 400
        
    # Save the submission to a local CSV file
    try:
        csv_file = 'messages.csv'
        file_exists = os.path.isfile(csv_file)
        
        with open(csv_file, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # Write header if file is new
            if not file_exists:
                writer.writerow(['Timestamp', 'Name', 'Email', 'Mobile', 'Message'])
            
            # Write data row
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                name,
                email,
                mobile,
                message
            ])
            
        print(f"New message from {name} ({mobile}) saved successfully!")
        
        # --- TWILIO SMS NOTIFICATION INTEGRATION ---
        # Note: You will need to replace the placeholder strings below with your actual Twilio credentials
        TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'replace_with_your_account_sid')
        TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'replace_with_your_auth_token')
        TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', 'replace_with_your_twilio_number')
        YUSUF_PHONE_NUMBER = os.environ.get('YUSUF_PHONE_NUMBER', 'replace_with_your_actual_mobile_number')
        
        try:
            # Only attempt to send SMS if credentials have been updated or provided
            if 'replace_with' not in TWILIO_ACCOUNT_SID:
                client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                sms_body = f"New Portfolio Message!\nFrom: {name}\nMobile: {mobile}\nEmail: {email}\nMsg: {message}"
                client.messages.create(
                    body=sms_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=YUSUF_PHONE_NUMBER
                )
                print("SMS notification sent to Yusuf.")
            else:
                print("Twilio isn't configured yet. Saved to CSV, but skipping SMS notification.")
        except Exception as sms_error:
            print(f"Failed to send SMS: {str(sms_error)}")
            
        return jsonify({'message': 'Thank you! Your message has been sent successfully.'}), 200
        
    except Exception as e:
        print(f"Error saving message: {str(e)}")
        return jsonify({'error': 'Internal server error while saving message. Try again later.'}), 500

if __name__ == '__main__':
    print("Starting Yusuf's Portfolio Backend Server...")
    print("Available at: http://127.0.0.1:5000")
    print("Press CTRL+C to stop.")
    # Run the server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
