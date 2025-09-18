// wrapper for Qdrant client
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL 
//|| "https://6b95daf2-5a95-44c5-ba53-fbdd5dfe1ef3.us-west-1-0.aws.cloud.qdrant.io" ;                     //"http://127.0.0.1:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY 
//|| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.2V8CVIMtCRSneAZcwI3fHZG1PJADze--zlPulRirV6I";

const clientOptions = { url: QDRANT_URL,checkCompatibility: false };
if (QDRANT_API_KEY) clientOptions.apiKey = QDRANT_API_KEY;

const qdrant = new QdrantClient(clientOptions);

export default qdrant;
