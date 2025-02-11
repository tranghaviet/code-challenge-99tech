# Express.js CRUD Backend with TypeScript

        This project is a backend server built with Express.js and TypeScript, providing a CRUD (Create, Read, Update, Delete) interface for managing resources. It uses NeDB as an embedded database, Swagger (OpenAPI) for API documentation, and Jest for testing.

        ## Prerequisites

        -   Node.js (v16 or higher recommended)
        -   npm (Node Package Manager)

        ## Installation

        1.  Clone the repository:
            ```bash
            git clone [repository URL]
            cd [repository directory]
            ```
        2.  Install dependencies:
            ```bash
            npm install
            ```

        ## Configuration

        -   The database file (`database.db`) is created in the project's root directory.  No further configuration is needed for NeDB in its default setup.
        -   The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

        ## Running the Application

        -   **Development Mode:**
            ```bash
            npm run dev
            ```
            This starts the server with `ts-node-dev`, which automatically restarts the server on file changes.

        -   **Production Mode:**
            ```bash
            npm run build
            npm start
            ```
            This first builds the TypeScript code to JavaScript and then starts the server using the compiled code.

        ## API Documentation (Swagger)

        1.  **Generate Swagger Documentation:**
            ```bash
            npm run swagger-autogen
            ```
            This command generates the `swagger_output.json` file based on the JSDoc comments in your code.  You should run this whenever you update your API endpoints or their documentation.

        2.  **Access Swagger UI:**
            After starting the server (in either development or production mode), open your web browser and go to:
            ```
            http://localhost:3000/api-docs
            ```
            This will display the Swagger UI, where you can explore and interact with the API endpoints.

        ## API Endpoints

        The following endpoints are available for managing resources:

        | Method | Endpoint             | Description                                  |
        | ------ | -------------------- | -------------------------------------------- |
        | POST   | `/api/resources`     | Create a new resource                        |
        | GET    | `/api/resources`     | Get all resources (supports query parameters) |
        | GET    | `/api/resources/:id` | Get a specific resource by ID                |
        | PUT    | `/api/resources/:id` | Update a resource by ID                      |
        | DELETE | `/api/resources/:id` | Delete a resource by ID                      |

        **Resource Object:**

        ```json
        {
          "name": "string",
          "description": "string"
        }
        ```

        ## Testing

        To run the tests, use the following command:

        ```bash
        npm test
        ```

        This runs the Jest tests defined in the `src/__tests__` directory.  The tests cover the API endpoints and database interactions.

        ## Project Structure

        ```
        ├── src/
        │   ├── __tests__/          # Jest test files
        │   ├── controllers/        # Controller functions for handling route logic
        │   ├── models/             # Data models (e.g., Resource interface)
        │   ├── routes/             # Express route handlers
        │   ├── db.ts               # Database setup and utility functions
        │   ├── index.ts            # Main application file
        ├── swagger_output.json   # Generated Swagger documentation
        ├── jest.config.js        # Jest configuration
        ├── package.json          # Project dependencies and scripts
        ├── tsconfig.json         # TypeScript configuration
        └── README.md             # This file

        ```
