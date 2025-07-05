// firebase-config.js
const firebaseConfig = {
  // sua config aqui...
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();
const database = firebase.database();

export { storage, database };
