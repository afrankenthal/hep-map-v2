
import styles from './page.module.css'

import FullMap from './map'

// Load data from local file
// import EXPERIMENT from './experiments.json';

// Load data from MongoDB
import clientPromise from '../lib/mongodb'
async function getData() {
  try {
      const client = await clientPromise;
      const db = client.db("hepmap-db");
      const experiment_data = await db
          .collection("experiments")
          .find({})
          .toArray();
      return {
          experiment_data: JSON.parse(JSON.stringify(experiment_data)),
      };
  } catch (e) {
      console.error(e);
  }
}

export default async function Home() {

  // Load data from local file
  // let EXPERIMENTS = { experiment_data: EXPERIMENT };
  // Load data from MongoDB
  let EXPERIMENTS = await getData();

  return (<FullMap EXPERIMENTS={EXPERIMENTS} />)
}