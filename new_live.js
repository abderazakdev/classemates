  /* ---------- "START A MATE": live camera session (teacher -> students) ----------
     Uses two small corners of the Realtime Database purely for
     signaling — no video or audio ever passes through Firebase itself,
     only short-lived JSON handshake messages. The video stream goes
     directly from the teacher's device to each student's device (WebRTC
     peer-to-peer).
       - live_sessions/{classId}: active flag, the shared lesson-notes
         text, and the class name — every member of the class listens to
         this node live.
       - live_sessions/{classId}/signals: short-lived offer/answer/ICE
         messages addressed with a "to" field ("host" or a student's
         account id); each one is removed right after it's processed.
     This is a "mesh": the teacher's device opens one connection per
     connected student, which works well for a handful of viewers but
     gets heavy on the teacher's camera upload for a full class, and
     without a TURN server (see ICE_SERVERS above) some students on
     stricter networks won't be able to connect at all. */
  const livePeers = {};                 // host: studentId -> RTCPeerConnection | viewer: "host" -> RTCPeerConnection
  let liveSessionActive = null;         // classId currently being hosted or viewed on this device
  let liveRole = null;                  // "host" | "viewer"
  let liveLocalStream = null;
  const liveUnsubscribers = {};         // classId -> [{ ref, event, cb }] for the open session's listeners
  const liveNoticeUnsubs = {};          // classId -> { ref, cb }, for the lightweight "is it live" banner listener

  function liveSessionRef(classId) {
    if (!window.rtdb) return null;
    return window.rtdb.ref("live_sessions/" + classId);
  }
  function liveSignalsRef(classId) {
    if (!window.rtdb) return null;
    return window.rtdb.ref("live_sessions/" + classId + "/signals");
  }
  function sendSignal(classId, to, from, type, payload) {
    const ref = liveSignalsRef(classId);
    if (!ref) return;
    ref.push({ to, from, type, payload: payload || null, createdAt: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  }

  function renderLiveUI() {
    $("#liveLocalVideo").hidden = liveRole !== "host";
    $("#liveRemoteVideo").hidden = liveRole !== "viewer";
    $("#liveNotesBox").readOnly = liveRole !== "host";
    $("#liveEndBtn").textContent = liveRole === "host" ? t("liveEnd") : t("liveLeave");
  }

  function notifyClassLiveStarted(cls) {
    cls.students.forEach((s) => {
      if (!s.accountId) return;
      state.messages.push({
        id: uid(), toId: s.accountId, fromId: state.currentUserId, fromLabel: cls.teacher,
        kind: "liveSession", classId: cls.id, className: cls.name, text: t("liveInboxText"),
        createdAt: new Date().toISOString()
      });
    });
    save();
  }

  async function startLiveSession() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    if (!window.rtdb) { toast(t("liveNoCloud"), "error"); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast(t("liveNoCamera"), "error"); return; }

    try {
      liveLocalStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      toast(t("liveCameraDenied"), "error");
      return;
    }

    liveRole = "host";
    liveSessionActive = cls.id;
    Object.keys(livePeers).forEach((k) => delete livePeers[k]);
    $("#liveLocalVideo").srcObject = liveLocalStream;
    $("#liveNotesBox").value = "";
    renderLiveUI();
    openDialog("liveDialog");

    try {
      await liveSessionRef(cls.id).set({
        active: true, className: cls.name, notes: "", updatedAt: firebase.database.ServerValue.TIMESTAMP
      });
    } catch (err) {
      console.warn("[Classe mates] Could not start the live session on Firebase:", err);
      toast(t("liveNoCloud"), "error");
      endLiveSession(true);
      return;
    }
    notifyClassLiveStarted(cls);

    const signalsQuery = liveSignalsRef(cls.id).orderByChild("to").equalTo("host");
    const onAdded = (snap) => {
      const data = snap.val();
      if (data.type === "join") hostHandleJoin(data.from);
      else if (data.type === "answer") hostHandleAnswer(data);
      else if (data.type === "ice") hostHandleIce(data);
      snap.ref.remove().catch(() => {});
    };
    signalsQuery.on("child_added", onAdded);
    liveUnsubscribers[cls.id] = [{ ref: signalsQuery, event: "child_added", cb: onAdded }];
  }

  async function hostHandleJoin(studentId) {
    if (liveRole !== "host" || !liveSessionActive || !studentId) return;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    livePeers[studentId] = pc;
    liveLocalStream.getTracks().forEach((track) => pc.addTrack(track, liveLocalStream));
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(liveSessionActive, studentId, "host", "ice", { candidate: e.candidate.toJSON() });
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(liveSessionActive, studentId, "host", "offer", { sdp: { type: offer.type, sdp: offer.sdp } });
  }
  async function hostHandleAnswer(data) {
    const pc = livePeers[data.from];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
  }
  function hostHandleIce(data) {
    const pc = livePeers[data.from];
    if (pc) pc.addIceCandidate(new RTCIceCandidate(data.payload.candidate)).catch(() => {});
  }
  function hostBroadcastNotes() {
    if (liveRole !== "host" || !liveSessionActive) return;
    const ref = liveSessionRef(liveSessionActive);
    if (ref) ref.update({ notes: $("#liveNotesBox").value }).catch(() => {});
  }

  async function joinLiveSession(classId) {
    const cls = state.classes.find((c) => c.id === classId);
    if (!cls || !window.rtdb) return;
    liveRole = "viewer";
    liveSessionActive = classId;
    Object.keys(livePeers).forEach((k) => delete livePeers[k]);
    $("#liveRemoteVideo").srcObject = null;
    $("#liveNotesBox").value = "";
    renderLiveUI();
    openDialog("liveDialog");
    hideLiveBanner(classId);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    livePeers.host = pc;
    pc.ontrack = (e) => { $("#liveRemoteVideo").srcObject = e.streams[0]; };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(classId, "host", state.currentUserId, "ice", { candidate: e.candidate.toJSON() });
    };

    const signalsQuery = liveSignalsRef(classId).orderByChild("to").equalTo(state.currentUserId);
    const onAdded = async (snap) => {
      const data = snap.val();
      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(classId, "host", state.currentUserId, "answer", { sdp: { type: answer.type, sdp: answer.sdp } });
      } else if (data.type === "ice") {
        pc.addIceCandidate(new RTCIceCandidate(data.payload.candidate)).catch(() => {});
      }
      snap.ref.remove().catch(() => {});
    };
    signalsQuery.on("child_added", onAdded);

    const sessionRef = liveSessionRef(classId);
    const onSessionValue = (snap) => {
      const data = snap.val();
      if (!data) return;
      if (data.active === false) { endLiveSession(true); return; }
      if (typeof data.notes === "string") $("#liveNotesBox").value = data.notes;
    };
    sessionRef.on("value", onSessionValue);

    liveUnsubscribers[classId] = [
      { ref: signalsQuery, event: "child_added", cb: onAdded },
      { ref: sessionRef, event: "value", cb: onSessionValue }
    ];

    sendSignal(classId, "host", state.currentUserId, "join", {});
  }

  function endLiveSession(remote) {
    if (liveSessionActive && liveRole === "host" && !remote) {
      const ref = liveSessionRef(liveSessionActive);
      if (ref) ref.update({ active: false }).catch(() => {});
    }
    if (liveSessionActive && liveUnsubscribers[liveSessionActive]) {
      liveUnsubscribers[liveSessionActive].forEach((sub) => { try { sub.ref.off(sub.event, sub.cb); } catch (err) { /* already gone */ } });
      delete liveUnsubscribers[liveSessionActive];
    }
    Object.keys(livePeers).forEach((k) => { try { livePeers[k].close(); } catch (err) { /* already closed */ } delete livePeers[k]; });
    if (liveLocalStream) { liveLocalStream.getTracks().forEach((tr) => tr.stop()); liveLocalStream = null; }
    liveSessionActive = null;
    liveRole = null;
    closeDialog("liveDialog");
  }

  /* Lightweight "is a session live right now" notice, independent of
     actually joining: one listener per classroom this account belongs
     to, so a student sees a banner the moment a teacher goes live
     anywhere in the app, not only inside that classroom. Safe to call
     again whenever the list of classrooms changes. */
  function subscribeToMyLiveNotices() {
    if (!window.rtdb || !state.currentUserId) return;
    state.classes.forEach((c) => {
      if (!c.students.some((s) => s.accountId === state.currentUserId)) return;
      if (liveNoticeUnsubs[c.id]) return;
      const ref = liveSessionRef(c.id);
      if (!ref) return;
      const cb = (snap) => {
        const data = snap.val();
        if (data && data.active) showLiveBanner(c.id, data.className || c.name);
        else hideLiveBanner(c.id);
      };
      ref.on("value", cb);
      liveNoticeUnsubs[c.id] = { ref, cb };
    });
  }
  function stopLiveNoticeListeners() {
    Object.keys(liveNoticeUnsubs).forEach((id) => {
      try { liveNoticeUnsubs[id].ref.off("value", liveNoticeUnsubs[id].cb); } catch (err) { /* gone */ }
      delete liveNoticeUnsubs[id];
    });
  }
