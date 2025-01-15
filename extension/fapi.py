#import nltk
#import nltk
#nltk.download('punkt_tab')
#nltk.download('stopwords')

from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
from nltk.tokenize import word_tokenize

from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
import nltk
import sys
sys.stdout.reconfigure(encoding='utf-8')
#nltk.download('punkt')
#nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

stopword = set(stopwords.words("english"))
stemmer = SnowballStemmer("english")

def tokenize_stem(text):
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopword]
    tokens = [word for word in tokens if word.isalpha()]
    tokens = [stemmer.stem(word) for word in tokens]
    return tokens

with open('classifiernew1.pkl', 'rb') as f:
    classifier, vectorizer = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    # Parse JSON data from the request
    data = request.get_json()
    if not data or 'tweets' not in data:
        return jsonify({'error': 'Invalid request, missing tweets data'}), 400

    tweets = data.get('tweets', [])
    print(tweets)
    hateful_sections = []  # List to store hateful sections

    # Process each tweet and predict if it's offensive
    for tweet in tweets:
        try:
            # Transform the tweet using the vectorizer
            tweet_vector = vectorizer.transform([tweet])

            # Get the prediction from the classifier
            prediction = classifier.predict(tweet_vector)[0]
            print(f"Prediction for tweet: '{tweet}' -> {prediction}")

            # If the prediction is 'Offensive Language', add it to the hateful sections
            if prediction == 'Offensive Language':
                hateful_sections.append(tweet)

        except Exception as e:
            # Log any issues with processing
            print(f"Error processing tweet: {tweet}, error: {str(e)}")

    print(f"Hateful sections detected: {hateful_sections}")

    # Return the list of hateful sections as a JSON response
    return jsonify({'hatefulSections': hateful_sections})


if __name__ == '__main__':
    app.run(port=3000,debug=True)
