import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  definitions: {
    Resource: {
      $name: 'Resource Name',
      $description: 'Resource Description',
    },
    Resources: [
      {
        $ref: '#/definitions/Resource',
      },
    ],
  },
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/routes/resourceRoutes.ts']; // Update the endpoint file path

swaggerAutogen()(outputFile, endpointsFiles, doc);
