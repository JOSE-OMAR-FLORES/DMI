// firebase-test.js - Script de diagnóstico de Firebase
// Ejecutar con: node firebase-test.js

// Simular las variables de entorno
process.env.FIREBASE_API_KEY = 'AIzaSyBqOH-Hqqj-1CJBqM2tYSPru-ayJJKHoQ';
process.env.FIREBASE_AUTH_DOMAIN = 'serviciosenlanube.firebaseapp.com';
process.env.FIREBASE_PROJECT_ID = 'serviciosenlanube';
process.env.FIREBASE_STORAGE_BUCKET = 'serviciosenlanube.firebasestorage.app';
process.env.FIREBASE_MESSAGING_SENDER_ID = '448607934111';
process.env.FIREBASE_APP_ID = '1:448607934111:web:fc08e0db6248d9e16ee6af6';

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log('🔥 Iniciando prueba de Firebase...');
console.log('📋 Configuración:', JSON.stringify(firebaseConfig, null, 2));

try {
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializada');

  // Inicializar Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore inicializado');

  // Intentar leer la colección userFavorites
  console.log('\n🔍 Intentando leer colección "userFavorites"...');
  
  getDocs(collection(db, 'userFavorites'))
    .then((querySnapshot) => {
      console.log(`✅ Lectura exitosa! Documentos encontrados: ${querySnapshot.size}`);
      
      if (querySnapshot.size > 0) {
        console.log('\n📄 Documentos encontrados:');
        querySnapshot.forEach((doc) => {
          console.log(`  - ID: ${doc.id}`);
          console.log(`    Datos:`, doc.data());
        });
      } else {
        console.log('📭 La colección está vacía (esto es normal si no hay favoritos guardados)');
      }
      
      console.log('\n✅ RESULTADO: Firebase está configurado CORRECTAMENTE');
      console.log('   El problema puede estar en:');
      console.log('   1. Las reglas de Firestore (verifica en Firebase Console)');
      console.log('   2. La app de React Native no está leyendo el .env correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ ERROR al leer Firestore:', error.code);
      console.error('   Mensaje:', error.message);
      
      if (error.code === 'permission-denied') {
        console.error('\n🔒 PROBLEMA IDENTIFICADO: Permisos de Firestore');
        console.error('   Solución:');
        console.error('   1. Ve a: https://console.firebase.google.com/project/serviciosenlanube/firestore/rules');
        console.error('   2. Cambia las reglas a:');
        console.error('   ```');
        console.error('   rules_version = "2";');
        console.error('   service cloud.firestore {');
        console.error('     match /databases/{database}/documents {');
        console.error('       match /{document=**} {');
        console.error('         allow read, write: if true;');
        console.error('       }');
        console.error('     }');
        console.error('   }');
        console.error('   ```');
        console.error('   3. Haz click en "Publicar"');
      } else if (error.code === 'not-found') {
        console.error('\n📭 PROBLEMA: Base de datos no encontrada');
        console.error('   Solución:');
        console.error('   1. Ve a: https://console.firebase.google.com/project/serviciosenlanube/firestore');
        console.error('   2. Crea una base de datos Firestore si no existe');
      } else {
        console.error('\n❓ Error desconocido:', error);
      }
      
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  process.exit(1);
}
