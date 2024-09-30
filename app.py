from flask import Flask, render_template, jsonify, request
import numpy as np
from kmeans import KMeansAlgorithm
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Route for main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to generate random data
@app.route('/generate_data')
def generate_data():
    data = np.random.uniform(-10, 10, size=(100, 2))  # Random dataset of 100 points in range [-10, 10]
    print(f"Generated data:\n{data}\n")  # Log the generated data
    return jsonify(data.tolist())  # Convert NumPy array to list and return as JSON
    
# Route to run KMeans algorithm with chosen initialization
""" @app.route('/run_kmeans', methods=['POST'])
def run_kmeans():
    try:
        data = np.array(request.json['data'])
        init_method = request.json['init_method']
        k = request.json.get('k', 3)  # Default to 3 clusters if not provided
        manual_centroids = request.json.get('manual_centroids', None)  # Get manual centroids if provided

        # Run the KMeans algorithm
        kmeans = KMeansAlgorithm(data, init_method=init_method, k=k, manual_centroids=manual_centroids)
        result = kmeans.run()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400  # Return the error message with status 400
    
@app.route('/step_kmeans', methods=['POST'])
def step_kmeans():
    try:
        data = np.array(request.json['data'])
        init_method = request.json['init_method']
        k = request.json.get('k', 3)  # Default to 3 clusters if not provided
        manual_centroids = request.json.get('manual_centroids', None)  # Get manual centroids if provided

        # Initialize KMeans if it's not already done
        if 'kmeans' not in globals():
            global kmeans
            kmeans = KMeansAlgorithm(data, init_method=init_method, k=k, manual_centroids=manual_centroids)

        # Step through the algorithm
        result = kmeans.step()
        if result is None:
            return jsonify({'message': 'Convergence reached'}), 200  # Indicate convergence
        return jsonify(result)
    except Exception as e:
        print(f"Error in step_kmeans: {e}")  # Print the error to the logs
        return jsonify({'error': str(e)}), 400  # Return the error message with status 400
"""

@app.route('/run_kmeans', methods=['POST'])
def run_kmeans():
    try:
        data = np.array(request.json['data'])
        init_method = request.json['init_method']
        k = int(request.json.get('k', 3))  # Convert k to an integer
        print(f"Received number of clusters (k): {k}")  # Log this to check
        manual_centroids = request.json.get('manual_centroids', None)

        print(f"Running KMeans with {k} clusters and {init_method} initialization")

        if init_method == 'manual' and (manual_centroids is None or len(manual_centroids) != k):
            raise ValueError(f"Manual centroids must be a list of {k} points. Received: {manual_centroids}")

        # Initialize KMeans with the selected method
        global kmeans
        kmeans = KMeansAlgorithm(data, init_method=init_method, k=k, manual_centroids=manual_centroids)
        result = kmeans.run()

        return jsonify(result)
    except Exception as e:
        print(f"Error in run_kmeans: {e}")
        return jsonify({'error': str(e)}), 400



@app.route('/step_kmeans', methods=['POST'])
def step_kmeans():
    try:
        data = np.array(request.json['data'])
        init_method = request.json['init_method']
        k = int(request.json.get('k', 3))  # Convert k to an integer
        manual_centroids = request.json.get('manual_centroids', None)

        # Always reinitialize KMeans when stepping through, especially after refreshing or switching methods
        global kmeans
        kmeans = KMeansAlgorithm(data, init_method=init_method, k=k, manual_centroids=manual_centroids)

        result = kmeans.step()
        if result is None:
            return jsonify({'message': 'Convergence reached'}), 200  # Indicate convergence
        return jsonify(result)
    except Exception as e:
        print(f"Error in step_kmeans: {e}")  # Print the error to the logs
        return jsonify({'error': str(e)}), 400


@app.route('/test')
def test():
    test_data = {"message": "Test data"}
    print("Test route called")  # Log when this route is called
    return jsonify(test_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
