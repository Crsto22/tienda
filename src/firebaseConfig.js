import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDR7uml2WACQe7RdP7bg487f9JO3Gn-TrI",
  authDomain: "tienda-5e1c4.firebaseapp.com",
  projectId: "tienda-5e1c4",
  storageBucket: "tienda-5e1c4.firebasestorage.app",
  messagingSenderId: "809338222834",
  appId: "1:809338222834:web:ae038a784cebdacd52386b",
  measurementId: "G-FFKJT02BGJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };