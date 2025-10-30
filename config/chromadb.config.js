import 'dotenv/config';
const database = process.env.CHROMA_DATABASE;
const tenant = process.env.CHROMA_TENANT;

export const clientParams = {
  host: "api.trychroma.com",
  ssl: true,
  port: 8000,
  database: database,
  tenant: tenant,
};
export class ChromaClient {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.clientParams = clientParams;
    this.chromaCloudAPIKey = process.env.CHROMA_API_KEY;
  }
}
