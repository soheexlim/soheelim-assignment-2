import numpy as np

class KMeansAlgorithm:
    def __init__(self, data, init_method='random', k=3, manual_centroids=None):
        self.data = data
        self.k = k
        self.init_method = init_method
        self.manual_centroids = manual_centroids  # List of user-selected centroids
        self.centroids = self.initialize_centroids()
        self.previous_centroids = np.zeros_like(self.centroids)
        self.iteration = 0  # Track iteration

    def initialize_centroids(self):
        if self.init_method == 'random':
            return self.data[np.random.choice(self.data.shape[0], self.k, replace=False)]
        elif self.init_method == 'kmeans++':
            return self.kmeans_plusplus_init()
        elif self.init_method == 'manual':
            return self.manual_init()
        print(f"Initialized centroids for {self.init_method} method: {centroids}")
        return centroids

    def step(self):
        # Check for convergence
        if np.array_equal(self.centroids, self.previous_centroids):
            return None  # Indicate convergence when centroids don't change
        
        self.previous_centroids = self.centroids
        clusters = self.assign_clusters(self.centroids)  # Assign points to the nearest centroids
        self.centroids = self.update_centroids(clusters)  # Update centroids
        
        self.iteration += 1
        return {
            'centroids': self.centroids.tolist(),
            'clusters': [np.array(cluster).tolist() for cluster in clusters],
            'iteration': self.iteration
        }

    def kmeans_plusplus_init(self):
        if self.k > len(self.data):
            raise ValueError(f"Cannot select {self.k} centroids from {len(self.data)} data points.")

        # Step 1: Randomly select the first centroid
        centroids = [self.data[np.random.randint(0, self.data.shape[0])]]
        print(f"Initial centroid: {centroids[0]}")

        # Step 2: Select the remaining k-1 centroids
        for _ in range(1, self.k):
            # Calculate squared distances from each point to the nearest centroid
            dist_sq = np.array([min([np.linalg.norm(x - c) ** 2 for c in centroids]) for x in self.data])
            
            # Handle cases where the total distance is 0 (rare but possible edge case)
            if np.sum(dist_sq) == 0:
                raise ValueError("Total distance between centroids and points is zero. Unable to proceed.")

            # Calculate probabilities for selecting the next centroid
            probs = dist_sq / np.sum(dist_sq)
            cumulative_probs = np.cumsum(probs)
            
            # Randomly select a point based on the cumulative probability distribution
            r = np.random.rand()
            for j, p in enumerate(cumulative_probs):
                if r < p:
                    centroids.append(self.data[j])
                    print(f"Selected new centroid: {self.data[j]}")
                    break

        # Final check to ensure the number of centroids matches k
        if len(centroids) != self.k:
            raise ValueError(f"Expected {self.k} centroids but got {len(centroids)}")
        
        print(f"Final centroids: {centroids}")
        return np.array(centroids)


    def farthest_first_init(self):
        centroids = [self.data[np.random.randint(0, self.data.shape[0])]]
        for _ in range(1, self.k):
            dist_to_nearest_centroid = np.min([np.linalg.norm(x - centroids, axis=1) ** 2 for x in self.data], axis=0)
            farthest_point_index = np.argmax(dist_to_nearest_centroid)
            centroids.append(self.data[farthest_point_index])
        return np.array(centroids)

    def manual_init(self):
        # Check if manual centroids are provided, and ensure they match the number of clusters (k)
        if self.manual_centroids is None or len(self.manual_centroids) != self.k:
            raise ValueError(f"Manual centroids must be a list of {self.k} points.")
        
        # Convert the manual centroids into a NumPy array
        return np.array(self.manual_centroids)



    def assign_clusters(self, centroids):
        clusters = [[] for _ in range(self.k)]
        for x in self.data:
            closest_centroid = np.argmin([np.linalg.norm(x - c) for c in centroids])
            clusters[closest_centroid].append(x)
        return clusters

    def update_centroids(self, clusters):
        # Ensure clusters are non-empty before computing the mean
        new_centroids = []
        for cluster in clusters:
            if len(cluster) == 0:
                continue
            new_centroids.append(np.mean(cluster, axis=0))
        return np.array(new_centroids)

    def run(self):
        centroids = self.initialize_centroids()  # Initialize centroids
        previous_centroids = np.zeros_like(centroids)
        iteration = 0
        
        while not np.array_equal(centroids, previous_centroids):  # Loop until convergence
            previous_centroids = centroids
            clusters = self.assign_clusters(centroids)
            centroids = self.update_centroids(clusters)
            iteration += 1
            print(f"Iteration {iteration}: Updated centroids: {centroids}")

        return {
            'centroids': centroids.tolist(),
            'clusters': [np.array(cluster).tolist() for cluster in clusters],
            'iterations': iteration
        }

    """
    def run(self):
        centroids = self.initialize_centroids()  # Initialize centroids
        previous_centroids = np.zeros_like(centroids)
        iteration = 0
        
        while not np.array_equal(centroids, previous_centroids):  # Loop until convergence
            previous_centroids = centroids
            clusters = self.assign_clusters(centroids)
            centroids = self.update_centroids(clusters)
            iteration += 1
            print(f"Iteration {iteration}: Updated centroids: {centroids}")

        return {
            'centroids': centroids.tolist(),
            'clusters': [np.array(cluster).tolist() for cluster in clusters],
            'iterations': iteration
        }
    """

