# Frontend application on Vue.js

This project is using [Vite](https://vite.dev/) build tool.

## Project Setup

1. Rename `.env.example` to `.env` and define your environment variables.
2. Install dependecies with:

```sh
npm install
```

### Compile and Hot-Reload for Development

This starts the dev server.

```sh
npm run dev
```

### Compile and Minify for Production

This will create a production-ready build of your app in the project's ./dist directory.

```sh
npm run build
```

## To create a Docker image

```sh
docker build . -t vue-app
```

## To run the container

```sh
docker run -d -p 7000:80 vue-app:latest
```
