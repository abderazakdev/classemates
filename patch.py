import re, sys, io
W = "/mnt/user-data/outputs/_wip/"
src = open(W + "base-app-logic.js", encoding="utf-8").read()
new_live = open(W + "new_live.js", encoding="utf-8").read()
new_cloud = open(W + "new_cloud.js", encoding="utf-8").read()

def must(cond, msg):
    if not cond:
        print("PATCH FAILED:", msg); sys.exit(1)

def replace_once(s, old, new, label):
    must(s.count(old) == 1, f"{label}: expected 1 match, found {s.count(old)}")
    return s.replace(old, new, 1)

# 1. live-session block -> native RTDB
a = src.index('  /* ---------- "START A MATE": live camera session')
endmark = "    liveNoticesSubscribed = true;\n  }\n"
b = src.index(endmark, a) + len(endmark)
src = src[:a] + new_live + src[b:]

# 2. cloud helper block -> RTDB + classroom sync
a = src.index("  /* ---------- Firestore transaction ---------- */")
b = src.index("  async function ensureAccountLocally")
src = src[:a] + new_cloud + "\n" + src[b:]

# 3. login/logout hooks
src = replace_once(src, "if (loggedIn) subscribeToMyLiveNotices();",
                   "if (loggedIn) { subscribeToMyClasses(); subscribeToMyLiveNotices(); }", "renderAuthGate")
src = replace_once(src, "    liveNoticesSubscribed = false;\n    renderAuthGate();",
                   "    stopMyClassListeners();\n    stopLiveNoticeListeners();\n    renderAuthGate();", "logout")

# 4. createClass
src = replace_once(src,
 "    state.classes.push({ id: uid(), name, teacher, secret, ownerId: state.currentUserId, schoolId: state.schoolId, students: [], joinRequests: [], collab: null });\n    save();",
 "    const newCls = { id: uid(), name, teacher, secret, ownerId: state.currentUserId, schoolId: state.schoolId, students: [], joinRequests: [], org: null, collab: null };\n    state.classes.push(newCls);\n    save();\n    syncClass(newCls);", "createClass")

# 5. deleteCurrentClass
src = replace_once(src,
 "    if (!window.confirm(t(\"confirmDelete\"))) return;\n    state.classes = state.classes.filter((c) => c.id !== cls.id);",
 "    if (!window.confirm(t(\"confirmDelete\"))) return;\n    unsyncClass(cls);\n    state.classes = state.classes.filter((c) => c.id !== cls.id);", "deleteClass")

# 6. add student
src = replace_once(src,
 "    cls.students.push({ id: uid(), accountId: acc.id, name: acc.name, surname: acc.surname, age: acc.age, level: acc.level, photo: acc.photo || null });\n    save();\n    closeDialog(\"studentDialog\");",
 "    cls.students.push({ id: uid(), accountId: acc.id, name: acc.name, surname: acc.surname, age: acc.age, level: acc.level, photo: acc.photo || null });\n    save();\n    syncClass(cls);\n    closeDialog(\"studentDialog\");", "submitStudent")

# 7. kick student
src = replace_once(src,
 "    const removedIds = cls.students\n      .filter((s) => (s.accountId || \"\").toLowerCase() === idVal.toLowerCase())\n      .map((s) => s.id);",
 "    const removedAccountIds = cls.students.filter((s) => (s.accountId || \"\").toLowerCase() === idVal.toLowerCase()).map((s) => s.accountId);\n    const removedIds = cls.students\n      .filter((s) => (s.accountId || \"\").toLowerCase() === idVal.toLowerCase())\n      .map((s) => s.id);", "kick-ids")
src = replace_once(src,
 "    save();\n    closeDialog(\"kickStudentDialog\");",
 "    save();\n    syncClass(cls);\n    removedAccountIds.forEach((accId) => unsyncMember(cls.id, accId));\n    closeDialog(\"kickStudentDialog\");", "kick-save")

# 8. division of the classroom
src = replace_once(src,
 "    if (orgEditMode) {\n      orgEditMode = false;\n      save();",
 "    if (orgEditMode) {\n      orgEditMode = false;\n      save();\n      syncClass(cls);", "toggleDivide")
src = replace_once(src,
 "    if (slotEl) slots[Number(slotEl.dataset.slot)] = studentId;\n    save();",
 "    if (slotEl) slots[Number(slotEl.dataset.slot)] = studentId;\n    save();\n    syncClass(cls);", "orgDrop")

# 9. collaboration mode
src = replace_once(src,
 "pairs: {} };\n    save();\n    toast(t(\"collabStarted\")",
 "pairs: {} };\n    save();\n    syncClass(cls);\n    toast(t(\"collabStarted\")", "startCollab")
src = replace_once(src,
 "    cls.collab = null;\n    save();\n    toast(t(\"collabEnded\")",
 "    cls.collab = null;\n    save();\n    syncClass(cls);\n    toast(t(\"collabEnded\")", "endCollab")
src = replace_once(src,
 "      cls.collab.pairs[toId] = fromId;\n      save();",
 "      cls.collab.pairs[toId] = fromId;\n      save();\n      syncClass(cls);", "collabDrop")

# 10. join requests: accept / reject (teacher side) write the whole class
src = replace_once(src,
 "    state.messages = state.messages.filter((m) => m.requestId !== requestId);\n    save();\n    openInbox();\n    render();",
 "    state.messages = state.messages.filter((m) => m.requestId !== requestId);\n    save();\n    state.classes.forEach((c) => { if (c.ownerId && c.ownerId.toLowerCase() === (state.currentUserId || \"\").toLowerCase()) syncClass(c); });\n    openInbox();\n    render();", "accept")
src = replace_once(src,
 "    state.messages = state.messages.filter((m) => m.requestId !== requestId);\n    save();\n    openInbox();\n  }",
 "    state.messages = state.messages.filter((m) => m.requestId !== requestId);\n    save();\n    state.classes.forEach((c) => { if (c.ownerId && c.ownerId.toLowerCase() === (state.currentUserId || \"\").toLowerCase()) syncClass(c); });\n    openInbox();\n  }", "reject")

# 11. student joins by code: look on the cloud when not found locally
src = replace_once(src, "  function submitJoin(e) {", "  async function submitJoin(e) {", "submitJoin-async")
src = replace_once(src,
 "    const cls = state.classes.find((c) => c.name.toLowerCase() === idVal.toLowerCase() && c.secret === secretVal);\n    if (!cls) { toast(t(\"joinFailed\"), \"error\"); return; }",
 "    let cls = state.classes.find((c) => c.name.toLowerCase() === idVal.toLowerCase() && c.secret === secretVal);\n    if (!cls) {\n      const found = await cloudFindClass(idVal, secretVal);\n      if (found.error) console.warn(\"[Classe mates] classroom lookup failed (check the Realtime Database rules):\", found.error);\n      if (!found.cls) { toast(t(\"joinFailed\"), \"error\"); return; }\n      cls = found.cls;\n      state.classes.push(cls);\n    }", "submitJoin-lookup")
# the request itself is written to its own cloud path, never overwriting the whole classroom
src = replace_once(src,
 "      text: tf(\"joinRequestText\", { name: u.name + \" \" + u.surname, class: cls.name }), createdAt: new Date().toISOString()\n    });\n    save();\n    closeDialog(\"joinDialog\");\n    toast(t(\"joinRequestSent\"), \"ok\");",
 "      text: tf(\"joinRequestText\", { name: u.name + \" \" + u.surname, class: cls.name }), createdAt: new Date().toISOString()\n    });\n    save();\n    if (window.rtdb) {\n      const sent = cls.joinRequests[cls.joinRequests.length - 1];\n      window.rtdb.ref(\"classes/\" + cls.id + \"/joinRequests/\" + reqId).set({ ...sent, photo: sent.photo || null }).catch((err) => console.warn(\"[Classe mates] Could not send the join request:\", err));\n    }\n    closeDialog(\"joinDialog\");\n    toast(t(\"joinRequestSent\"), \"ok\");", "submitJoin-request")
# legacy no-owner branch stays local; make sure a class that is NOT mine is not listed as mine
# 12. class list only shows classrooms this account belongs to
src = replace_once(src,
 "  function renderList() {\n    $(\"#usage\").textContent = state.classes.length + \" \" + t(\"classesUsed\");\n    const empty = $(\"#empty\");\n    const grid = $(\"#classGrid\");\n    empty.hidden = state.classes.length > 0;\n    $(\"#listHeader\").hidden = state.classes.length === 0;\n    grid.innerHTML = state.classes.map((c) => {",
 "  function myClasses() {\n    const me = (state.currentUserId || \"\").toLowerCase();\n    return state.classes.filter((c) => !c.ownerId || c.ownerId.toLowerCase() === me || c.students.some((s) => (s.accountId || \"\").toLowerCase() === me));\n  }\n  function renderList() {\n    const mine = myClasses();\n    $(\"#usage\").textContent = mine.length + \" \" + t(\"classesUsed\");\n    const empty = $(\"#empty\");\n    const grid = $(\"#classGrid\");\n    empty.hidden = mine.length > 0;\n    $(\"#listHeader\").hidden = mine.length === 0;\n    grid.innerHTML = mine.map((c) => {", "renderList")

# 13. wording
src = src.replace("check firebase-config.js", "check firebase-rtdb-config.js").replace("vérifiez firebase-config.js", "vérifiez firebase-rtdb-config.js").replace("تحقق من firebase-config.js", "تحقق من firebase-rtdb-config.js")
src = src.replace("(check the accounts collection/security rules in Firebase)", "(check the Realtime Database rules in Firebase)")

must("window.db" not in src, "leftover window.db")
must("firestore" not in src.lower(), "leftover firestore wording")
open(W + "app-logic.js", "w", encoding="utf-8").write(src)

# index.html: fix the broken CDN tags, load the Realtime Database library, new config file
h = open(W + "base-index.html", encoding="utf-8").read()
h = replace_once(h,
 '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>',
 '  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>', "cdn")
h = replace_once(h, '<script src="firebase-config.js"></script>', '<script src="firebase-rtdb-config.js?v=2.0"></script>', "cfg")
h = replace_once(h, '<script src="app-logic.js"></script>', '<script src="app-logic.js?v=2.0"></script>', "logic")
open(W + "index.html", "w", encoding="utf-8").write(h)
print("PATCH OK")
