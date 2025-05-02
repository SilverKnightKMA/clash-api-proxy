# clash-api-proxy
The Clash of Clans API provides near real time access to game related data.

## Usage

To run this Clash API proxy using Docker Compose, follow these steps:

### Prerequisites

* [Docker](https://www.docker.com/get-started/) installed.
* [Docker Compose](https://docs.docker.com/compose/install/) installed.
* An active [CoC Developer account](https://developer.clashofclans.com/#/).

### Steps

1.  **Clone the repository:**

    Open your terminal or command prompt and run the following command to download the source code:

    ```bash
    git clone [https://github.com/SilverKnightKMA/clash-api-proxy.git](https://github.com/SilverKnightKMA/clash-api-proxy.git)
    ```

    Navigate into the project directory:

    ```bash
    cd clash-api-proxy
    ```

2.  **Configure Environment Variables:**

    The project uses a `.env` file for configuration, particularly to connect to your Clash instance's API. A template is provided as `.env.example`.

    Copy the example file to create your `.env` file:

    ```bash
    cp .env.example .env
    ```

    Now, **edit** the newly created `.env` file using a text editor. You **must** update the following variables according to your Clash API configuration:

    * `CLASH_API_URL`: The full URL of your Clash API endpoint (e.g., `http://127.0.0.1:9090`).
    * `CLASH_API_SECRET`: The API secret/password you configured in your Clash instance's `config.yaml`. If your Clash instance does not have an API secret set, you may leave this variable empty or remove the line, but verify the project's code or README for confirmation on how it handles missing secrets.

    Save the changes to the `.env` file.

3.  **Run with Docker Compose:**

    In the project directory (`clash-api-proxy`), execute the following command to build the Docker image (if necessary) and start the container(s) defined in `docker-compose.yml` in detached mode (running in the background):

    ```bash
    docker compose up -d
    ```

    This command will:
    * Read the configuration from `docker-compose.yml`.
    * Build the Docker image for the proxy service (if it doesn't exist locally or the `Dockerfile` has changed).
    * Create and start the `clash-api-proxy` container.
    * Run the container in detached mode (`-d`), meaning it won't block your terminal.

### Verification

* Check if the container is running:
    ```bash
    docker compose ps
    ```
* View the logs of the container to check for any errors during startup:
    ```bash
    docker compose logs -f
    ```
* By default, the proxy container exposes port `8000` (check `docker-compose.yml` if this differs). You should be able to access the proxy's own endpoints (like `/version` or `/health` as mentioned in the main README) via `http://localhost:8000/version` or `http://localhost:8000/health` (replace `localhost` with your server's IP address if running remotely).

### Stopping the Service

To stop the running proxy container and clean up the resources (network, etc.) created by `docker compose up`, run the following command in the project directory:

```bash
docker compose down
