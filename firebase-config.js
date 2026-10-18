/* =====================================================================
   firebase-config.js
   Sole job: initialise the Firebase app and expose its Firestore
   database as window.db, so every other script can share it without
   repeating configuration.
   ---------------------------------------------------------------------
   Load order in index.html: Firebase CDN scripts -> this file -> app-logic.js
   ---------------------------------------------------------------------
   Where to get these values: console.firebase.google.com -> your
   project -> the gear icon (Project settings) -> scroll to "Your apps"
   -> the web app you registered -> "SDK setup and configuration" ->
   "Config". Copy each value below exactly as shown there.

   Firestore collections this app uses (created automatically the first
   time something is written to them — nothing to set up by hand beyond
   enabling Firestore itself and pasting the security rules below):

     accounts         one doc per account, document id = the account id
                       in lowercase. Fields: id, password, name, surname,
                       age, level, photo, plus, lastEdit.
     students         an append-only log of "a student was added to a
                       classroom" events (auto id). Fields: name, age,
                       level, surname, classId, createdAt.
     live_sessions    one doc per classroom for "START A MATE" (doc id =
                       classId). Fields: active, className, notes,
                       updatedAt. Each one also has a "signals"
                       subcollection used only for the few seconds of
                       WebRTC handshake messages, then those are deleted.

   Firestore security rules (Firebase Console -> Firestore Database ->
   Rules tab -> paste this, matching the open "anon" policies this demo
   used on Supabase — anyone who has this config, which is not secret by
   design, can read/write; that is the same trust model the rest of the
   app already uses, not a new weakening):

     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /accounts/{id} { allow read, write: if true; }
         match /students/{id} { allow read, write: if true; }
         match /live_sessions/{classId} {
           allow read, write: if true;
           match /signals/{signalId} { allow read, write: if true; }
         }
       }
     }
   ===================================================================== */
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyD-hwq5MRkUj3K6z_l_2BWaGjcMfqcUjRg",
    authDomain: "classemates-944b4.firebaseapp.com",
    projectId: "classemates-944b4",
    storageBucket: "classemates-944b4.firebasestorage.app",
    messagingSenderId: "765452178067",
    appId: "1:765452178067:web:584c9c3650b22cee78f366"
  };

  const isPlaceholder = (v) => !v || v.indexOf("[PASTE_") === 0;

  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    console.error("[Classe mates] Firebase library not loaded. Check the CDN <script> tags in index.html.");
    window.db = null;
    return;
  }

  if (Object.keys(firebaseConfig).some((k) => isPlaceholder(firebaseConfig[k]))) {
    console.warn("[Classe mates] Firebase credentials are still placeholders. Edit firebase-config.js.");
    window.db = null;
    return;
  }

  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
})();
