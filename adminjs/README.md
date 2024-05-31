# AdminJS (https://adminjs.co/)

# major dependencies: adminjs, @adminjs/express, @adminjs/mongoose

AdminJS is an auto-generated admin panel for your Node.js application that allows you to manage all your data in one place.

This is an AdminJS panel using express and mongoose. To manage TripTribe database data.

## Getting Started

1. Clone the repository to your local machine.
2. In 'adminjs' path, install the project dependencies by running `npm install`.

## Setup the Database locally (Ignore if you already setup)

1. Install Docker (https://www.docker.com/get-started/).
2. Create a Docker container using the MongoDB image by running the following command.

```bash
$ docker run --name triptribe-mongodb -d -p 27017:27017 -v mongodb_data:/data/db mongo
```

## Running the app

Ensure the triptribe-mongodb container is running in Docker Desktop,
or run `docker start triptribe-mongodb` to start the container.

Remember to stop the container after exiting the app.

In 'adminjs' path, run below bash.

```bash
# development watch mode
$ npm run start:dev
```

After starting the app, use the URL: http://localhost:3000/admin to access panel.

Default login detail:
email: 'admin@triptribe.com',
password: 'password',
