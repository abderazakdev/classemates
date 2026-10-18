(function () {
  "use strict";

  // إعدادات الاتصال بمشروع كلاس ميتز الخاص بك
  const firebaseConfig = {
    apiKey: "AIzaSyD-hwq5MRkUj3K6z_l_2BWaGjcMfqcUjRg",
    authDomain: "classemates-944b4.firebaseapp.com",
    projectId: "classemates-944b4",
    storageBucket: "classemates-944b4.firebasestorage.app",
    messagingSenderId: "765452178067",
    appId: "1:765452178067:web:584c9c3650b22cee78f366",
    databaseURL: "https://firebaseio.com" // رابط الريل تايم داتابيس المباشر
  };

  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    console.error("[Classe mates] مكتبة فايربيس الأساسية لم يتم تحميلها.");
    window.db = null;
    return;
  }

  // تفعيل فايربيس بالاتصال الجديد
  firebase.initializeApp(firebaseConfig);

  // كود التحويل الذكي لأوامر التطبيق لتتوافق مع Realtime Database أونلاين
  window.db = {
    collection: function (collectionName) {
      const dbRef = firebase.database().ref(collectionName);
      return {
        doc: function (docId) {
          const docRef = dbRef.child(docId.toLowerCase()); // توحيد المعرفات تلقائياً لمنع التضارب
          return {
            set: function (data, options) {
              if (options && options.merge) {
                return docRef.update(data);
              }
              return docRef.set(data);
            },
            get: function () {
              return docRef.once("value").then(function (snapshot) {
                return {
                  exists: snapshot.exists(),
                  data: function () { return snapshot.val(); }
                };
              });
            }
          };
        },
        add: function (data) {
          const newRef = dbRef.push();
          return newRef.set(data).then(function() {
            return { id: newRef.key };
          });
        }
      };
    }
  };
})();
