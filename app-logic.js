/* =====================================================================
   app-logic.js
   Translations, theme, classes (free tier = 2), students (max 30 per
   class), Plus modal, and registerStudent() -> Supabase.
   Wrapped in an IIFE: the only global it adds is window.registerStudent.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const FREE_CLASS_LIMIT = 2;
  const MAX_STUDENTS = 30;
  const STORE_KEY = "classemates_v1";

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
      ageInvalid: "Enter a valid age (3–99)."
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
      ageInvalid: "Entrez un âge valide (3–99)."
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
      ageInvalid: "أدخل سنًّا صحيحًا (3–99)."
    }
  };

  /* ---------- State ---------- */
  const state = {
    lang: "en",
    theme: "dark",
    classes: [],          // { id, name, teacher, students: [{id,name,surname,age,level}] }
    currentClassId: null
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { console.warn("Could not read saved data", e); }
    if (!I18N[state.lang]) state.lang = "en";
    state.currentClassId = null;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn("Could not save data", e); }
  }

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const currentClass = () => state.classes.find((c) => c.id === state.currentClassId) || null;

  let toastTimer;
  function toast(msg, kind) {
    const el = $("#toast");
    el.textContent = msg;
    el.dataset.kind = kind || "info";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3600);
  }

  /* ---------- Language ---------- */
  function applyLanguage() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    $("#langSelect").value = state.lang;
    updateThemeButtons();
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

  function renderDetail(cls) {
    $("#detailName").textContent = cls.name;
    $("#detailTeacher").textContent = t("controllerLabel") + ": " + cls.teacher;
    const n = cls.students.length;
    $("#detailCount").textContent = n + " / " + MAX_STUDENTS + " " + t("capacity");
    $("#detailMeter").style.width = Math.round((n / MAX_STUDENTS) * 100) + "%";
    const body = $("#studentRows");
    if (!n) {
      body.innerHTML = `<tr><td colspan="4" class="muted">${esc(t("noStudents"))}</td></tr>`;
    } else {
      body.innerHTML = cls.students.map((s) => `
        <tr>
          <td>${esc(s.name)}</td>
          <td>${esc(s.surname)}</td>
          <td>${esc(s.age)}</td>
          <td>${esc(s.level)}</td>
        </tr>`).join("");
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
    if (!name || !teacher) { toast(t("required"), "error"); return; }
    state.classes.push({ id: uid(), name, teacher, students: [] });
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

  /* ---------- Students ---------- */
  function tryOpenAddStudent() {
    const cls = currentClass();
    if (!cls) return;
    if (cls.students.length >= MAX_STUDENTS) { toast(t("classFull"), "error"); return; }
    $("#studentForm").reset();
    openDialog("studentDialog");
    setTimeout(() => $("#stName").focus(), 30);
  }

  async function submitStudent(e) {
    e.preventDefault();
    const cls = currentClass();
    if (!cls) return;
    if (cls.students.length >= MAX_STUDENTS) { closeDialog("studentDialog"); toast(t("classFull"), "error"); return; }

    const name = $("#stName").value.trim();
    const age = parseInt($("#stAge").value, 10);
    const level = $("#stLevel").value.trim();
    const surname = $("#stSurname").value.trim();
    if (!name || !level || !surname || isNaN(age)) { toast(t("required"), "error"); return; }
    if (age < 3 || age > 99) { toast(t("ageInvalid"), "error"); return; }

    const btn = $("#studentSubmit");
    btn.disabled = true;
    const { error } = await registerStudent(name, age, level, surname, cls.id);
    btn.disabled = false;

    // The student is always kept locally so nothing is lost if the cloud is unreachable.
    cls.students.push({ id: uid(), name, surname, age, level });
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
    $("#langSelect").addEventListener("change", (e) => { state.lang = e.target.value; save(); applyLanguage(); });

    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      b.addEventListener("click", () => { state.theme = b.dataset.themeChoice; save(); applyTheme(); });
    });

    $("#openSettings").addEventListener("click", () => openDialog("settingsDialog"));
    $("#openPlus").addEventListener("click", () => openDialog("plusDialog"));
    $("#limitToPlus").addEventListener("click", () => { closeDialog("limitDialog"); openDialog("plusDialog"); });

    document.querySelectorAll("[data-create-class]").forEach((b) => b.addEventListener("click", tryOpenCreateClass));
    $("#classForm").addEventListener("submit", createClass);

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
    applyLanguage();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
