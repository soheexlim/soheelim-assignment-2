# Makefile to automate setup and execution of the Flask application

# Command to install required dependencies
install:
	pip install -r requirements.txt  # Install the required Python packages

# Command to run the Flask application locally on http://localhost:3000
run:
	flask run --host=127.0.0.1 --port=3000  # Run the Flask app on localhost with port 3000

# Command to clean up or reset (optional but useful for automation or grading purposes)
clean:
	rm -rf __pycache__ *.pyc *.pyo  # Remove cache and compiled files

# Optionally add a target to check for installed dependencies
check:
	pip check  # Check for any broken dependencies

# Default target if 'make' is run without arguments
all: install run
