/* =====================================================================
   firebase-rtdb-config.js
   Sole job: initialise Firebase and expose the Realtime Database as
   window.rtdb, so every other script can share it.
   ---------------------------------------------------------------------
   Load order in index.html: Firebase CDN scripts (app + database) ->
   this file -> app-logic.js
   ---------------------------------------------------------------------
   THE ONE VALUE YOU MUST FILL IN: databaseURL (last line of the config).
   Firebase console -> Realtime Database (left menu) -> the address
   shown at the top of the data page. It looks like
     https://classemates-944b4-default-rtdb.firebaseio.com
   or, for a European database,
     https://classemates-944b4-default-rtdb.europe-west1.firebasedatabase.app
   Copy it exactly as shown. "https://firebaseio.com" on its own is not
   a real address and will not connect.

   Realtime Database rules (Firebase console -> Realtime Database ->
   Rules tab -> replace everything with this, then press Publish. If
   anything is underlined in red, the rules were NOT saved and the old
   ones are still active):

     {
       "rules": {
         ".read": true,
         ".write": true
       }
     }

   Open on purpose — the same "anyone holding this config, which is not
   secret by design, can read/write" model this app has always used.
   ===================================================================== */
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyD-hwq5MRkUj3K6z_l_2BWaGjcMfqcUjRg",
    authDomain: "classemates-944b4.firebaseapp.com",
    projectId: "classemates-944b4",
    storageBucket: "classemates-944b4.firebasestorage.app",
    messagingSenderId: "765452178067",
    appId: "1:765452178067:web:584c9c3650b22cee78f366",
    databaseURL: "https://classemates-944b4-default-rtdb.firebaseio.com"
  };

  const isPlaceholder = (v) => !v || v.indexOf("[PASTE_") === 0;

  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    console.error("[Classe mates] Firebase library not loaded. Check the CDN <script> tags in index.html.");
    window.rtdb = null;
    return;
  }
  if (isPlaceholder(firebaseConfig.databaseURL) || !/^https:\/\/.+\..+/.test(firebaseConfig.databaseURL) || firebaseConfig.databaseURL === "https://firebaseio.com") {
    console.warn("[Classe mates] databaseURL is not set to your real Realtime Database address. Edit firebase-rtdb-config.js.");
    window.rtdb = null;
    return;
  }

  firebase.initializeApp(firebaseConfig);
  window.rtdb = firebase.database();
})();
