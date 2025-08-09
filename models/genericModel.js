import { client } from "../config/db.js";

export const getAllQuery = function (queryString) {
  return async function (req, res) {
    try {
      const result = await client.query(queryString);
      const fetchedData = result.rows;
      res.send(JSON.stringify(fetchedData));
    } catch (error) {
      console.error("didnt fetch", queryString, error);
    }
  };
};
