# Verlet-React Monorepo

This monorepo contains a 2D Verlet physics engine, a React wrapper for it, and a documentation/demo application.

## Project Structure

-   `packages/verlet-engine`: The core 2D Verlet physics engine written in TypeScript.
-   `packages/verlet-react`: A React wrapper library that provides declarative components for integrating `verlet-engine` into React applications.
-   `app/verlet-react-doc`: A documentation and demo application built with React and Vite, showcasing the usage of `verlet-react` components.

## Getting Started

To set up the project, first install the dependencies for all packages:

```bash
npm install
# or
yarn install
```

## Running the Demo Application

To run the demo application and see `verlet-react` in action:

```bash
npm run dev --workspace=verlet-react-doc
# or
yarn dev --workspace=verlet-react-doc
```

This will start a development server, and you can view the demo in your browser (usually at `http://localhost:5173`).

## Building the Libraries

To build the `verlet-engine` and `verlet-react` libraries:

```bash
npm run build --workspace=verlet-engine
npm run build --workspace=verlet-react
# or
yarn build --workspace=verlet-engine
yarn build --workspace=verlet-react
```

## Contributing

Please refer to the individual `README.md` files within each package for more specific information on development and contribution.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.