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
    git clone https://github.com/SilverKnightKMA/clash-api-proxy
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

    * `PORT`: The port number on which the proxy service will listen for incoming HTTP requests.
        * Example: `PORT=5000`

    * `HOST`: The host or IP address the proxy service will bind to. Use `0.0.0.0` to make the proxy accessible from any interface.
        * Example: `HOST=0.0.0.0`

    * `API_SERVICE_URL`: Clash of Clan API
        * Example: `API_SERVICE_URL=https://api.clashofclans.com/v1`

    * `DOMAIN`: Your Domain/IP
        * Example: `DOMAIN=https://fu.tungvuthanh.com`

    * `EMAIL`: The email address required for authentication with CoC API (`API_SERVICE_URL`).
        * Example: `EMAIL=your.api.email@example.com`

    * `PASSWORD`: The password associated with the `EMAIL` for authentication with CoC API.
        * Example: `PASSWORD=your_api_password`

    * `GAME`: An identifier for the game.
        * Example: `GAME=clashofclans`

    Save the changes to the `.env` file.

3.  **Run with Docker Compose:**

    In the project directory (`clash-api-proxy`), execute the following command to build the Docker image (if necessary) and start the container(s) defined in `docker-compose.yml` in detached mode (running in the background):

    ```bash
    docker compose up -d
    ```

### Verification

* Check if the container is running:
    ```bash
    docker compose ps
    ```
* View the logs of the container to check for any errors during startup:
    ```bash
    docker compose logs -f
    ```
* By default, the proxy container exposes port `5000` (check `docker-compose.yml`). You should be able to access the proxy via `curl http://localhost:5000/info`.

### Stopping the Service

To stop the running proxy container and clean up the resources (network, etc.) created by `docker compose up`, run the following command in the project directory:

```bash
docker compose down
