let data = [];
let initMethod = 'random';  // Set this based on user input
let manualCentroids = [];   // Store manual centroids selected by the user

/*
async function runKMeans() {
    let k = parseInt(document.getElementById('num-clusters').value);  // Convert k to an integer

    if (isNaN(k) || k <= 0) {
        alert('Please enter a valid number of clusters.');
        return;
    }

    if (data.length === 0) {
        alert('No data available. Please generate new data first.');
        return;
    }

    try {
        const response = await fetch('/run_kmeans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: data,
                init_method: initMethod,
                k: k,  // Pass the number of clusters as an integer
                manual_centroids: manualCentroids  // Include manual centroids if chosen
            })
        });

        if (!response.ok) throw new Error('Failed to run KMeans');

        const result = await response.json();
        plotClusters(result);
    } catch (error) {
        console.error('Error running KMeans:', error);
        alert('Error running KMeans: ' + error.message);
    }
}
*/
async function runKMeans() {
    try {
        // Get the number of clusters from the input field
        let k = parseInt(document.getElementById('num-clusters').value);
        console.log("User input number of clusters (k):", k);
        if (isNaN(k) || k <= 0) {
            alert('Please enter a valid number of clusters.');
            return;
        }

        console.log(`Running KMeans with init method: ${initMethod}, number of clusters: ${k}`);

        const response = await fetch('/run_kmeans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: data,
                init_method: initMethod,
                k: k,  // Pass the user input value of k
                manual_centroids: manualCentroids  // Include manual centroids if chosen
            })            
        });

        if (!response.ok) throw new Error('Failed to run KMeans');

        const result = await response.json();
        plotClusters(result);
    } catch (error) {
        console.error('Error running KMeans:', error);
        alert('Error running KMeans: ' + error.message);
    }
}


function reset() {
    Plotly.purge('plot');  // Clear the plot
    manualCentroids = [];  // Reset manual centroids
    data = [];  // Clear the data
    console.log('Reset everything');
}


async function stepThrough() {
    let k = parseInt(document.getElementById('num-clusters').value);  // Get the latest number of clusters

    if (isNaN(k) || k <= 0) {
        alert('Please enter a valid number of clusters.');
        return;
    }

    if (data.length === 0) {
        alert('No data available. Please generate new data first.');
        return;
    }

    try {
        const response = await fetch('/step_kmeans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: data,
                init_method: initMethod,
                k: k,  // Pass the latest number of clusters
                manual_centroids: manualCentroids  // Include manual centroids if chosen
            })
        });

        const responseData = await response.json();  // Get the response data

        if (!response.ok) {
            console.error('Backend error:', responseData);
            if (responseData.message === 'Convergence reached') {
                alert('KMeans has converged!');
            } else {
                throw new Error(responseData.error || 'Failed to step through KMeans');
            }
            return;
        }

        console.log('Step:', responseData.iteration);
        plotClusters(responseData);
    } catch (error) {
        console.error('Error stepping through KMeans:', error);
        alert('Error stepping through KMeans: ' + error.message);
    }
}


async function generateData() {
    try {
        console.log("Attempting to fetch data...");  // Start by logging a message
        const response = await fetch('/generate_data');
        console.log(response);  // Log the full response object to inspect it

        if (!response.ok) throw new Error('Failed to fetch data');  // If response is not OK, throw error
        
        const jsonData = await response.json();  // Parse the response as JSON
        console.log("Received JSON data:", jsonData);  // Log the received data
        
        data = jsonData;  // Store the data in the global variable
        plotData(data);  // Plot the data using Plotly
    } catch (error) {
        console.error('Error generating data:', error);
        alert('Error generating data: ' + error.message);
    }
    if (data.length === 0) {
        console.error("No data was received from the backend.");
        alert("No data was received from the backend.");
        return;
    }    
}

function plotData(data) {
    const trace = {
        x: data.map(point => point[0]),  // X coordinates
        y: data.map(point => point[1]),  // Y coordinates
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: 'blue',
            size: 10  // Increase point size for better selection
        },
        name: 'Data Points'
    };

    const layout = {
        title: 'KMeans Clustering',
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        hovermode: 'closest',  // Make sure the closest point is selected on hover
        hoverdistance: 10,     // Increase hover sensitivity
        showlegend: true,
        dragmode: 'select'     // Enable user interaction with the plot
    };

    Plotly.newPlot('plot', [trace], layout).then(() => {
        // Attach the click event listener AFTER the plot is rendered
        enableManualCentroidSelection();
    });
}


function plotClusters(result) {
    const clusters = result.clusters;
    const centroids = result.centroids;

    // Check if clusters or centroids are undefined or null
    if (!clusters || !centroids) {
        console.error("Clusters or centroids are undefined:", result);
        alert('Error: Clusters or centroids are undefined.');
        return;
    }

    let traces = [];

    // Add a trace for each cluster
    clusters.forEach((cluster, index) => {
        traces.push({
            x: cluster.map(point => point[0]),  // X coordinates for the cluster
            y: cluster.map(point => point[1]),  // Y coordinates for the cluster
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 8,
                color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`  // Random color per cluster
            },
            name: `Cluster ${index + 1}`
        });
    });

    // Add a trace for the centroids
    traces.push({
        x: centroids.map(centroid => centroid[0]),  // X coordinates for centroids
        y: centroids.map(centroid => centroid[1]),  // Y coordinates for centroids
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 12,
            color: 'red',
            symbol: 'x'
        },
        name: 'Centroids'
    });

    const layout = {
        title: 'KMeans Clustering',
        xaxis: { title: 'X' },
        yaxis: { title: 'Y' },
        showlegend: true
    };

    Plotly.newPlot('plot', traces, layout);
}

// Enable manual centroid selection
function enableManualCentroidSelection() {
    const plotElement = document.getElementById('plot');
    manualCentroids = [];  // Reset manual centroids each time

    // Debug: Ensure we log when we attach the event
    console.log('Attaching plotly_click event for manual centroid selection.');

    // Remove any existing event listeners to prevent multiple triggers
    plotElement.removeAllListeners('plotly_click');

    // Attach the event listener to capture user clicks on the plot
    plotElement.on('plotly_click', function(eventData) {
        const x = eventData.points[0].x;
        const y = eventData.points[0].y;
        const centroid = [x, y];

        // Fetch the number of clusters from the input field
        let k = parseInt(document.getElementById('num-clusters').value);

        // Only allow the user to select up to 'k' centroids
        if (manualCentroids.length < k) {
            manualCentroids.push(centroid);  // Add the new centroid to the list
            plotManualCentroid(centroid);    // Plot the selected centroid on the graph
            console.log(`Manual centroid selected: ${centroid}`);  // Debug log
        } else {
            alert(`You can only select ${k} centroids.`);
        }
    });
}


function plotManualCentroid(centroid) {
    const update = {
        x: [centroid[0]],
        y: [centroid[1]],
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 12,
            color: 'green',
            symbol: 'x'
        },
        name: 'Manual Centroid'
    };
    
    Plotly.addTraces('plot', update);  // Add the new centroid to the plot
}


// Call enableManualCentroidSelection when new data is generated or switched to Manual
document.getElementById('generate-data').addEventListener('click', async function() {
    await generateData();
    if (initMethod === 'manual') {
        enableManualCentroidSelection();  // Reactivate manual selection after generating new data
    }
});

document.getElementById('init-method').addEventListener('change', function(event) {
    initMethod = event.target.value;
    manualCentroids = [];  // Reset manual centroids when switching initialization method
    reset();  // Reset the plot and data when switching methods

    if (initMethod === 'manual') {
        enableManualCentroidSelection();  // Activate manual selection mode when manual is selected
    } else {
        disableManualCentroidSelection();  // Disable manual centroid selection for other methods
    }
});


// Disable manual centroid selection
function disableManualCentroidSelection() {
    const plotElement = document.getElementById('plot');
    plotElement.removeAllListeners('plotly_click');
    manuaßlCentroids = [];  // Clear the manual centroids array
}


/* async function stepThrough() {
    if (data.length === 0) {
        alert('No data available. Please generate new data first.');
        return;
    }

    try {
        const response = await fetch('/step_kmeans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: data,
                init_method: initMethod,
                manual_centroids: manualCentroids  // Include manual centroids if chosen
            })
        });

        const responseData = await response.json();  // Get the response data (even if there's an error)
        console.log("Response Data from Backend:", responseData);  // Log the response data

        if (!response.ok) {
            console.error('Backend error:', responseData);  // Log the error from Flask
            if (responseData.message === 'Convergence reached') {
                alert('KMeans has converged!');
            } else {
                throw new Error(responseData.error || 'Failed to step through KMeans');
            }
            return;
        }

        console.log('Step:', responseData.iteration);  // Log the current step/iteration
        plotClusters(responseData);  // Attempt to plot the data
    } catch (error) {
        console.error('Error stepping through KMeans:', error);
        alert('Error stepping through KMeans: ' + error.message);
    }
} */
       

document.getElementById('generate-data').addEventListener('click', generateData);
document.getElementById('step-through').addEventListener('click', stepThrough);
document.getElementById('run-full').addEventListener('click', runKMeans);  // Runs full KMeans to convergence
document.getElementById('reset').addEventListener('click', reset);  // Resets everything

