  /* ---------- Classroom sync (Realtime Database) ----------
     A classroom lives in the cloud at classes/{classId}, so the teacher
     and every student see the same roster at the same time on any
     device. Realtime Database can't store empty arrays, null entries
     or empty objects (they simply vanish), so a classroom is converted
     to a cloud-safe shape on the way up and rebuilt on the way down:
     students/joinRequests become maps keyed by id, and only the
     filled-in division seats / collaboration pairs are stored.
       - account_classes/{accountId}/{classId}: small index saying "this
         account belongs to that classroom", so a device can find its
         classrooms after logging in.
       - class_lookup/{lowercased class name}: classId, so a student can
         find a classroom by typing its name + secret code even if it
         was created on another device. */
  function classToCloud(cls) {
    const students = {};
    (cls.students || []).forEach((s) => { students[s.id] = { ...s, photo: s.photo || null, accountId: s.accountId || null }; });
    const joinRequests = {};
    (cls.joinRequests || []).forEach((r) => { joinRequests[r.id] = { ...r, photo: r.photo || null }; });
    const out = {
      id: cls.id, name: cls.name, teacher: cls.teacher, secret: cls.secret,
      ownerId: cls.ownerId || null, schoolId: cls.schoolId || null,
      students, joinRequests,
      orgInit: cls.org ? true : null,
      orgSlots: null, collabStartedAt: null, collabEndsAt: null, collabPairs: null
    };
    if (cls.org && Array.isArray(cls.org.slots)) {
      const seats = {};
      cls.org.slots.forEach((sid, i) => { if (sid) seats[i] = sid; });
      out.orgSlots = Object.keys(seats).length ? seats : null;
    }
    if (cls.collab) {
      out.collabStartedAt = cls.collab.startedAt;
      out.collabEndsAt = cls.collab.endsAt;
      out.collabPairs = cls.collab.pairs && Object.keys(cls.collab.pairs).length ? cls.collab.pairs : null;
    }
    return out;
  }
  function classFromCloud(raw) {
    const toList = (v) => (!v ? [] : Array.isArray(v) ? v.filter(Boolean) : Object.values(v));
    const cls = {
      id: raw.id, name: raw.name, teacher: raw.teacher, secret: raw.secret,
      ownerId: raw.ownerId || null, schoolId: raw.schoolId || null,
      students: toList(raw.students), joinRequests: toList(raw.joinRequests),
      org: null, collab: null
    };
    if (raw.orgInit) {
      const slots = new Array(ORG_LAYERS.length * 5).fill(null);
      const seats = raw.orgSlots || {};
      Object.keys(seats).forEach((k) => { const i = Number(k); if (!isNaN(i) && i >= 0 && i < slots.length) slots[i] = seats[k]; });
      cls.org = { slots };
    }
    if (raw.collabStartedAt) {
      cls.collab = { startedAt: raw.collabStartedAt, endsAt: raw.collabEndsAt, pairs: raw.collabPairs || {} };
    }
    return cls;
  }
  const classLookupKey = (name) => encodeURIComponent(String(name || "").trim().toLowerCase()).replace(/\./g, "%2E");

  const myClassListeners = {};   // classId -> { ref, cb }
  let myClassIndexListener = null;

  function syncClass(cls) {
    if (!window.rtdb || !cls || !cls.id) return;
    window.rtdb.ref("classes/" + cls.id).set(classToCloud(cls)).catch((err) => {
      console.warn("[Classe mates] Could not sync the classroom to Firebase:", err);
    });
    window.rtdb.ref("class_lookup/" + classLookupKey(cls.name)).set(cls.id).catch(() => {});
    const members = new Set();
    if (cls.ownerId) members.add(cls.ownerId.toLowerCase());
    (cls.students || []).forEach((s) => { if (s.accountId) members.add(s.accountId.toLowerCase()); });
    members.forEach((accId) => {
      window.rtdb.ref("account_classes/" + accId + "/" + cls.id).set(true).catch(() => {});
    });
  }
  function unsyncClass(cls) {
    if (!window.rtdb || !cls || !cls.id) return;
    window.rtdb.ref("classes/" + cls.id).remove().catch(() => {});
    window.rtdb.ref("class_lookup/" + classLookupKey(cls.name)).remove().catch(() => {});
    const members = new Set();
    if (cls.ownerId) members.add(cls.ownerId.toLowerCase());
    (cls.students || []).forEach((s) => { if (s.accountId) members.add(s.accountId.toLowerCase()); });
    members.forEach((accId) => {
      window.rtdb.ref("account_classes/" + accId + "/" + cls.id).remove().catch(() => {});
    });
  }
  function unsyncMember(classId, accountId) {
    if (!window.rtdb || !accountId) return;
    window.rtdb.ref("account_classes/" + accountId.toLowerCase() + "/" + classId).remove().catch(() => {});
  }

  /* A teacher on another device may have received join requests for a
     classroom this device owns: make sure each pending request has its
     inbox message here too, so it can be accepted or rejected. */
  function ensureJoinRequestMessages(cls) {
    if (!cls.ownerId || cls.ownerId.toLowerCase() !== (state.currentUserId || "").toLowerCase()) return;
    (cls.joinRequests || []).forEach((r) => {
      if (state.messages.some((m) => m.requestId === r.id)) return;
      state.messages.push({
        id: uid(), toId: cls.ownerId, fromId: r.accountId, fromLabel: r.name + " " + r.surname,
        kind: "joinRequest", classId: cls.id, className: cls.name, requestId: r.id,
        text: tf("joinRequestText", { name: r.name + " " + r.surname, class: cls.name }),
        createdAt: r.createdAt || new Date().toISOString()
      });
    });
  }

  function mergeClassFromCloud(raw) {
    if (!raw || !raw.id) return;
    const cls = classFromCloud(raw);
    const idx = state.classes.findIndex((c) => c.id === cls.id);
    if (idx === -1) state.classes.push(cls); else state.classes[idx] = cls;
    ensureJoinRequestMessages(cls);
    save();
    updateInboxBadge();
    render();
    subscribeToMyLiveNotices();
  }
  function dropClassLocally(classId) {
    const before = state.classes.length;
    state.classes = state.classes.filter((c) => c.id !== classId);
    if (state.currentClassId === classId) state.currentClassId = null;
    if (state.classes.length !== before) { save(); render(); }
  }

  /* After login: read this account's classroom index, then keep a live
     listener on each classroom so changes made on any other device show
     up here immediately. Classrooms that only exist on this device
     (created before this update) are uploaded once so they become
     visible everywhere. */
  function subscribeToMyClasses() {
    if (!window.rtdb || !state.currentUserId) return;
    const me = state.currentUserId.toLowerCase();
    state.classes.forEach((c) => {
      const mine = (c.ownerId && c.ownerId.toLowerCase() === me) || c.students.some((s) => (s.accountId || "").toLowerCase() === me);
      if (mine) syncClass(c);
    });
    const idxRef = window.rtdb.ref("account_classes/" + me);
    if (myClassIndexListener) myClassIndexListener.ref.off("value", myClassIndexListener.cb);
    const cb = (snap) => {
      const ids = snap.val() ? Object.keys(snap.val()) : [];
      ids.forEach((classId) => {
        if (myClassListeners[classId]) return;
        const ref = window.rtdb.ref("classes/" + classId);
        const ccb = (csnap) => {
          const raw = csnap.val();
          if (!raw) { dropClassLocally(classId); return; }
          mergeClassFromCloud(raw);
        };
        ref.on("value", ccb);
        myClassListeners[classId] = { ref, cb: ccb };
      });
      Object.keys(myClassListeners).forEach((classId) => {
        if (ids.indexOf(classId) === -1) {
          myClassListeners[classId].ref.off("value", myClassListeners[classId].cb);
          delete myClassListeners[classId];
          dropClassLocally(classId);
        }
      });
    };
    idxRef.on("value", cb);
    myClassIndexListener = { ref: idxRef, cb };
  }
  function stopMyClassListeners() {
    Object.keys(myClassListeners).forEach((classId) => {
      try { myClassListeners[classId].ref.off("value", myClassListeners[classId].cb); } catch (err) { /* gone */ }
      delete myClassListeners[classId];
    });
    if (myClassIndexListener) {
      try { myClassIndexListener.ref.off("value", myClassIndexListener.cb); } catch (err) { /* gone */ }
      myClassIndexListener = null;
    }
  }

  /* Find a classroom by name + secret code on the cloud (for a student
     joining a classroom that was created on another device). */
  async function cloudFindClass(name, secret) {
    if (!window.rtdb) return { cls: null, error: new Error("Firebase is not configured.") };
    try {
      const idSnap = await window.rtdb.ref("class_lookup/" + classLookupKey(name)).once("value");
      if (!idSnap.exists()) return { cls: null, error: null };
      const clsSnap = await window.rtdb.ref("classes/" + idSnap.val()).once("value");
      if (!clsSnap.exists()) return { cls: null, error: null };
      const cls = classFromCloud(clsSnap.val());
      if (cls.secret !== secret) return { cls: null, error: null };
      return { cls, error: null };
    } catch (err) {
      return { cls: null, error: err };
    }
  }

  /* ---------- Realtime Database writes ---------- */
  async function registerStudent(name, age, level, surname, classId) {
    if (!window.rtdb) {
      return { data: null, error: new Error("Firebase is not configured (see firebase-rtdb-config.js).") };
    }
    try {
      await window.rtdb.ref("students").push({
        name: name, age: Number(age), level: level, surname: surname, classId: String(classId),
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
  window.registerStudent = registerStudent;

  /* ---------- Shared account directory (Realtime Database), so an ID
     typed on one device can be found even if the account was created on
     another. The account's id (lowercased) is used directly as the
     database key, so a lookup is a single direct read, not a query. ---------- */
  async function cloudUpsertAccount(u) {
    if (!window.rtdb) return { error: new Error("Firebase is not configured.") };
    try {
      await window.rtdb.ref("accounts/" + u.id.toLowerCase()).update({
        id: u.id, password: u.password, name: u.name, surname: u.surname,
        age: Number(u.age), level: u.level, photo: u.photo || null,
        plus: !!u.plus, lastEdit: u.lastEdit || null
      });
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }
  async function cloudFindAccountById(id) {
    if (!window.rtdb) return { data: null, error: new Error("Firebase is not configured.") };
    try {
      const snap = await window.rtdb.ref("accounts/" + id.toLowerCase()).once("value");
      if (!snap.exists()) return { data: null, error: null };
      const data = snap.val();
      const user = {
        id: data.id, password: data.password, name: data.name, surname: data.surname,
        age: data.age, level: data.level, photo: data.photo || null,
        plus: !!data.plus, lastEdit: data.lastEdit || null
      };
      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
