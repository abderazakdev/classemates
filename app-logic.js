/* =====================================================================
   app-logic.js
   Translations, theme, accounts (local demo login), classes (free tier
   = 2 for teachers, join by ID + secret code, 1 class per free
   student), students added by existing account ID (never invented),
   profile with a 7-day edit lock, a live clock, a school-year
   calendar, Plus modal, and registerStudent() -> Supabase.
   Wrapped in an IIFE: the only global it adds is window.registerStudent.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const FREE_CLASS_LIMIT = 2;      // classrooms a free account can create
  const FREE_JOIN_LIMIT = 1;       // classrooms a free account can join
  const MAX_STUDENTS = 30;
  const PROFILE_EDIT_COOLDOWN_DAYS = 7;
  const STORE_KEY = "classemates_v1";
  const ID_RE = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*_)[A-Za-z0-9_]{4,24}$/;
  const PHOTO_MAX_PX = 320;

  /* ---------- Translation dictionary ---------- */
  const I18N = {
    en: {
      appName: "Classe mates",
      tagline: "Run your classroom from one calm place.",
      language: "Language",
      settings: "Settings",
      appearance: "Appearance",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      plus: "Plus",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      savedOk: "Saved.",
      back: "All classes",
      yourClasses: "Your classes",
      classesUsed: "classes used",
      createClass: "Create a classroom",
      emptyTitle: "No classroom yet",
      emptyText: "Start from zero: create your first classroom, then add your students.",
      className: "Classroom name",
      classNamePh: "e.g. Grade 6 – Maths",
      controller: "The Controller (teacher)",
      controllerPh: "Teacher's name",
      students: "Students",
      addStudent: "Add a student",
      addStudentHint: "The student must already have their own account. Ask them for their account ID.",
      studentIdLabel: "Student's account ID",
      accountNotFound: "No account found with that ID.",
      name: "Name",
      surname: "Surname",
      age: "Age",
      level: "Level / Grade",
      levelPh: "e.g. Grade 6",
      capacity: "seats taken",
      noStudents: "No students in this classroom yet.",
      classFull: "This classroom is full (30 students).",
      classCreated: "Classroom created.",
      studentAdded: "Student added.",
      savedCloud: "Saved to the cloud.",
      savedLocal: "Saved on this device. Cloud sync failed or is not set up.",
      deleteClass: "Delete classroom",
      confirmDelete: "Delete this classroom and its students from this device?",
      limitTitle: "Free plan limit reached",
      limitText: "A free account can create 2 classrooms. Subscribe to Plus for unlimited classrooms.",
      seePlus: "See Plus",
      plusTitle: "Classe mates Plus",
      plusIntro: "Everything in the free plan, without the limits.",
      benefit1: "Unlimited classrooms",
      benefit1d: "Go beyond the 2-classroom limit.",
      benefit2: "Co-teacher AI",
      benefit2d: "Tracks student challenges, shows progress analytics, assigns tasks and follows yearly performance.",
      comingSoon: "Coming soon",
      comingSoonD: "Payments are not open yet. We will announce Plus here first.",
      controllerLabel: "Controller",
      required: "Please fill in every field.",
      ageInvalid: "Enter a valid age (3–99).",
      /* Accounts */
      login: "Log in",
      signup: "Create account",
      accountId: "Account ID",
      password: "Password",
      photo: "Profile photo (optional)",
      idHint: "Latin letters, numbers and _ only. Must include at least one letter, one number and one underscore (e.g. sami_2010).",
      idInvalid: "Invalid account ID — see the hint under the field.",
      invalidLogin: "Incorrect account ID or password.",
      accountExists: "This account ID is already taken.",
      logout: "Log out",
      loggedInAs: "Signed in as",
      /* Join a classroom */
      joinClass: "Join a classroom",
      classIdLabel: "Classroom ID (name)",
      secretCode: "Classroom secret code",
      joinedOk: "You joined the classroom.",
      joinFailed: "No classroom matches that ID and code.",
      alreadyIn: "You are already in this classroom.",
      oneClassLimitTitle: "Free plan: one classroom per year",
      oneClassLimitText: "A free student account can join one classroom. Subscribe to Plus to join more than one.",
      /* Profile */
      profile: "Profile",
      editProfile: "Edit profile",
      saveProfile: "Save changes",
      profileLockedPrefix: "You can edit your profile again on",
      /* Calendar */
      calendar: "Calendar",
      schoolYear: "School year"
    },
    fr: {
      appName: "Classe mates",
      tagline: "Gérez votre classe depuis un seul endroit.",
      language: "Langue",
      settings: "Paramètres",
      appearance: "Apparence",
      darkMode: "Mode nuit",
      lightMode: "Mode jour",
      plus: "Plus",
      close: "Fermer",
      cancel: "Annuler",
      save: "Enregistrer",
      savedOk: "Enregistré.",
      back: "Toutes les classes",
      yourClasses: "Vos classes",
      classesUsed: "classes utilisées",
      createClass: "Créer une classe",
      emptyTitle: "Aucune classe pour l'instant",
      emptyText: "On repart de zéro : créez votre première classe, puis ajoutez vos élèves.",
      className: "Nom de la classe",
      classNamePh: "ex. 6e – Maths",
      controller: "Le Contrôleur (enseignant)",
      controllerPh: "Nom de l'enseignant",
      students: "Élèves",
      addStudent: "Ajouter un élève",
      addStudentHint: "L'élève doit déjà avoir son propre compte. Demandez-lui son identifiant de compte.",
      studentIdLabel: "Identifiant du compte de l'élève",
      accountNotFound: "Aucun compte trouvé avec cet identifiant.",
      name: "Nom",
      surname: "Prénom",
      age: "Âge",
      level: "Niveau / Classe",
      levelPh: "ex. 6e",
      capacity: "places occupées",
      noStudents: "Aucun élève dans cette classe pour l'instant.",
      classFull: "Cette classe est complète (30 élèves).",
      classCreated: "Classe créée.",
      studentAdded: "Élève ajouté.",
      savedCloud: "Enregistré dans le cloud.",
      savedLocal: "Enregistré sur cet appareil. La synchronisation cloud a échoué ou n'est pas configurée.",
      deleteClass: "Supprimer la classe",
      confirmDelete: "Supprimer cette classe et ses élèves de cet appareil ?",
      limitTitle: "Limite du forfait gratuit atteinte",
      limitText: "Un compte gratuit peut créer 2 classes. Passez à Plus pour des classes illimitées.",
      seePlus: "Découvrir Plus",
      plusTitle: "Classe mates Plus",
      plusIntro: "Tout le forfait gratuit, sans les limites.",
      benefit1: "Classes illimitées",
      benefit1d: "Dépassez la limite de 2 classes.",
      benefit2: "Co-teacher AI",
      benefit2d: "Suit les difficultés des élèves, affiche l'évolution, attribue des tâches et suit la performance annuelle.",
      comingSoon: "Bientôt disponible",
      comingSoonD: "Les paiements ne sont pas encore ouverts. Nous annoncerons Plus ici en premier.",
      controllerLabel: "Contrôleur",
      required: "Veuillez remplir tous les champs.",
      ageInvalid: "Entrez un âge valide (3–99).",
      /* Accounts */
      login: "Connexion",
      signup: "Créer un compte",
      accountId: "Identifiant du compte",
      password: "Mot de passe",
      photo: "Photo de profil (facultatif)",
      idHint: "Lettres latines, chiffres et _ uniquement. Doit contenir au moins une lettre, un chiffre et un tiret bas (ex. sami_2010).",
      idInvalid: "Identifiant invalide — voir l'indication sous le champ.",
      invalidLogin: "Identifiant ou mot de passe incorrect.",
      accountExists: "Cet identifiant est déjà utilisé.",
      logout: "Se déconnecter",
      loggedInAs: "Connecté en tant que",
      /* Join a classroom */
      joinClass: "Rejoindre une classe",
      classIdLabel: "Identifiant de la classe (nom)",
      secretCode: "Code secret de la classe",
      joinedOk: "Vous avez rejoint la classe.",
      joinFailed: "Aucune classe ne correspond à cet identifiant et ce code.",
      alreadyIn: "Vous êtes déjà dans cette classe.",
      oneClassLimitTitle: "Offre gratuite : une classe par an",
      oneClassLimitText: "Un compte élève gratuit peut rejoindre une seule classe. Passez à Plus pour en rejoindre plusieurs.",
      /* Profile */
      profile: "Profil",
      editProfile: "Modifier le profil",
      saveProfile: "Enregistrer les modifications",
      profileLockedPrefix: "Vous pourrez modifier votre profil à nouveau le",
      /* Calendar */
      calendar: "Calendrier",
      schoolYear: "Année scolaire"
    },
    ar: {
      appName: "Classe mates",
      tagline: "أدِر صفّك من مكان واحد هادئ.",
      language: "اللغة",
      settings: "الإعدادات",
      appearance: "المظهر",
      darkMode: "الوضع الليلي",
      lightMode: "الوضع الصباحي",
      plus: "Plus",
      close: "إغلاق",
      cancel: "إلغاء",
      save: "حفظ",
      savedOk: "تم الحفظ.",
      back: "كل الأقسام",
      yourClasses: "أقسامك",
      classesUsed: "أقسام مستعملة",
      createClass: "إنشاء قسم",
      emptyTitle: "لا يوجد أي قسم بعد",
      emptyText: "نبدأ من الصفر: أنشئ قسمك الأول ثم أضف تلاميذك.",
      className: "اسم القسم",
      classNamePh: "مثال: السادس – رياضيات",
      controller: "المتحكّم (المعلّم)",
      controllerPh: "اسم المعلّم",
      students: "التلاميذ",
      addStudent: "إضافة تلميذ",
      addStudentHint: "يجب أن يكون للتلميذ حساب خاص به مسبقاً. اطلب منه معرف حسابه.",
      studentIdLabel: "معرف حساب التلميذ",
      accountNotFound: "لا يوجد حساب بهذا المعرف.",
      name: "الاسم",
      surname: "اللقب",
      age: "السن",
      level: "المستوى / الصف",
      levelPh: "مثال: السادس",
      capacity: "مقاعد مشغولة",
      noStudents: "لا يوجد تلاميذ في هذا القسم بعد.",
      classFull: "هذا القسم ممتلئ (30 تلميذًا).",
      classCreated: "تم إنشاء القسم.",
      studentAdded: "تمت إضافة التلميذ.",
      savedCloud: "تم الحفظ في السحابة.",
      savedLocal: "تم الحفظ على هذا الجهاز. فشلت المزامنة السحابية أو لم يتم إعدادها.",
      deleteClass: "حذف القسم",
      confirmDelete: "هل تريد حذف هذا القسم وتلاميذه من هذا الجهاز؟",
      limitTitle: "تم بلوغ حدّ الحساب المجاني",
      limitText: "يمكن للحساب المجاني إنشاء قسمين فقط. اشترك في Plus للحصول على عدد غير محدود من الأقسام.",
      seePlus: "اكتشف Plus",
      plusTitle: "Classe mates Plus",
      plusIntro: "كل ما في الباقة المجانية، بلا حدود.",
      benefit1: "أقسام غير محدودة",
      benefit1d: "تجاوز حدّ القسمين.",
      benefit2: "مساعد Co-teacher AI",
      benefit2d: "يراقب صعوبات التلاميذ، ويعرض تحليلات التطوّر، ويكلّف بالمهام، ويتابع الأداء السنوي.",
      comingSoon: "قريباً",
      comingSoonD: "الدفع غير متاح بعد. سنعلن عن Plus هنا أولاً.",
      controllerLabel: "المتحكّم",
      required: "يرجى ملء كل الحقول.",
      ageInvalid: "أدخل سنًّا صحيحًا (3–99).",
      /* Accounts */
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      accountId: "معرف الحساب",
      password: "الرقم السري",
      photo: "صورة الحساب (اختياري)",
      idHint: "حروف لاتينية وأرقام و _ فقط. يجب أن يحتوي على حرف واحد على الأقل، ورقم واحد، وشرطة سفلية _ (مثال: sami_2010).",
      idInvalid: "معرف الحساب غير صالح — انظر التوضيح أسفل الحقل.",
      invalidLogin: "معرف الحساب أو الرقم السري غير صحيح.",
      accountExists: "معرف الحساب هذا مستعمل من قبل.",
      logout: "تسجيل الخروج",
      loggedInAs: "تم الدخول باسم",
      /* Join a classroom */
      joinClass: "الانضمام لقسم",
      classIdLabel: "معرف القسم (الاسم)",
      secretCode: "الرمز السري للقسم",
      joinedOk: "تم الانضمام إلى القسم.",
      joinFailed: "لا يوجد قسم يطابق هذا المعرف وهذا الرمز.",
      alreadyIn: "أنت منضم بالفعل إلى هذا القسم.",
      oneClassLimitTitle: "الباقة المجانية: قسم واحد في السنة",
      oneClassLimitText: "يمكن لحساب التلميذ المجاني الانضمام إلى قسم واحد فقط. اشترك في Plus للانضمام لأكثر من قسم.",
      /* Profile */
      profile: "البروفايل",
      editProfile: "تعديل البروفايل",
      saveProfile: "حفظ التعديلات",
      profileLockedPrefix: "يمكنك تعديل بروفايلك مجدداً بتاريخ",
      /* Calendar */
      calendar: "التقويم",
      schoolYear: "السنة الدراسية"
    }
  };

  /* ---------- State ---------- */
  const state = {
    lang: "en",
    theme: "dark",
    classes: [],          // { id, name, teacher, secret, ownerId, students: [{id,accountId,name,surname,age,level,photo}] }
    currentClassId: null,
    users: [],             // demo local accounts: { id, password, name, surname, age, level, photo, plus, lastEdit }
    currentUserId: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { console.warn("Could not read saved data", e); }
    if (!I18N[state.lang]) state.lang = "en";
    if (!Array.isArray(state.classes)) state.classes = [];
    if (!Array.isArray(state.users)) state.users = [];
    state.currentClassId = null;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
    catch (e) { console.warn("Could not save data (storage may be full)", e); return false; }
  }

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const currentClass = () => state.classes.find((c) => c.id === state.currentClassId) || null;
  const currentUser = () => state.users.find((u) => u.id === state.currentUserId) || null;
  const isLoggedIn = () => !!state.currentUserId;
  const isOwner = (cls) => !cls.ownerId || cls.ownerId === state.currentUserId;
  const idFormatOk = (id) => ID_RE.test(id);
  const localeFor = () => (state.lang === "ar" ? "ar" : state.lang === "fr" ? "fr" : "en");

  let toastTimer;
  function toast(msg, kind) {
    const el = $("#toast");
    el.textContent = msg;
    el.dataset.kind = kind || "info";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3600);
  }

  /* ---------- Image helper: resize/compress before storing ---------- */
  function readAndResizeImage(file, maxSize) {
    return new Promise((resolve) => {
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > maxSize || h > maxSize) {
              if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
              else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          } catch (err) {
            console.warn("Photo resize failed, using original.", err);
            resolve(reader.result);
          }
        };
        img.onerror = () => resolve(null);
        img.src = reader.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Language ---------- */
  function applyLanguage() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("#langSelect, #langSelectAuth").forEach((el) => { if (el) el.value = state.lang; });
    updateThemeButtons();
    tickClock();
    render();
  }

  /* ---------- Theme ---------- */
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    updateThemeButtons();
  }
  function updateThemeButtons() {
    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      const on = b.dataset.themeChoice === state.theme;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- Clock ---------- */
  function tickClock() {
    const el = $("#clockWidget");
    if (!el) return;
    const now = new Date();
    const timeEl = el.querySelector(".clock-time");
    const dateEl = el.querySelector(".clock-date");
    if (timeEl) timeEl.textContent = now.toLocaleTimeString(localeFor(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (dateEl) dateEl.textContent = now.toLocaleDateString(localeFor(), { weekday: "long", day: "numeric", month: "long" });
  }

  /* ---------- School-year calendar ---------- */
  function schoolYearMonths() {
    const now = new Date();
    const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1; // September = month 8
    const months = [];
    for (let i = 0; i < 10; i++) { // September through June
      const m = (8 + i) % 12;
      const y = startYear + Math.floor((8 + i) / 12);
      months.push({ year: y, month: m });
    }
    return months;
  }

  function renderCalendar() {
    const months = schoolYearMonths();
    const locale = localeFor();
    $("#calendarSubtitle").textContent = t("schoolYear") + " " + months[0].year + "–" + months[months.length - 1].year;
    const today = new Date();
    const dowNames = [0, 1, 2, 3, 4, 5, 6].map((d) => new Date(Date.UTC(2023, 0, 1 + d)).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" }));

    $("#calendarBody").innerHTML = months.map(({ year, month }) => {
      const first = new Date(year, month, 1);
      const startDow = first.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthName = first.toLocaleDateString(locale, { month: "long", year: "numeric" });
      let cells = "";
      for (let i = 0; i < startDow; i++) cells += '<span class="day empty"></span>';
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        cells += `<span class="day${isToday ? " today" : ""}">${d}</span>`;
      }
      return `<div class="cal-month"><h4>${esc(monthName)}</h4><div class="cal-grid">${dowNames.map((n) => `<span class="dow">${esc(n)}</span>`).join("")}${cells}</div></div>`;
    }).join("");
  }

  /* ---------- Auth gate ---------- */
  function renderAuthGate() {
    const loggedIn = isLoggedIn();
    $("#authOverlay").hidden = loggedIn;
    $("#appShell").hidden = !loggedIn;
    const u = currentUser();
    const chip = $("#accountChip");
    if (chip) chip.textContent = u ? (t("loggedInAs") + ": " + u.name + " " + u.surname) : "";
  }

  function setAuthTab(tab) {
    $("#authTabLogin").setAttribute("aria-selected", tab === "login" ? "true" : "false");
    $("#authTabSignup").setAttribute("aria-selected", tab === "signup" ? "true" : "false");
    $("#loginForm").hidden = tab !== "login";
    $("#signupForm").hidden = tab !== "signup";
  }

  function submitLogin(e) {
    e.preventDefault();
    const id = $("#loginId").value.trim();
    const pw = $("#loginPassword").value;
    if (!id || !pw) { toast(t("required"), "error"); return; }
    const user = state.users.find((u) => u.id.toLowerCase() === id.toLowerCase() && u.password === pw);
    if (!user) { toast(t("invalidLogin"), "error"); return; }
    state.currentUserId = user.id;
    save();
    $("#loginForm").reset();
    renderAuthGate();
    render();
  }

  async function submitSignup(e) {
    e.preventDefault();
    const id = $("#suId").value.trim();
    const pw = $("#suPassword").value;
    const name = $("#suName").value.trim();
    const surname = $("#suSurname").value.trim();
    const age = parseInt($("#suAge").value, 10);
    const level = $("#suLevel").value.trim();
    const fileInput = $("#suPhoto");

    if (!id || !pw || !name || !surname || !level || isNaN(age)) { toast(t("required"), "error"); return; }
    if (!idFormatOk(id)) { toast(t("idInvalid"), "error"); return; }
    if (age < 3 || age > 99) { toast(t("ageInvalid"), "error"); return; }
    if (state.users.some((u) => u.id.toLowerCase() === id.toLowerCase())) { toast(t("accountExists"), "error"); return; }

    const btn = $("#signupSubmit");
    if (btn) btn.disabled = true;
    const file = fileInput.files && fileInput.files[0];
    const photo = file ? await readAndResizeImage(file, PHOTO_MAX_PX) : null;
    if (btn) btn.disabled = false;

    state.users.push({ id, password: pw, name, surname, age, level, photo: photo || null, plus: false, lastEdit: null });
    state.currentUserId = id;
    save();
    $("#signupForm").reset();
    renderAuthGate();
    render();
  }

  function logout() {
    state.currentUserId = null;
    save();
    renderAuthGate();
  }

  /* ---------- Profile ---------- */
  function canEditProfile(u) {
    return !u.lastEdit || (Date.now() - u.lastEdit) >= PROFILE_EDIT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  }
  function nextEditDate(u) {
    return new Date(u.lastEdit + PROFILE_EDIT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  }

  function renderProfileView(u) {
    const av = $("#profileAvatar");
    if (u.photo) { av.style.backgroundImage = `url('${u.photo}')`; av.textContent = ""; }
    else { av.style.backgroundImage = ""; av.textContent = ((u.name || "").charAt(0) + (u.surname || "").charAt(0)).toUpperCase(); }
    $("#profileName").textContent = u.name + " " + u.surname;
    $("#profileIdLine").textContent = t("accountId") + ": " + u.id;
    $("#profileMetaLine").textContent = t("level") + ": " + u.level + " · " + t("age") + ": " + u.age;

    const editable = canEditProfile(u);
    const lockMsg = $("#profileLockMsg");
    $("#profileEditToggle").hidden = !editable;
    if (!editable) {
      lockMsg.hidden = false;
      lockMsg.textContent = t("profileLockedPrefix") + " " + nextEditDate(u).toLocaleDateString(localeFor());
    } else {
      lockMsg.hidden = true;
    }
  }

  function openProfileDialog() {
    const u = currentUser();
    if (!u) return;
    renderProfileView(u);
    $("#profileForm").hidden = true;
    openDialog("profileDialog");
  }

  function toggleProfileEdit() {
    const u = currentUser();
    if (!u || !canEditProfile(u)) return;
    const form = $("#profileForm");
    if (form.hidden) {
      $("#peName").value = u.name;
      $("#peSurname").value = u.surname;
      $("#peAge").value = u.age;
      $("#peLevel").value = u.level;
      form.hidden = false;
    } else {
      form.hidden = true;
    }
  }

  async function submitProfileEdit(e) {
    e.preventDefault();
    const u = currentUser();
    if (!u || !canEditProfile(u)) return;

    const name = $("#peName").value.trim();
    const surname = $("#peSurname").value.trim();
    const age = parseInt($("#peAge").value, 10);
    const level = $("#peLevel").value.trim();
    if (!name || !surname || !level || isNaN(age)) { toast(t("required"), "error"); return; }
    if (age < 3 || age > 99) { toast(t("ageInvalid"), "error"); return; }

    const btn = $("#profileSubmit");
    if (btn) btn.disabled = true;
    const file = $("#pePhoto").files && $("#pePhoto").files[0];
    const photo = file ? await readAndResizeImage(file, PHOTO_MAX_PX) : null;
    if (btn) btn.disabled = false;

    u.name = name; u.surname = surname; u.age = age; u.level = level;
    if (photo) u.photo = photo;
    u.lastEdit = Date.now();

    // Keep this person's student cards (in any classroom they joined) in sync.
    state.classes.forEach((c) => {
      c.students.forEach((s) => {
        if (s.accountId === u.id) {
          s.name = name; s.surname = surname; s.age = age; s.level = level;
          if (photo) s.photo = photo;
        }
      });
    });

    save();
    $("#profileForm").hidden = true;
    renderProfileView(u);
    renderAuthGate();
    render();
    toast(t("savedOk"), "ok");
  }

  /* ---------- Rendering ---------- */
  function render() {
    const list = $("#view-list");
    const detail = $("#view-detail");
    const cls = currentClass();
    list.hidden = !!cls;
    detail.hidden = !cls;
    if (cls) renderDetail(cls); else renderList();
  }

  function renderList() {
    $("#usage").textContent = state.classes.length + " / " + FREE_CLASS_LIMIT + " " + t("classesUsed");
    const empty = $("#empty");
    const grid = $("#classGrid");
    empty.hidden = state.classes.length > 0;
    $("#listHeader").hidden = state.classes.length === 0;
    grid.innerHTML = state.classes.map((c) => {
      const n = c.students.length;
      const pct = Math.round((n / MAX_STUDENTS) * 100);
      return `
        <button class="class-card" data-open="${esc(c.id)}">
          <span class="class-card__name">${esc(c.name)}</span>
          <span class="class-card__teacher">${esc(t("controllerLabel"))}: ${esc(c.teacher)}</span>
          <span class="meter" aria-hidden="true"><span style="width:${pct}%"></span></span>
          <span class="class-card__count">${n} / ${MAX_STUDENTS} ${esc(t("capacity"))}</span>
        </button>`;
    }).join("");
  }

  function avatarHtml(person) {
    const initials = (((person.name || "").charAt(0)) + ((person.surname || "").charAt(0))).toUpperCase();
    if (person.photo) {
      return `<span class="avatar" style="background-image:url('${person.photo}')" aria-hidden="true"></span>`;
    }
    return `<span class="avatar avatar--initials" aria-hidden="true">${esc(initials)}</span>`;
  }

  function renderDetail(cls) {
    $("#detailName").textContent = cls.name;
    $("#detailTeacher").textContent = t("controllerLabel") + ": " + cls.teacher;
    const n = cls.students.length;
    $("#detailCount").textContent = n + " / " + MAX_STUDENTS + " " + t("capacity");
    $("#detailMeter").style.width = Math.round((n / MAX_STUDENTS) * 100) + "%";

    const owner = isOwner(cls);
    $("#openAddStudent").hidden = !owner;
    $("#deleteClass").hidden = !owner;

    const grid = $("#studentGrid");
    if (!n) {
      grid.innerHTML = `<p class="muted">${esc(t("noStudents"))}</p>`;
    } else {
      grid.innerHTML = cls.students.map((s) => `
        <div class="student-card">
          ${avatarHtml(s)}
          <span class="student-card__name">${esc(s.name)} ${esc(s.surname)}</span>
          <span class="student-card__meta">${esc(t("level"))}: ${esc(s.level)}</span>
          <span class="student-card__meta">${esc(t("age"))}: ${esc(s.age)}</span>
        </div>`).join("");
    }
  }

  /* ---------- Dialog helpers ---------- */
  function openDialog(id) {
    const d = document.getElementById(id);
    if (d && !d.open) d.showModal();
  }
  function closeDialog(id) {
    const d = document.getElementById(id);
    if (d && d.open) d.close();
  }

  /* ---------- Classes ---------- */
  function tryOpenCreateClass() {
    if (state.classes.length >= FREE_CLASS_LIMIT) {
      openDialog("limitDialog");
      return;
    }
    $("#classForm").reset();
    openDialog("classDialog");
    setTimeout(() => $("#classNameInput").focus(), 30);
  }

  function createClass(e) {
    e.preventDefault();
    if (state.classes.length >= FREE_CLASS_LIMIT) { closeDialog("classDialog"); openDialog("limitDialog"); return; }
    const name = $("#classNameInput").value.trim();
    const teacher = $("#controllerInput").value.trim();
    const secret = $("#classSecretInput").value.trim();
    if (!name || !teacher || !secret) { toast(t("required"), "error"); return; }
    state.classes.push({ id: uid(), name, teacher, secret, ownerId: state.currentUserId, students: [] });
    save();
    closeDialog("classDialog");
    toast(t("classCreated"), "ok");
    render();
  }

  function deleteCurrentClass() {
    const cls = currentClass();
    if (!cls) return;
    if (!window.confirm(t("confirmDelete"))) return;
    state.classes = state.classes.filter((c) => c.id !== cls.id);
    state.currentClassId = null;
    save();
    render();
  }

  /* ---------- Join a classroom (student side, 1 free class per year) ---------- */
  function tryOpenJoinClass() {
    $("#joinForm").reset();
    openDialog("joinDialog");
    setTimeout(() => $("#joinClassId").focus(), 30);
  }

  function submitJoin(e) {
    e.preventDefault();
    const idVal = $("#joinClassId").value.trim();
    const secretVal = $("#joinSecret").value.trim();
    if (!idVal || !secretVal) { toast(t("required"), "error"); return; }

    const cls = state.classes.find((c) => c.name.toLowerCase() === idVal.toLowerCase() && c.secret === secretVal);
    if (!cls) { toast(t("joinFailed"), "error"); return; }

    const already = cls.students.some((s) => s.accountId === state.currentUserId);
    if (already) {
      closeDialog("joinDialog");
      state.currentClassId = cls.id;
      render();
      toast(t("alreadyIn"), "warn");
      return;
    }

    const u = currentUser();
    if (!u.plus) {
      const memberElsewhere = state.classes.some((c) => c.students.some((s) => s.accountId === u.id));
      if (memberElsewhere) { closeDialog("joinDialog"); openDialog("oneClassLimitDialog"); return; }
    }
    if (cls.students.length >= MAX_STUDENTS) { toast(t("classFull"), "error"); return; }

    cls.students.push({ id: uid(), accountId: u.id, name: u.name, surname: u.surname, age: u.age, level: u.level, photo: u.photo || null });
    save();
    closeDialog("joinDialog");
    state.currentClassId = cls.id;
    render();
    toast(t("joinedOk"), "ok");
  }

  /* ---------- Students (Controller adds an EXISTING account by its ID) ---------- */
  function tryOpenAddStudent() {
    const cls = currentClass();
    if (!cls) return;
    if (cls.students.length >= MAX_STUDENTS) { toast(t("classFull"), "error"); return; }
    $("#studentForm").reset();
    openDialog("studentDialog");
    setTimeout(() => $("#stAccountId").focus(), 30);
  }

  async function submitStudent(e) {
    e.preventDefault();
    const cls = currentClass();
    if (!cls) return;
    if (cls.students.length >= MAX_STUDENTS) { closeDialog("studentDialog"); toast(t("classFull"), "error"); return; }

    const idVal = $("#stAccountId").value.trim();
    if (!idVal) { toast(t("required"), "error"); return; }

    const acc = state.users.find((u) => u.id.toLowerCase() === idVal.toLowerCase());
    if (!acc) { toast(t("accountNotFound"), "error"); return; }

    const already = cls.students.some((s) => s.accountId === acc.id);
    if (already) { toast(t("alreadyIn"), "error"); return; }

    const btn = $("#studentSubmit");
    btn.disabled = true;
    const { error } = await registerStudent(acc.name, acc.age, acc.level, acc.surname, cls.id);
    btn.disabled = false;

    // The student is always kept locally so nothing is lost if the cloud is unreachable.
    cls.students.push({ id: uid(), accountId: acc.id, name: acc.name, surname: acc.surname, age: acc.age, level: acc.level, photo: acc.photo || null });
    save();
    closeDialog("studentDialog");
    toast(error ? t("savedLocal") : t("savedCloud"), error ? "warn" : "ok");
    if (error) console.warn("[Classe mates] Supabase insert failed:", error);
    render();
  }

  /* ---------- Supabase transaction ---------- */
  async function registerStudent(name, age, level, surname, classId) {
    const client = window.supabaseClient;
    if (!client) {
      return { data: null, error: new Error("Supabase client is not configured (see supabase-config.js).") };
    }
    try {
      const { data, error } = await client
        .from("students")
        .insert([{ name: name, age: Number(age), level: level, surname: surname, class_id: String(classId) }])
        .select();
      return { data: data, error: error };
    } catch (err) {
      return { data: null, error: err };
    }
  }
  window.registerStudent = registerStudent;

  /* ---------- Events ---------- */
  function bind() {
    document.querySelectorAll("#langSelect, #langSelectAuth").forEach((el) => {
      el.addEventListener("change", (e) => { state.lang = e.target.value; save(); applyLanguage(); });
    });

    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      b.addEventListener("click", () => { state.theme = b.dataset.themeChoice; save(); applyTheme(); });
    });

    $("#openSettings").addEventListener("click", () => openDialog("settingsDialog"));
    $("#openPlus").addEventListener("click", () => openDialog("plusDialog"));
    $("#limitToPlus").addEventListener("click", () => { closeDialog("limitDialog"); openDialog("plusDialog"); });
    $("#oneClassToPlus").addEventListener("click", () => { closeDialog("oneClassLimitDialog"); openDialog("plusDialog"); });

    document.querySelectorAll("[data-create-class]").forEach((b) => b.addEventListener("click", tryOpenCreateClass));
    document.querySelectorAll("[data-join-class]").forEach((b) => b.addEventListener("click", tryOpenJoinClass));
    $("#classForm").addEventListener("submit", createClass);
    $("#joinForm").addEventListener("submit", submitJoin);

    $("#classGrid").addEventListener("click", (e) => {
      const card = e.target.closest("[data-open]");
      if (!card) return;
      state.currentClassId = card.dataset.open;
      render();
      window.scrollTo({ top: 0 });
    });
    $("#backToList").addEventListener("click", () => { state.currentClassId = null; render(); });
    $("#deleteClass").addEventListener("click", deleteCurrentClass);

    $("#openAddStudent").addEventListener("click", tryOpenAddStudent);
    $("#studentForm").addEventListener("submit", submitStudent);

    // Auth
    $("#authTabLogin").addEventListener("click", () => setAuthTab("login"));
    $("#authTabSignup").addEventListener("click", () => setAuthTab("signup"));
    $("#loginForm").addEventListener("submit", submitLogin);
    $("#signupForm").addEventListener("submit", submitSignup);
    $("#logoutBtn").addEventListener("click", () => { closeDialog("settingsDialog"); logout(); });

    // Profile
    $("#openProfile").addEventListener("click", openProfileDialog);
    $("#profileEditToggle").addEventListener("click", toggleProfileEdit);
    $("#profileForm").addEventListener("submit", submitProfileEdit);

    // Calendar
    $("#openCalendar").addEventListener("click", () => { renderCalendar(); openDialog("calendarDialog"); });

    // Generic close buttons + click on backdrop
    document.querySelectorAll("[data-close-dialog]").forEach((b) => {
      b.addEventListener("click", () => closeDialog(b.dataset.closeDialog));
    });
    document.querySelectorAll("dialog").forEach((d) => {
      d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    load();
    bind();
    applyTheme();
    setAuthTab("login");
    renderAuthGate();
    applyLanguage();
    setInterval(tickClock, 1000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
