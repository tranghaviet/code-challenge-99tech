import express from 'express';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes';
import swaggerUi from 'swagger-ui-express';
const swaggerFile = require('../swagger_output.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/resources', resourceRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; // Export for testing
