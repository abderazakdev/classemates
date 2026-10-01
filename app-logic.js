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
      /* Profile */
      profile: "Profile",
      editProfile: "Edit profile",
      saveProfile: "Save changes",
      profileLockedPrefix: "You can edit your profile again on",
      /* Calendar */
      calendar: "Calendar",
      schoolYear: "School year",
      /* Inbox */
      inbox: "Inbox",
      noMessages: "No messages yet.",
      from: "From",
      /* News */
      sendNews: "Send news",
      newsText: "News",
      newsPh: "Write the announcement for the whole classroom...",
      newsSent: "News sent to every student.",
      newsKind: "News",
      /* Messaging / peer profile */
      sendMessage: "Send message",
      message: "Message",
      messagePh: "Write a message...",
      attachment: "Attachment (image or video, optional)",
      messageSent: "Message sent.",
      /* Student action menu */
      actionHomework: "Send homework",
      actionChat: "Start a chat",
      actionReport: "End-of-year report",
      createRecord: "Add attendance record",
      editRecord: "Edit attendance record",
      homeworkPh: "Describe the homework...",
      homeworkSent: "Homework sent.",
      /* Chat */
      chatPh: "Write a message...",
      chatWindowOpen: "This chat closes 1 hour after it started.",
      chatWindowClosed: "This chat is closed (the 1-hour window is over).",
      required: "Please fill in every field.",
      /* Attendance */
      month: "Month",
      date: "Date",
      present: "Present",
      excused: "Excused absence?",
      excuseReason: "Reason",
      excuseReasonPh: "Reason for the absence...",
      yes: "Yes",
      no: "No",
      attendanceTitle: "Attendance record",
      attendanceSaved: "Attendance saved.",
      /* End-of-year report */
      reportTitle: "End-of-year report",
      reportPh: "Write the end-of-year report for this student...",
      printPdf: "Save as PDF",
      reportSaved: "Report saved.",
      /* Join requests */
      joinRequestSent: "Request sent. The teacher must accept it first.",
      joinRequestKind: "Join request",
      joinRequestText: "{name} wants to join {class}.",
      accept: "Accept",
      reject: "Reject",
      joinAccepted: "{name} accepted your request to join {class}.",
      joinRejected: "{name} declined your request to join {class}.",
      alreadyRequested: "You already sent a request to join this classroom.",
      /* Collaboration / project mode */
      startProject: "Start project",
      collabActive: "Project mode is on: drag a student onto another to pair them up as collaborators. Ends {date}.",
      collabEnd: "End project now",
      pairedWith: "Working with {name}",
      collabStarted: "Project mode started for 3 days.",
      collabEnded: "Project mode ended — everyone is back on their own.",
      send: "Send",
      classmatesTitle: "People in this classroom",
      /* Classroom division (org chart) */
      divideClass: "Divide the classroom",
      confirmDivision: "Confirm",
      activityTime: "Educational activities time",
      orgHint: "Drag a student card into a role slot. Drag it back to the pool below to unassign.",
      orgUnassigned: "Unassigned students",
      orgAllPlaced: "Every student has a role.",
      orgSaved: "Classroom division saved.",
      roleLeadership: "Class leadership",
      roleAdvisors: "Advisors",
      roleDiscipline: "Discipline officers",
      roleActivities: "Activities officers",
      roleCleanliness: "Cleanliness & environment officers",
      roleMembers: "Members",
      /* Partner-school gate */
      schoolGateTagline: "This app is reserved for partner schools. Choose your school and enter its code to continue.",
      schoolLabel: "School",
      schoolCode: "School code",
      continueBtn: "Continue",
      schoolCodeInvalid: "Incorrect school code.",
      bannedMessage: "Unfortunately, your account has been blocked because your school has left the Classe mates system.",
      /* Classroom settings */
      classSettings: "Classroom settings",
      kickStudent: "Expel a student",
      kickStudentLabel: "Student's account ID",
      kickedOk: "Student removed from the classroom.",
      kickNotFound: "No student with that account ID in this classroom.",
      /* Homework answer */
      replyAnswer: "Send your answer",
      answerPh: "Write your answer...",
      answerSent: "Answer sent.",
      answerKind: "Homework answer",
      yourAnswer: "Your answer",
      /* Per-school data export */
      exportSchoolBtn: "Export this school's data",
      schoolExportOk: "School data file downloaded.",
      /* Study Farm */
      farmNavTitle: "Study Farm",
      farmDialogTitle: "Study Farm",
      farmIntro: "Pick an animal and explain that subject's lesson to it, out loud or in writing.",
      subjectMath: "Math",
      subjectScience: "Science",
      subjectArabic: "Arabic",
      subjectFrench: "French",
      subjectEnglish: "English",
      farmExplainHint: "Explain the lesson in your own words. The animal listens for the key ideas of this subject.",
      explainPh: "Start explaining here...",
      startSpeaking: "Start speaking",
      stopSpeaking: "Stop",
      farmListening: "Listening...",
      farmNoMic: "Voice input isn't available in this browser — you can still type your explanation.",
      submitExplanation: "Submit to the farm",
      farmCovered: "Ideas you covered",
      farmMissing: "Ideas to add",
      farmGreatJob: "covered every key idea.",
      farmReportSent: "Sent to your teacher.",
      farmNoTeacher: "Saved, but you're not in a classroom yet, so no teacher could be notified.",
      farmReportKind: "Study Farm report"
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
      /* Profile */
      profile: "Profil",
      editProfile: "Modifier le profil",
      saveProfile: "Enregistrer les modifications",
      profileLockedPrefix: "Vous pourrez modifier votre profil à nouveau le",
      /* Calendar */
      calendar: "Calendrier",
      schoolYear: "Année scolaire",
      inbox: "Messagerie",
      noMessages: "Aucun message pour l'instant.",
      from: "De",
      sendNews: "Envoyer une actualité",
      newsText: "Actualité",
      newsPh: "Écrivez l'annonce pour toute la classe...",
      newsSent: "Actualité envoyée à tous les élèves.",
      newsKind: "Actualité",
      sendMessage: "Envoyer un message",
      message: "Message",
      messagePh: "Écrivez un message...",
      attachment: "Pièce jointe (image ou vidéo, facultatif)",
      messageSent: "Message envoyé.",
      actionHomework: "Envoyer un devoir",
      actionChat: "Démarrer une discussion",
      actionReport: "Rapport de fin d'année",
      createRecord: "Ajouter un relevé de présence",
      editRecord: "Modifier le relevé de présence",
      homeworkPh: "Décrivez le devoir...",
      homeworkSent: "Devoir envoyé.",
      chatPh: "Écrivez un message...",
      chatWindowOpen: "Cette discussion se ferme 1 heure après son début.",
      chatWindowClosed: "Cette discussion est fermée (la fenêtre d'1 heure est terminée).",
      required: "Veuillez remplir tous les champs.",
      month: "Mois",
      date: "Date",
      present: "Présent",
      excused: "Absence justifiée ?",
      excuseReason: "Motif",
      excuseReasonPh: "Motif de l'absence...",
      yes: "Oui",
      no: "Non",
      attendanceTitle: "Relevé de présence",
      attendanceSaved: "Présence enregistrée.",
      reportTitle: "Rapport de fin d'année",
      reportPh: "Rédigez le rapport de fin d'année pour cet élève...",
      printPdf: "Enregistrer en PDF",
      reportSaved: "Rapport enregistré.",
      joinRequestSent: "Demande envoyée. L'enseignant doit d'abord l'accepter.",
      joinRequestKind: "Demande pour rejoindre",
      joinRequestText: "{name} veut rejoindre {class}.",
      accept: "Accepter",
      reject: "Refuser",
      joinAccepted: "{name} a accepté votre demande pour rejoindre {class}.",
      joinRejected: "{name} a refusé votre demande pour rejoindre {class}.",
      alreadyRequested: "Vous avez déjà envoyé une demande pour rejoindre cette classe.",
      startProject: "Démarrer un projet",
      collabActive: "Le mode projet est actif : glissez un élève sur un autre pour les associer. Se termine le {date}.",
      collabEnd: "Terminer le projet maintenant",
      pairedWith: "Travaille avec {name}",
      collabStarted: "Mode projet démarré pour 3 jours.",
      collabEnded: "Le mode projet est terminé — chacun retrouve sa place.",
      send: "Envoyer",
      classmatesTitle: "Personnes de cette classe",
      /* Classroom division (org chart) */
      divideClass: "Diviser la classe",
      confirmDivision: "Confirmer",
      activityTime: "Temps des activités éducatives",
      orgHint: "Glissez une carte d'élève dans une case de rôle. Reglissez-la vers la liste ci-dessous pour la désassigner.",
      orgUnassigned: "Élèves non assignés",
      orgAllPlaced: "Chaque élève a un rôle.",
      orgSaved: "Répartition de la classe enregistrée.",
      roleLeadership: "Direction de la classe",
      roleAdvisors: "Conseillers",
      roleDiscipline: "Responsables de la discipline",
      roleActivities: "Responsables des activités",
      roleCleanliness: "Responsables de la propreté",
      roleMembers: "Membres",
      /* Portail des écoles partenaires */
      schoolGateTagline: "Cette application est réservée aux écoles partenaires. Choisissez votre école et entrez son code pour continuer.",
      schoolLabel: "École",
      schoolCode: "Code de l'école",
      continueBtn: "Continuer",
      schoolCodeInvalid: "Code d'école incorrect.",
      bannedMessage: "Malheureusement, votre compte a été bloqué car votre école a quitté le système Classe mates.",
      /* Paramètres de la classe */
      classSettings: "Paramètres de la classe",
      kickStudent: "Exclure un élève",
      kickStudentLabel: "Identifiant du compte de l'élève",
      kickedOk: "Élève retiré de la classe.",
      kickNotFound: "Aucun élève avec cet identifiant dans cette classe.",
      /* Réponse au devoir */
      replyAnswer: "Envoyer votre réponse",
      answerPh: "Écrivez votre réponse...",
      answerSent: "Réponse envoyée.",
      answerKind: "Réponse au devoir",
      yourAnswer: "Votre réponse",
      /* Export des données de l'école */
      exportSchoolBtn: "Exporter les données de cette école",
      schoolExportOk: "Fichier de données de l'école téléchargé.",
      /* Ferme d'étude */
      farmNavTitle: "Ferme d'étude",
      farmDialogTitle: "Ferme d'étude",
      farmIntro: "Choisissez un animal et expliquez-lui la leçon de sa matière, à voix haute ou par écrit.",
      subjectMath: "Mathématiques",
      subjectScience: "Sciences",
      subjectArabic: "Arabe",
      subjectFrench: "Français",
      subjectEnglish: "Anglais",
      farmExplainHint: "Expliquez la leçon avec vos propres mots. L'animal écoute les idées clés de cette matière.",
      explainPh: "Commencez à expliquer ici...",
      startSpeaking: "Parler",
      stopSpeaking: "Arrêter",
      farmListening: "Écoute en cours...",
      farmNoMic: "La saisie vocale n'est pas disponible sur ce navigateur — vous pouvez toujours écrire votre explication.",
      submitExplanation: "Envoyer à la ferme",
      farmCovered: "Idées abordées",
      farmMissing: "Idées à ajouter",
      farmGreatJob: "a couvert toutes les idées clés.",
      farmReportSent: "Envoyé à votre enseignant.",
      farmNoTeacher: "Enregistré, mais vous n'êtes dans aucune classe pour l'instant, donc aucun enseignant n'a pu être averti.",
      farmReportKind: "Rapport de la ferme d'étude"
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
      /* Profile */
      profile: "البروفايل",
      editProfile: "تعديل البروفايل",
      saveProfile: "حفظ التعديلات",
      profileLockedPrefix: "يمكنك تعديل بروفايلك مجدداً بتاريخ",
      /* Calendar */
      calendar: "التقويم",
      schoolYear: "السنة الدراسية",
      inbox: "البريد",
      noMessages: "لا توجد رسائل بعد.",
      from: "من",
      sendNews: "إرسال خبر",
      newsText: "الخبر",
      newsPh: "اكتب الإعلان لكل تلاميذ القسم...",
      newsSent: "تم إرسال الخبر لكل التلاميذ.",
      newsKind: "خبر",
      sendMessage: "إرسال رسالة",
      message: "الرسالة",
      messagePh: "اكتب رسالة...",
      attachment: "مرفق (صورة أو فيديو، اختياري)",
      messageSent: "تم إرسال الرسالة.",
      actionHomework: "إرسال واجب منزلي",
      actionChat: "بدء محادثة",
      actionReport: "تقرير نهاية السنة",
      createRecord: "إضافة سجل حضور",
      editRecord: "تعديل سجل الحضور",
      homeworkPh: "اكتب الواجب المنزلي...",
      homeworkSent: "تم إرسال الواجب.",
      chatPh: "اكتب رسالة...",
      chatWindowOpen: "تُغلق هذه المحادثة بعد ساعة واحدة من بدايتها.",
      chatWindowClosed: "هذه المحادثة مغلقة (انتهت مدة الساعة).",
      required: "يرجى ملء كل الحقول.",
      month: "الشهر",
      date: "التاريخ",
      present: "حاضر",
      excused: "غياب بعذر؟",
      excuseReason: "السبب",
      excuseReasonPh: "سبب الغياب...",
      yes: "نعم",
      no: "لا",
      attendanceTitle: "سجل الحضور",
      attendanceSaved: "تم حفظ الحضور.",
      reportTitle: "تقرير نهاية السنة",
      reportPh: "اكتب تقرير نهاية السنة عن هذا التلميذ...",
      printPdf: "حفظ كملف PDF",
      reportSaved: "تم حفظ التقرير.",
      joinRequestSent: "تم إرسال الطلب. يجب على الأستاذ قبوله أولاً.",
      joinRequestKind: "طلب انضمام",
      joinRequestText: "{name} يريد الانضمام إلى {class}.",
      accept: "قبول",
      reject: "رفض",
      joinAccepted: "قبل {name} طلبك للانضمام إلى {class}.",
      joinRejected: "رفض {name} طلبك للانضمام إلى {class}.",
      alreadyRequested: "لقد أرسلت طلب انضمام لهذا القسم بالفعل.",
      startProject: "بدء مشروع",
      collabActive: "وضع المشروع مفعّل: اسحب مربع تلميذ فوق تلميذ آخر لتجميعهما كمتعاونين. ينتهي في {date}.",
      collabEnd: "إنهاء المشروع الآن",
      pairedWith: "يتعاون مع {name}",
      collabStarted: "بدأ وضع المشروع لمدة 3 أيام.",
      collabEnded: "انتهى وضع المشروع — عاد كل تلميذ لوحده.",
      send: "إرسال",
      classmatesTitle: "أعضاء هذا القسم",
      /* تقسيم القسم */
      divideClass: "تقسيم القسم",
      confirmDivision: "تأكيد",
      activityTime: "وقت الأنشطة التربوية",
      orgHint: "اسحب مربع التلميذ إلى إحدى الخانات. أعد سحبه إلى القائمة بالأسفل لإلغاء تعيينه.",
      orgUnassigned: "التلاميذ غير المُعيَّنين",
      orgAllPlaced: "تم تعيين دور لكل تلميذ.",
      orgSaved: "تم حفظ تقسيم القسم.",
      roleLeadership: "رئاسة القسم",
      roleAdvisors: "المستشارون",
      roleDiscipline: "مسؤولو النظام",
      roleActivities: "مسؤولو الأنشطة",
      roleCleanliness: "مسؤولو النظافة والبيئة",
      roleMembers: "الأعضاء",
      /* بوابة المدارس الشريكة */
      schoolGateTagline: "هذا التطبيق مخصص للمدارس الشريكة فقط. اختر مدرستك وأدخل رمزها السري للمتابعة.",
      schoolLabel: "المدرسة",
      schoolCode: "الرمز السري للمدرسة",
      continueBtn: "متابعة",
      schoolCodeInvalid: "الرمز السري للمدرسة غير صحيح.",
      bannedMessage: "للأسف تم حظر حسابكم بسبب خروج المدرسة من نظام كلاس ميتز.",
      /* إعدادات القسم */
      classSettings: "إعدادات القسم",
      kickStudent: "طرد تلميذ",
      kickStudentLabel: "معرف حساب التلميذ",
      kickedOk: "تم طرد التلميذ من القسم.",
      kickNotFound: "لا يوجد تلميذ بهذا المعرف في هذا القسم.",
      /* الإجابة عن الواجب */
      replyAnswer: "إرسال إجابتك",
      answerPh: "اكتب إجابتك...",
      answerSent: "تم إرسال الإجابة.",
      answerKind: "إجابة عن واجب",
      yourAnswer: "إجابتك",
      /* تصدير بيانات المدرسة */
      exportSchoolBtn: "تصدير بيانات هذه المدرسة",
      schoolExportOk: "تم تنزيل ملف بيانات المدرسة.",
      /* مزرعة الدراسة */
      farmNavTitle: "مزرعة الدراسة",
      farmDialogTitle: "مزرعة الدراسة",
      farmIntro: "اختر حيواناً واشرح له درس مادته، بصوتك أو بالكتابة.",
      subjectMath: "الرياضيات",
      subjectScience: "العلوم",
      subjectArabic: "اللغة العربية",
      subjectFrench: "اللغة الفرنسية",
      subjectEnglish: "اللغة الإنجليزية",
      farmExplainHint: "اشرح الدرس بكلماتك الخاصة. الحيوان يستمع للأفكار الأساسية لهذه المادة.",
      explainPh: "ابدأ الشرح هنا...",
      startSpeaking: "ابدأ التحدث",
      stopSpeaking: "إيقاف",
      farmListening: "جارٍ الاستماع...",
      farmNoMic: "الإدخال الصوتي غير متاح في هذا المتصفح — يمكنك دائماً كتابة شرحك.",
      submitExplanation: "إرسال للمزرعة",
      farmCovered: "الأفكار التي ذكرتها",
      farmMissing: "أفكار عليك إضافتها",
      farmGreatJob: "ذكرت كل الأفكار الأساسية.",
      farmReportSent: "تم الإرسال إلى أستاذك.",
      farmNoTeacher: "تم الحفظ، لكنك لست منضماً لأي قسم بعد، فلم يصل إشعار لأي أستاذ.",
      farmReportKind: "تقرير مزرعة الدراسة"
    }
  };

  // ---------------------------------------------------------------------
  // Partner schools. This is the ONE place to edit to add or remove a
  // school:
  //   - To ADD a school, add a line: { id: "unique_id", name: "Displayed name", code: "SecretCode" }.
  //   - To REMOVE a school, delete its line. Every account already
  //     registered under that school will then see a "your account was
  //     blocked" screen the next time it tries to log in, and the school
  //     gate will ask again on any device that had it selected.
  // ---------------------------------------------------------------------
  const SCHOOLS = [
    { id: "al_murabitin", name: "مدرسة المرابطين", code: "Test10154546ibrahim" }
  ];

  // ---------------------------------------------------------------------
  // Study Farm: one animal per subject. This is a simple placeholder
  // design (emoji + color) — swap the "emoji"/"color" per animal, or add
  // a real "art" field later, once the final animal/farm artwork is
  // ready. "keyPoints" are the words the farm listens for when a student
  // explains that subject's lesson out loud or in writing; it is a plain
  // keyword check, not real language understanding, so keep each list
  // short and central to the topic. Add a new animal by adding a line;
  // remove one by deleting its line.
  // ---------------------------------------------------------------------
  const FARM_ANIMALS = [
    { id: "owl_math", emoji: "🦉", color: "#2F6FD6", subjectKey: "subjectMath",
      keyPoints: ["عدد", "جمع", "طرح", "ضرب", "قسمة", "كسر", "هندسة"] },
    { id: "bear_science", emoji: "🐻", color: "#1F8A4C", subjectKey: "subjectScience",
      keyPoints: ["نبات", "حيوان", "خلية", "طاقة", "ماء", "هواء", "تجربة"] },
    { id: "fox_arabic", emoji: "🦊", color: "#C4592B", subjectKey: "subjectArabic",
      keyPoints: ["فعل", "اسم", "حرف", "جملة", "فاعل", "مفعول"] },
    { id: "rabbit_french", emoji: "🐰", color: "#7A4FD6", subjectKey: "subjectFrench",
      keyPoints: ["verbe", "nom", "phrase", "sujet", "conjugaison"] },
    { id: "koala_english", emoji: "🐨", color: "#2AA3A3", subjectKey: "subjectEnglish",
      keyPoints: ["verb", "noun", "sentence", "subject", "tense"] }
  ];

  /* ---------- State ---------- */
  const state = {
    lang: "en",
    theme: "dark",
    schoolId: null,        // which partner school this device has been verified for
    classes: [],          // { id, name, teacher, secret, ownerId, students: [{id,accountId,name,surname,age,level,photo}], joinRequests: [], collab: null|{startedAt,endsAt,pairs} }
    currentClassId: null,
    users: [],             // demo local accounts: { id, password, name, surname, age, level, photo, plus, lastEdit, schoolId }
    currentUserId: null,
    messages: [],           // inbox notifications: { id, toId, fromId, fromLabel, kind, classId, className, text, createdAt, requestId?, attachment?, attachmentType? }
    chats: {},               // chatKey -> { startedAt, messages: [{ from, text, at }] }
    records: {},             // "classId::studentId" -> { "YYYY-MM-DD": { present: bool, excused: bool, reason: "" } }
    reports: {}              // "classId::studentId" -> report text
  };
  const COLLAB_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;   // project mode lasts 3 days
  const CHAT_WINDOW_MS = 60 * 60 * 1000;              // chat stays open for 1 hour
  const ORG_LAYERS = [
    { key: "roleLeadership" },
    { key: "roleAdvisors" },
    { key: "roleDiscipline" },
    { key: "roleActivities" },
    { key: "roleCleanliness" },
    { key: "roleMembers" }
  ]; // 6 layers x 5 slots = 30 seats (matches MAX_STUDENTS)

  // Transient (not persisted): which dialog is currently talking about whom.
  const activeCtx = { classId: null, studentId: null, peer: null };
  let orgEditMode = false; // whether the classroom-division editor is currently open

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { console.warn("Could not read saved data", e); }
    if (!I18N[state.lang]) state.lang = "en";
    if (!Array.isArray(state.classes)) state.classes = [];
    state.classes.forEach((c) => {
      if (!Array.isArray(c.joinRequests)) c.joinRequests = [];
      if (c.collab === undefined) c.collab = null;
      if (c.org === undefined) c.org = null;
      if (c.schoolId === undefined) c.schoolId = null;
    });
    if (!Array.isArray(state.users)) state.users = [];
    if (!Array.isArray(state.messages)) state.messages = [];
    if (!state.chats || typeof state.chats !== "object") state.chats = {};
    if (!state.records || typeof state.records !== "object") state.records = {};
    if (!state.reports || typeof state.reports !== "object") state.reports = {};
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
  const tf = (key, params) => Object.keys(params || {}).reduce((s, k) => s.replace("{" + k + "}", params[k]), t(key));
  const findUserById = (id) => state.users.find((u) => u.id.toLowerCase() === String(id).toLowerCase());
  const chatKey = (classId, accountId) => classId + "::" + accountId;
  const recordKey = (classId, studentId) => classId + "::" + studentId;
  const hasPendingRequest = (cls, userId) => (cls.joinRequests || []).some((r) => r.accountId === userId);
  function cleanExpiredCollab(cls) {
    if (cls.collab && Date.now() > new Date(cls.collab.endsAt).getTime()) {
      cls.collab = null;
      save();
    }
  }
  const teacherPerson = (cls) => {
    const owner = findUserById(cls.ownerId || "");
    return owner || { name: cls.teacher, surname: "", photo: null, id: cls.ownerId };
  };
  function studentById(studentId) {
    for (const cls of state.classes) {
      const student = cls.students.find((s) => s.id === studentId);
      if (student) return { cls, student };
    }
    return { cls: null, student: null };
  }
  function updateInboxBadge() {
    const badge = $("#inboxBadge");
    if (!badge) return;
    const n = state.messages.filter((m) => m.toId === state.currentUserId).length;
    badge.hidden = n === 0;
    badge.textContent = n > 99 ? "99+" : String(n);
  }

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
    document.querySelectorAll("#langSelect, #langSelectAuth, #langSelectSchool").forEach((el) => { if (el) el.value = state.lang; });
    updateThemeButtons();
    tickClock();
    updateInboxBadge();
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

  /* ---------- Partner-school gate ---------- */
  function isSchoolActive(schoolId) {
    return SCHOOLS.some((s) => s.id === schoolId);
  }
  function checkAccountBanned(user) {
    return !!(user && user.schoolId && !isSchoolActive(user.schoolId));
  }
  function populateSchoolSelect() {
    const sel = $("#schoolSelect");
    if (!sel) return;
    sel.innerHTML = SCHOOLS.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
  }
  function submitSchoolGate(e) {
    e.preventDefault();
    const schoolId = $("#schoolSelect").value;
    const code = $("#schoolCodeInput").value.trim();
    const school = SCHOOLS.find((s) => s.id === schoolId);
    if (!school || code !== school.code) { toast(t("schoolCodeInvalid"), "error"); return; }
    state.schoolId = school.id;
    save();
    $("#schoolGateForm").reset();
    renderAuthGate();
  }
  function showBannedOverlay() {
    $("#bannedOverlay").hidden = false;
  }
  function closeBannedOverlay() {
    $("#bannedOverlay").hidden = true;
    renderAuthGate();
  }

  /* ---------- Study Farm ----------
     A separate space from classrooms: one animal per subject. The
     student explains that subject's lesson (by voice where the browser
     supports it, or by typing) and the app checks which of that
     subject's key ideas were mentioned — a plain keyword check, not
     real language understanding — then reports it to every teacher
     whose classroom this student belongs to. */
  let activeFarmAnimalId = null;
  let farmRecognition = null;
  let farmRecognizing = false;

  function renderFarmGrid() {
    $("#farmGrid").innerHTML = FARM_ANIMALS.map((a) => `
      <button type="button" class="farm-animal" data-animal="${esc(a.id)}" style="--animal-color:${esc(a.color)}">
        <span class="farm-animal__emoji" aria-hidden="true">${a.emoji}</span>
        <span class="farm-animal__subject">${esc(t(a.subjectKey))}</span>
      </button>`).join("");
  }
  function openFarm() {
    renderFarmGrid();
    openDialog("farmDialog");
  }
  function openFarmAnimal(animalId) {
    const animal = FARM_ANIMALS.find((a) => a.id === animalId);
    if (!animal) return;
    activeFarmAnimalId = animalId;
    closeDialog("farmDialog");
    $("#farmExplainEmoji").textContent = animal.emoji;
    $("#farmExplainSubject").textContent = t(animal.subjectKey);
    $("#farmExplainText").value = "";
    $("#farmResult").hidden = true;
    $("#farmResult").innerHTML = "";
    $("#farmMicBtn").hidden = !(window.SpeechRecognition || window.webkitSpeechRecognition);
    $("#farmMicBtn").textContent = t("startSpeaking");
    stopFarmSpeech();
    openDialog("farmExplainDialog");
  }

  function toggleFarmSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast(t("farmNoMic"), "warn"); return; }
    if (farmRecognizing) { stopFarmSpeech(); return; }
    farmRecognition = new SR();
    farmRecognition.lang = state.lang === "ar" ? "ar-SA" : state.lang === "fr" ? "fr-FR" : "en-US";
    farmRecognition.continuous = true;
    farmRecognition.interimResults = false;
    farmRecognition.onresult = (e) => {
      let added = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) added += e.results[i][0].transcript + " ";
      }
      if (added) {
        const box = $("#farmExplainText");
        box.value = (box.value ? box.value.trim() + " " : "") + added.trim();
      }
    };
    farmRecognition.onerror = () => stopFarmSpeech();
    farmRecognition.onend = () => { if (farmRecognizing) stopFarmSpeech(); };
    try {
      farmRecognition.start();
      farmRecognizing = true;
      $("#farmMicBtn").textContent = t("stopSpeaking");
      $("#farmMicBtn").classList.add("farm-mic--live");
    } catch (err) { stopFarmSpeech(); }
  }
  function stopFarmSpeech() {
    if (farmRecognition) { try { farmRecognition.stop(); } catch (err) { /* already stopped */ } }
    farmRecognizing = false;
    const btn = $("#farmMicBtn");
    if (btn) { btn.textContent = t("startSpeaking"); btn.classList.remove("farm-mic--live"); }
  }

  function evaluateExplanation(text, keyPoints) {
    const norm = (text || "").toLowerCase();
    const covered = [];
    const missing = [];
    keyPoints.forEach((k) => (norm.includes(k.toLowerCase()) ? covered : missing).push(k));
    return { covered, missing };
  }

  function submitFarmExplanation() {
    const text = $("#farmExplainText").value.trim();
    const animal = FARM_ANIMALS.find((a) => a.id === activeFarmAnimalId);
    if (!animal || !text) { toast(t("required"), "error"); return; }
    stopFarmSpeech();

    const { covered, missing } = evaluateExplanation(text, animal.keyPoints);
    const resultEl = $("#farmResult");
    resultEl.hidden = false;
    resultEl.innerHTML = `
      ${covered.length ? `<p><strong>${esc(t("farmCovered"))}:</strong> ${covered.map(esc).join("، ")}</p>` : ""}
      ${missing.length ? `<p><strong>${esc(t("farmMissing"))}:</strong> ${missing.map(esc).join("، ")}</p>` : `<p>${animal.emoji} ${esc(t("farmGreatJob"))}</p>`}
    `;

    const u = currentUser();
    const teacherIds = new Set();
    state.classes.forEach((c) => { if (c.students.some((s) => s.accountId === state.currentUserId)) teacherIds.add(c.ownerId); });

    if (teacherIds.size && u) {
      const summary = `${t(animal.subjectKey)} — ${animal.emoji}\n${text}\n\n${t("farmCovered")}: ${covered.join("، ") || "—"}\n${t("farmMissing")}: ${missing.join("، ") || "—"}`;
      teacherIds.forEach((teacherId) => {
        if (!teacherId) return;
        state.messages.push({
          id: uid(), toId: teacherId, fromId: state.currentUserId, fromLabel: u.name + " " + u.surname,
          kind: "farmReport", classId: null, className: t(animal.subjectKey), text: summary,
          createdAt: new Date().toISOString()
        });
      });
      save();
      toast(t("farmReportSent"), "ok");
    } else {
      toast(t("farmNoTeacher"), "warn");
    }
  }

  /* ---------- Per-school data export ----------
     Gathers everything on THIS device tagged with a given school: its
     accounts (teachers and students, password left out), classrooms,
     attendance records, end-of-year reports, chat threads and mailbox
     messages between its own accounts. Downloads one JSON file. This
     only covers what has been created or synced on this browser/device —
     see the note in the chat reply about the app not yet being fully
     cross-device. */
  function collectSchoolData(schoolId) {
    const users = state.users.filter((u) => u.schoolId === schoolId);
    const userIds = new Set(users.map((u) => u.id));
    const classes = state.classes.filter((c) => c.schoolId === schoolId);
    const classIds = new Set(classes.map((c) => c.id));

    const records = {};
    Object.keys(state.records || {}).forEach((k) => { if (classIds.has(k.split("::")[0])) records[k] = state.records[k]; });
    const reports = {};
    Object.keys(state.reports || {}).forEach((k) => { if (classIds.has(k.split("::")[0])) reports[k] = state.reports[k]; });
    const chats = {};
    Object.keys(state.chats || {}).forEach((k) => { if (classIds.has(k.split("::")[0])) chats[k] = state.chats[k]; });
    const messages = state.messages.filter((m) => userIds.has(m.toId) || userIds.has(m.fromId));

    const school = SCHOOLS.find((s) => s.id === schoolId);
    return {
      exportedAt: new Date().toISOString(),
      schoolId,
      schoolName: school ? school.name : schoolId,
      accounts: users.map((u) => ({ ...u, password: undefined })),
      classes, records, reports, chats, messages
    };
  }
  function exportSchoolData() {
    const schoolId = state.schoolId;
    if (!schoolId) return;
    const data = collectSchoolData(schoolId);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `classe-mates-${schoolId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(t("schoolExportOk"), "ok");
  }

  /* ---------- Auth gate ---------- */
  function renderAuthGate() {
    // A device must pass the partner-school gate before it ever sees login/signup.
    if (state.schoolId && !isSchoolActive(state.schoolId)) state.schoolId = null;
    const schoolOk = !!state.schoolId;
    $("#schoolGateOverlay").hidden = schoolOk;
    if (!schoolOk) {
      populateSchoolSelect();
      $("#authOverlay").hidden = true;
      $("#appShell").hidden = true;
      return;
    }

    // An already-logged-in account may belong to a school that was removed since.
    if (state.currentUserId) {
      const u = currentUser();
      if (checkAccountBanned(u)) {
        state.currentUserId = null;
        save();
        showBannedOverlay();
      }
    }

    const loggedIn = isLoggedIn();
    $("#authOverlay").hidden = loggedIn;
    $("#appShell").hidden = !loggedIn;
    const u = currentUser();
    const chip = $("#accountChip");
    if (chip) chip.textContent = u ? (t("loggedInAs") + ": " + u.name + " " + u.surname) : "";
    updateInboxBadge();
  }

  function setAuthTab(tab) {
    $("#authTabLogin").setAttribute("aria-selected", tab === "login" ? "true" : "false");
    $("#authTabSignup").setAttribute("aria-selected", tab === "signup" ? "true" : "false");
    $("#loginForm").hidden = tab !== "login";
    $("#signupForm").hidden = tab !== "signup";
  }

  async function submitLogin(e) {
    e.preventDefault();
    const id = $("#loginId").value.trim();
    const pw = $("#loginPassword").value;
    if (!id || !pw) { toast(t("required"), "error"); return; }
    let user = state.users.find((u) => u.id.toLowerCase() === id.toLowerCase());
    if (!user) {
      const { data } = await cloudFindAccountById(id);
      if (data) { state.users.push(data); save(); user = data; }
    }
    if (!user || user.password !== pw) { toast(t("invalidLogin"), "error"); return; }
    if (checkAccountBanned(user)) { $("#loginForm").reset(); showBannedOverlay(); return; }
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

    state.users.push({ id, password: pw, name, surname, age, level, photo: photo || null, plus: false, lastEdit: null, schoolId: state.schoolId });
    state.currentUserId = id;
    save();
    cloudUpsertAccount(state.users[state.users.length - 1]).then(({ error }) => {
      if (error) console.warn("[Classe mates] Could not sync account to the cloud:", error);
    });
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
    cloudUpsertAccount(u).then(({ error }) => {
      if (error) console.warn("[Classe mates] Could not sync profile update to the cloud:", error);
    });
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
    $("#usage").textContent = state.classes.length + " " + t("classesUsed");
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
    cleanExpiredCollab(cls);
    $("#detailName").textContent = cls.name;
    $("#detailTeacher").textContent = t("controllerLabel") + ": " + cls.teacher;
    const n = cls.students.length;
    $("#detailCount").textContent = n + " / " + MAX_STUDENTS + " " + t("capacity");
    $("#detailMeter").style.width = Math.round((n / MAX_STUDENTS) * 100) + "%";

    const owner = isOwner(cls);
    $("#openAddStudent").hidden = !owner || orgEditMode;
    $("#deleteClass").hidden = !owner || orgEditMode;
    $("#openNews").hidden = !owner || orgEditMode;
    $("#openCollab").hidden = !owner || orgEditMode;
    $("#openClassSettings").hidden = !owner || orgEditMode;

    const divideBtn = $("#openDivide");
    divideBtn.hidden = !owner;
    divideBtn.textContent = orgEditMode ? t("confirmDivision") : (cls.org ? t("activityTime") : t("divideClass"));

    $("#orgEditor").hidden = !orgEditMode;
    $("#studentGrid").hidden = orgEditMode;
    if (orgEditMode) renderOrgEditor(cls);

    const banner = $("#collabBanner");
    if (owner && !orgEditMode && cls.collab) {
      banner.hidden = false;
      const dateStr = new Date(cls.collab.endsAt).toLocaleString(localeFor());
      banner.innerHTML = `<div>${esc(tf("collabActive", { date: dateStr }))}</div>
        <button type="button" id="collabEndBtn" class="btn" style="margin-top:8px;">${esc(t("collabEnd"))}</button>`;
    } else {
      banner.hidden = true;
      banner.innerHTML = "";
    }

    const grid = $("#studentGrid");
    if (owner) {
      if (!n) {
        grid.innerHTML = `<p class="muted">${esc(t("noStudents"))}</p>`;
      } else {
        const pairs = (cls.collab && cls.collab.pairs) || {};
        grid.innerHTML = cls.students.map((s) => {
          const partnerId = pairs[s.id];
          const partner = partnerId ? cls.students.find((x) => x.id === partnerId) : null;
          const draggable = !!cls.collab;
          return `
          <div class="student-card${partner ? " student-card--paired" : ""}" data-student="${esc(s.id)}"
               ${draggable ? 'draggable="true"' : ""} style="cursor:pointer">
            ${avatarHtml(s)}
            <span class="student-card__name">${esc(s.name)} ${esc(s.surname)}</span>
            <span class="student-card__meta">${esc(t("level"))}: ${esc(s.level)}</span>
            <span class="student-card__meta">${esc(t("age"))}: ${esc(s.age)}</span>
            ${partner ? `<span class="student-card__pair-label">${esc(tf("pairedWith", { name: partner.name + " " + partner.surname }))}</span>` : ""}
          </div>`;
        }).join("");
      }
    } else {
      const teacher = teacherPerson(cls);
      const peers = cls.students.filter((s) => s.accountId !== state.currentUserId);
      const cards = [];
      cards.push(`
        <div class="student-card student-card--peer student-card--teacher" data-peer-teacher="1">
          ${avatarHtml(teacher)}
          <span class="student-card__name">${esc(teacher.name || cls.teacher)} ${esc(teacher.surname || "")}</span>
          <span class="student-card__meta">${esc(t("controllerLabel"))}</span>
        </div>`);
      peers.forEach((s) => {
        cards.push(`
        <div class="student-card student-card--peer" data-peer-student="${esc(s.id)}">
          ${avatarHtml(s)}
          <span class="student-card__name">${esc(s.name)} ${esc(s.surname)}</span>
          <span class="student-card__meta">${esc(t("level"))}: ${esc(s.level)}</span>
        </div>`);
      });
      grid.innerHTML = cards.join("");
    }
  }

  /* ---------- Classroom division (6 role layers x 5 seats, drag & drop) ---------- */
  function toggleDivide() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    if (orgEditMode) {
      orgEditMode = false;
      save();
      toast(t("orgSaved"), "ok");
    } else {
      if (!cls.org) cls.org = { slots: new Array(ORG_LAYERS.length * 5).fill(null) };
      orgEditMode = true;
    }
    renderDetail(cls);
  }

  function renderOrgEditor(cls) {
    if (!cls.org) return;
    const slots = cls.org.slots;
    const assignedIds = new Set(slots.filter(Boolean));
    const pool = cls.students.filter((s) => !assignedIds.has(s.id));

    const layersHtml = ORG_LAYERS.map((layer, li) => {
      const cellsHtml = [0, 1, 2, 3, 4].map((ci) => {
        const idx = li * 5 + ci;
        const sId = slots[idx];
        const student = sId ? cls.students.find((s) => s.id === sId) : null;
        if (student) {
          return `<div class="org-slot filled" draggable="true" data-slot="${idx}" data-student="${esc(student.id)}">
            ${avatarHtml(student)}<span class="org-slot__name">${esc(student.name)} ${esc(student.surname)}</span></div>`;
        }
        return `<div class="org-slot" data-slot="${idx}"><span class="org-slot__role">${esc(t(layer.key))}</span></div>`;
      }).join("");
      return `<div class="org-layer"><h4>${esc(t(layer.key))}</h4><div class="org-grid">${cellsHtml}</div></div>`;
    }).join("");

    const poolHtml = pool.length
      ? pool.map((s) => `<div class="student-card" draggable="true" data-student="${esc(s.id)}">${avatarHtml(s)}<span class="student-card__name">${esc(s.name)} ${esc(s.surname)}</span></div>`).join("")
      : `<p class="muted">${esc(t("orgAllPlaced"))}</p>`;

    $("#orgEditor").innerHTML = `
      <p class="muted org-hint">${esc(t("orgHint"))}</p>
      ${layersHtml}
      <h3 class="org-pool-title">${esc(t("orgUnassigned"))}</h3>
      <div class="org-pool">${poolHtml}</div>`;
  }

  function handleOrgDragStart(e) {
    const card = e.target.closest('[data-student][draggable="true"]');
    if (card) e.dataTransfer.setData("text/plain", card.dataset.student);
  }
  function handleOrgDragOver(e) {
    const slot = e.target.closest(".org-slot");
    const pool = e.target.closest(".org-pool");
    if (slot || pool) { e.preventDefault(); if (slot) slot.classList.add("collab-dragover"); }
  }
  function handleOrgDragLeave(e) {
    const slot = e.target.closest(".org-slot");
    if (slot) slot.classList.remove("collab-dragover");
  }
  function handleOrgDrop(e) {
    const cls = currentClass();
    if (!cls || !cls.org) return;
    const studentId = e.dataTransfer.getData("text/plain");
    if (!studentId) return;
    const slotEl = e.target.closest(".org-slot");
    const poolEl = e.target.closest(".org-pool");
    if (!slotEl && !poolEl) return;
    e.preventDefault();
    if (slotEl) slotEl.classList.remove("collab-dragover");
    const slots = cls.org.slots;
    for (let i = 0; i < slots.length; i++) { if (slots[i] === studentId) slots[i] = null; }
    if (slotEl) slots[Number(slotEl.dataset.slot)] = studentId;
    save();
    renderOrgEditor(cls);
  }

  /* ---------- Classroom settings: expel a student ---------- */
  function openClassSettings() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    openDialog("classSettingsDialog");
  }
  function openKickStudent() {
    $("#kickStudentForm").reset();
    closeDialog("classSettingsDialog");
    openDialog("kickStudentDialog");
    setTimeout(() => $("#kickAccountId").focus(), 30);
  }
  function submitKickStudent(e) {
    e.preventDefault();
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    const idVal = $("#kickAccountId").value.trim();
    if (!idVal) { toast(t("required"), "error"); return; }
    const removedIds = cls.students
      .filter((s) => (s.accountId || "").toLowerCase() === idVal.toLowerCase())
      .map((s) => s.id);
    if (!removedIds.length) { toast(t("kickNotFound"), "error"); return; }
    cls.students = cls.students.filter((s) => !removedIds.includes(s.id));
    if (cls.org) {
      cls.org.slots = cls.org.slots.map((sId) => (removedIds.includes(sId) ? null : sId));
    }
    if (cls.collab && cls.collab.pairs) {
      removedIds.forEach((rid) => {
        const partner = cls.collab.pairs[rid];
        delete cls.collab.pairs[rid];
        if (partner) delete cls.collab.pairs[partner];
      });
    }
    save();
    closeDialog("kickStudentDialog");
    toast(t("kickedOk"), "ok");
    render();
  }

  function setAvatarEl(el, person) {
    if (!el) return;
    if (person.photo) { el.style.backgroundImage = `url('${person.photo}')`; el.textContent = ""; }
    else { el.style.backgroundImage = ""; el.textContent = (((person.name || "").charAt(0)) + ((person.surname || "").charAt(0))).toUpperCase(); }
  }

  /* ---------- Student action menu (Controller clicks a student card) ---------- */
  function openStudentActions(cls, student) {
    activeCtx.classId = cls.id;
    activeCtx.studentId = student.id;
    setAvatarEl($("#saAvatar"), student);
    $("#saName").textContent = student.name + " " + student.surname;
    const key = recordKey(cls.id, student.id);
    $("#actAttendance").textContent = state.records[key] ? t("editRecord") : t("createRecord");
    openDialog("studentActionsDialog");
  }

  /* ---------- Peer profile (classmates & teacher, seen from a student's own view) ---------- */
  function openPeerProfile(person, opts) {
    activeCtx.peer = { accountId: person.id || person.accountId, classId: opts.classId, studentId: opts.studentId || null, isTeacher: !!opts.isTeacher };
    setAvatarEl($("#peerAvatar"), person);
    $("#peerName").textContent = (person.name || "") + " " + (person.surname || "");
    $("#peerMeta").textContent = opts.isTeacher ? t("controllerLabel") : (t("level") + ": " + (person.level || ""));
    $("#peerChatBtn").hidden = !opts.isTeacher;
    openDialog("peerDialog");
  }

  /* ---------- Homework ---------- */
  function openHomework() {
    $("#hwText").value = "";
    $("#hwFile").value = "";
    closeDialog("studentActionsDialog");
    openDialog("homeworkDialog");
  }
  function submitHomework(e) {
    e.preventDefault();
    const text = $("#hwText").value.trim();
    if (!text) { toast(t("required"), "error"); return; }
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const file = $("#hwFile").files && $("#hwFile").files[0];
    const finish = (dataUrl, type) => {
      state.messages.push({
        id: uid(), toId: student.accountId, fromId: state.currentUserId, fromLabel: cls.teacher,
        kind: "homework", classId: cls.id, className: cls.name, text,
        attachment: dataUrl || null, attachmentType: type || null, createdAt: new Date().toISOString(),
        answered: false, answerText: null
      });
      save();
      closeDialog("homeworkDialog");
      toast(t("homeworkSent"), "ok");
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = () => finish(reader.result, file.type.startsWith("video") ? "video" : "image");
      reader.onerror = () => finish(null, null);
      reader.readAsDataURL(file);
    } else {
      finish(null, null);
    }
  }

  /* ---------- Homework answer (student replies from the inbox) ---------- */
  let answeringMessageId = null;
  function openHomeworkAnswer(messageId) {
    answeringMessageId = messageId;
    $("#hwAnswerText").value = "";
    closeDialog("inboxDialog");
    openDialog("homeworkAnswerDialog");
    setTimeout(() => $("#hwAnswerText").focus(), 30);
  }
  function submitHomeworkAnswer(e) {
    e.preventDefault();
    const text = $("#hwAnswerText").value.trim();
    if (!text) { toast(t("required"), "error"); return; }
    const original = state.messages.find((m) => m.id === answeringMessageId);
    if (!original) { closeDialog("homeworkAnswerDialog"); return; }
    original.answered = true;
    original.answerText = text;
    const u = currentUser();
    state.messages.push({
      id: uid(), toId: original.fromId, fromId: state.currentUserId,
      fromLabel: u ? (u.name + " " + u.surname) : "",
      kind: "homeworkAnswer", classId: original.classId, className: original.className,
      text, createdAt: new Date().toISOString()
    });
    save();
    closeDialog("homeworkAnswerDialog");
    toast(t("answerSent"), "ok");
    openInbox();
  }

  /* ---------- Chat (closes 1 hour after it starts) ---------- */
  function openChat() {
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const key = chatKey(cls.id, student.accountId);
    let thread = state.chats[key];
    if (!thread) { thread = { startedAt: new Date().toISOString(), messages: [] }; state.chats[key] = thread; save(); }
    renderChat();
    closeDialog("studentActionsDialog");
    closeDialog("peerDialog");
    openDialog("chatDialog");
  }
  function chatIsOpen(thread) {
    return Date.now() - new Date(thread.startedAt).getTime() < CHAT_WINDOW_MS;
  }
  function renderChat() {
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const key = chatKey(cls.id, student.accountId);
    const thread = state.chats[key];
    if (!thread) return;
    const open = chatIsOpen(thread);
    $("#chatStatusLine").textContent = open ? t("chatWindowOpen") : t("chatWindowClosed");
    $("#chatInput").disabled = !open;
    $("#chatForm button[type=submit]").disabled = !open;
    const owner = isOwner(cls);
    $("#chatLog").innerHTML = thread.messages.length
      ? thread.messages.map((m) => {
          const mine = (owner && m.from === "teacher") || (!owner && m.from === "student");
          return `<div class="chat-msg ${mine ? "chat-msg--me" : "chat-msg--them"}">${esc(m.text)}</div>`;
        }).join("")
      : `<p class="muted">${esc(t("noMessages"))}</p>`;
    $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
  }
  function submitChat(e) {
    e.preventDefault();
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const key = chatKey(cls.id, student.accountId);
    const thread = state.chats[key];
    if (!thread || !chatIsOpen(thread)) return;
    const text = $("#chatInput").value.trim();
    if (!text) return;
    const owner = isOwner(cls);
    thread.messages.push({ from: owner ? "teacher" : "student", text, at: new Date().toISOString() });
    save();
    $("#chatInput").value = "";
    renderChat();
  }

  /* ---------- Attendance record (whole school year) ---------- */
  function openAttendance() {
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    closeDialog("studentActionsDialog");
    const sel = $("#attMonthSelect");
    sel.innerHTML = schoolYearMonths().map((m, i) =>
      `<option value="${i}">${esc(new Date(m.year, m.month, 1).toLocaleDateString(localeFor(), { month: "long", year: "numeric" }))}</option>`).join("");
    const now = new Date();
    const months = schoolYearMonths();
    let idx = months.findIndex((m) => m.year === now.getFullYear() && m.month === now.getMonth());
    sel.value = String(idx < 0 ? 0 : idx);
    renderAttendanceMonth();
    openDialog("attendanceDialog");
  }
  function renderAttendanceMonth() {
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const months = schoolYearMonths();
    const m = months[Number($("#attMonthSelect").value) || 0];
    if (!m) return;
    const key = recordKey(cls.id, student.id);
    const record = state.records[key] || {};
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    let rows = "";
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(m.year, m.month, d);
      const dow = dateObj.getDay();
      if (dow === 0 || dow === 6) continue; // weekends skipped
      const iso = dateObj.toISOString().slice(0, 10);
      const day = record[iso] || { present: true, excused: false, reason: "" };
      rows += `
        <tr data-date="${iso}">
          <td>${esc(dateObj.toLocaleDateString(localeFor(), { weekday: "short", day: "numeric", month: "short" }))}</td>
          <td><input type="checkbox" class="att-present" ${day.present ? "checked" : ""}></td>
          <td><input type="checkbox" class="att-excused" ${day.excused ? "checked" : ""} ${day.present ? "disabled" : ""}></td>
          <td><input type="text" class="att-reason" value="${esc(day.reason || "")}" ${day.present || !day.excused ? "disabled" : ""} data-i18n-ph="excuseReasonPh" placeholder="${esc(t("excuseReasonPh"))}"></td>
        </tr>`;
    }
    $("#attBody").innerHTML = rows;
  }
  function handleAttendanceInput(e) {
    const row = e.target.closest("tr[data-date]");
    if (!row) return;
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const key = recordKey(cls.id, student.id);
    if (!state.records[key]) state.records[key] = {};
    const iso = row.dataset.date;
    const present = row.querySelector(".att-present").checked;
    const excusedBox = row.querySelector(".att-excused");
    const reasonBox = row.querySelector(".att-reason");
    excusedBox.disabled = present;
    if (present) excusedBox.checked = false;
    const excused = excusedBox.checked;
    reasonBox.disabled = present || !excused;
    if (!excused) reasonBox.value = "";
    state.records[key][iso] = { present, excused, reason: reasonBox.value.trim() };
    save();
  }

  /* ---------- End-of-year report ---------- */
  function openReport() {
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    closeDialog("studentActionsDialog");
    const key = recordKey(cls.id, student.id);
    $("#reportText").value = state.reports[key] || "";
    openDialog("reportDialog");
  }
  function submitReport(e) {
    e.preventDefault();
    const { cls, student } = studentById(activeCtx.studentId);
    if (!cls || !student) return;
    const key = recordKey(cls.id, student.id);
    state.reports[key] = $("#reportText").value;
    save();
    closeDialog("reportDialog");
    toast(t("reportSaved"), "ok");
  }
  function printReport() {
    const { student } = studentById(activeCtx.studentId);
    const text = $("#reportText").value;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(t("reportTitle"))}</title>
      <style>body{font-family:sans-serif;padding:40px;white-space:pre-wrap;line-height:1.6;}h1{font-size:1.3rem;}</style>
      </head><body><h1>${esc(t("reportTitle"))} — ${esc(student ? student.name + " " + student.surname : "")}</h1>${esc(text)}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  /* ---------- Inbox ---------- */
  function kindLabel(kind) {
    if (kind === "homework") return t("actionHomework");
    if (kind === "homeworkAnswer") return t("answerKind");
    if (kind === "news") return t("newsKind");
    if (kind === "message") return t("sendMessage");
    if (kind === "joinRequest") return t("joinRequestKind");
    if (kind === "farmReport") return t("farmReportKind");
    return t("inbox");
  }
  function openInbox() {
    const mine = state.messages
      .filter((m) => m.toId === state.currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const list = $("#inboxList");
    list.innerHTML = mine.length
      ? mine.map((m) => {
          const attachment = m.attachment
            ? `<div class="inbox-item__attachment">${
                m.attachmentType === "video" ? `<video src="${m.attachment}" controls></video>` : `<img src="${m.attachment}" alt="">`
              }</div>`
            : "";
          let actions = "";
          if (m.kind === "joinRequest") {
            actions = `<div class="inbox-item__actions">
                 <button type="button" class="btn btn--primary" data-accept-request="${esc(m.requestId)}">${esc(t("accept"))}</button>
                 <button type="button" class="btn" data-reject-request="${esc(m.requestId)}">${esc(t("reject"))}</button>
               </div>`;
          } else if (m.kind === "homework") {
            actions = m.answered
              ? `<p class="inbox-item__answer"><strong>${esc(t("yourAnswer"))}:</strong> ${esc(m.answerText || "")}</p>`
              : `<div class="inbox-item__actions">
                   <button type="button" class="btn btn--primary" data-answer-homework="${esc(m.id)}">${esc(t("replyAnswer"))}</button>
                 </div>`;
          }
          return `
        <div class="inbox-item">
          <div class="inbox-item__meta">
            <span class="inbox-item__kind">${esc(kindLabel(m.kind))}</span>
            <span>${esc(new Date(m.createdAt).toLocaleString())}</span>
          </div>
          <div>${esc(t("from"))}: ${esc(m.fromLabel)}${m.className ? " — " + esc(m.className) : ""}</div>
          <p style="margin:6px 0 0;">${esc(m.text)}</p>
          ${attachment}
          ${actions}
        </div>`;
        }).join("")
      : `<p class="muted">${esc(t("noMessages"))}</p>`;
    updateInboxBadge();
    openDialog("inboxDialog");
  }

  function acceptJoinRequest(requestId) {
    state.classes.forEach((cls) => {
      const req = (cls.joinRequests || []).find((r) => r.id === requestId);
      if (!req) return;
      cls.joinRequests = cls.joinRequests.filter((r) => r.id !== requestId);
      if (cls.students.length < MAX_STUDENTS && !cls.students.some((s) => s.accountId === req.accountId)) {
        cls.students.push({ id: uid(), accountId: req.accountId, name: req.name, surname: req.surname, age: req.age, level: req.level, photo: req.photo || null });
      }
      state.messages.push({
        id: uid(), toId: req.accountId, fromId: state.currentUserId, fromLabel: cls.teacher,
        kind: "info", classId: cls.id, className: cls.name,
        text: tf("joinAccepted", { name: cls.teacher, class: cls.name }), createdAt: new Date().toISOString()
      });
    });
    state.messages = state.messages.filter((m) => m.requestId !== requestId);
    save();
    openInbox();
    render();
  }
  function rejectJoinRequest(requestId) {
    state.classes.forEach((cls) => {
      const req = (cls.joinRequests || []).find((r) => r.id === requestId);
      if (!req) return;
      cls.joinRequests = cls.joinRequests.filter((r) => r.id !== requestId);
      state.messages.push({
        id: uid(), toId: req.accountId, fromId: state.currentUserId, fromLabel: cls.teacher,
        kind: "info", classId: cls.id, className: cls.name,
        text: tf("joinRejected", { name: cls.teacher, class: cls.name }), createdAt: new Date().toISOString()
      });
    });
    state.messages = state.messages.filter((m) => m.requestId !== requestId);
    save();
    openInbox();
  }

  /* ---------- News broadcast (Controller -> every student) ---------- */
  function submitNews(e) {
    e.preventDefault();
    const cls = currentClass();
    if (!cls) return;
    const text = $("#newsText").value.trim();
    if (!text) { toast(t("required"), "error"); return; }
    cls.students.forEach((s) => {
      state.messages.push({
        id: uid(), toId: s.accountId, fromId: state.currentUserId, fromLabel: cls.teacher,
        kind: "news", classId: cls.id, className: cls.name, text, createdAt: new Date().toISOString()
      });
    });
    save();
    closeDialog("newsDialog");
    toast(t("newsSent"), "ok");
  }

  /* ---------- Direct message (opened from any peer's profile) ---------- */
  function submitPeerMessage(e) {
    e.preventDefault();
    const peer = activeCtx.peer;
    const cls = state.classes.find((c) => c.id === (peer && peer.classId));
    if (!peer || !cls) return;
    const text = $("#peerMessageText").value.trim();
    if (!text) { toast(t("required"), "error"); return; }
    const file = $("#peerMessageFile").files && $("#peerMessageFile").files[0];
    const finish = (dataUrl, type) => {
      const me = currentUser();
      state.messages.push({
        id: uid(), toId: peer.accountId, fromId: state.currentUserId,
        fromLabel: me ? me.name + " " + me.surname : "",
        kind: "message", classId: cls.id, className: cls.name, text,
        attachment: dataUrl || null, attachmentType: type || null, createdAt: new Date().toISOString()
      });
      save();
      closeDialog("peerMessageDialog");
      closeDialog("peerDialog");
      toast(t("messageSent"), "ok");
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = () => finish(reader.result, file.type.startsWith("video") ? "video" : "image");
      reader.onerror = () => finish(null, null);
      reader.readAsDataURL(file);
    } else {
      finish(null, null);
    }
  }
  function startPeerChat() {
    const peer = activeCtx.peer;
    const cls = state.classes.find((c) => c.id === (peer && peer.classId));
    if (!peer || !cls || !peer.isTeacher) return;
    const mine = cls.students.find((s) => s.accountId === state.currentUserId);
    if (!mine) return;
    activeCtx.classId = cls.id;
    activeCtx.studentId = mine.id;
    openChat();
  }

  /* ---------- Collaboration / project mode (3-day pairing) ---------- */
  function startCollab() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    if (cls.collab) return;
    const now = Date.now();
    cls.collab = { startedAt: new Date(now).toISOString(), endsAt: new Date(now + COLLAB_WINDOW_MS).toISOString(), pairs: {} };
    save();
    toast(t("collabStarted"), "ok");
    renderDetail(cls);
  }
  function endCollab() {
    const cls = currentClass();
    if (!cls) return;
    cls.collab = null;
    save();
    toast(t("collabEnded"), "ok");
    renderDetail(cls);
  }


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
    $("#classForm").reset();
    openDialog("classDialog");
    setTimeout(() => $("#classNameInput").focus(), 30);
  }

  function createClass(e) {
    e.preventDefault();
    const name = $("#classNameInput").value.trim();
    const teacher = $("#controllerInput").value.trim();
    const secret = $("#classSecretInput").value.trim();
    if (!name || !teacher || !secret) { toast(t("required"), "error"); return; }
    state.classes.push({ id: uid(), name, teacher, secret, ownerId: state.currentUserId, schoolId: state.schoolId, students: [], joinRequests: [], collab: null });
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
    if (cls.students.length >= MAX_STUDENTS) { toast(t("classFull"), "error"); return; }
    if (hasPendingRequest(cls, u.id)) { toast(t("alreadyRequested"), "warn"); return; }

    if (!cls.ownerId) {
      // Legacy/demo classroom with no teacher account on record — join right away.
      cls.students.push({ id: uid(), accountId: u.id, name: u.name, surname: u.surname, age: u.age, level: u.level, photo: u.photo || null });
      save();
      closeDialog("joinDialog");
      state.currentClassId = cls.id;
      render();
      toast(t("joinedOk"), "ok");
      return;
    }

    const reqId = uid();
    if (!Array.isArray(cls.joinRequests)) cls.joinRequests = [];
    cls.joinRequests.push({ id: reqId, accountId: u.id, name: u.name, surname: u.surname, age: u.age, level: u.level, photo: u.photo || null, createdAt: new Date().toISOString() });
    state.messages.push({
      id: uid(), toId: cls.ownerId, fromId: u.id, fromLabel: u.name + " " + u.surname,
      kind: "joinRequest", classId: cls.id, className: cls.name, requestId: reqId,
      text: tf("joinRequestText", { name: u.name + " " + u.surname, class: cls.name }), createdAt: new Date().toISOString()
    });
    save();
    closeDialog("joinDialog");
    toast(t("joinRequestSent"), "ok");
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

    let acc = await ensureAccountLocally(idVal);
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

  /* ---------- Shared account directory (Supabase), so an ID typed on one
     device can be found even if the account was created on another ---------- */
  async function cloudUpsertAccount(u) {
    const client = window.supabaseClient;
    if (!client) return { error: new Error("Supabase client is not configured.") };
    try {
      const { error } = await client.from("accounts").upsert([{
        id: u.id, password: u.password, name: u.name, surname: u.surname,
        age: Number(u.age), level: u.level, photo: u.photo || null,
        plus: !!u.plus, last_edit: u.lastEdit || null
      }]);
      return { error };
    } catch (err) {
      return { error: err };
    }
  }
  async function cloudFindAccountById(id) {
    const client = window.supabaseClient;
    if (!client) return { data: null, error: new Error("Supabase client is not configured.") };
    try {
      const { data, error } = await client.from("accounts").select("*").ilike("id", id).maybeSingle();
      if (error || !data) return { data: null, error };
      const user = {
        id: data.id, password: data.password, name: data.name, surname: data.surname,
        age: data.age, level: data.level, photo: data.photo || null,
        plus: !!data.plus, lastEdit: data.last_edit || null
      };
      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
  // Pulls a remote account into the local cache (state.users) if we don't have it yet,
  // so every other part of the app can keep treating state.users as the source of truth.
  async function ensureAccountLocally(id) {
    let local = state.users.find((u) => u.id.toLowerCase() === id.toLowerCase());
    if (local) return local;
    const { data } = await cloudFindAccountById(id);
    if (data) {
      state.users.push(data);
      save();
      return data;
    }
    return null;
  }

  /* ---------- Events ---------- */
  function bind() {
    document.querySelectorAll("#langSelect, #langSelectAuth, #langSelectSchool").forEach((el) => {
      el.addEventListener("change", (e) => { state.lang = e.target.value; save(); applyLanguage(); });
    });

    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      b.addEventListener("click", () => { state.theme = b.dataset.themeChoice; save(); applyTheme(); });
    });

    $("#openSettings").addEventListener("click", () => openDialog("settingsDialog"));

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

    // Student card clicks: owner opens the action menu, a student opens a peer's profile
    $("#studentGrid").addEventListener("click", (e) => {
      const cls = currentClass();
      if (!cls) return;
      const ownCard = e.target.closest("[data-student]");
      if (ownCard && isOwner(cls)) {
        const student = cls.students.find((s) => s.id === ownCard.dataset.student);
        if (student) openStudentActions(cls, student);
        return;
      }
      const teacherCard = e.target.closest("[data-peer-teacher]");
      if (teacherCard) { openPeerProfile(teacherPerson(cls), { classId: cls.id, isTeacher: true }); return; }
      const peerCard = e.target.closest("[data-peer-student]");
      if (peerCard) {
        const student = cls.students.find((s) => s.id === peerCard.dataset.peerStudent);
        if (student) openPeerProfile(student, { classId: cls.id, studentId: student.id, isTeacher: false });
      }
    });

    // Project mode: drag a student's card onto another to pair them up
    $("#studentGrid").addEventListener("dragstart", (e) => {
      const card = e.target.closest("[data-student][draggable='true']");
      if (card) e.dataTransfer.setData("text/plain", card.dataset.student);
    });
    $("#studentGrid").addEventListener("dragover", (e) => {
      const card = e.target.closest("[data-student][draggable='true']");
      if (!card) return;
      e.preventDefault();
      card.classList.add("collab-dragover");
    });
    $("#studentGrid").addEventListener("dragleave", (e) => {
      const card = e.target.closest("[data-student]");
      if (card) card.classList.remove("collab-dragover");
    });
    $("#studentGrid").addEventListener("drop", (e) => {
      const card = e.target.closest("[data-student][draggable='true']");
      if (!card) return;
      e.preventDefault();
      card.classList.remove("collab-dragover");
      const fromId = e.dataTransfer.getData("text/plain");
      const toId = card.dataset.student;
      const cls = currentClass();
      if (!cls || !cls.collab || fromId === toId) return;
      cls.collab.pairs[fromId] = toId;
      cls.collab.pairs[toId] = fromId;
      save();
      renderDetail(cls);
    });

    $("#openCollab").addEventListener("click", startCollab);
    $("#collabBanner").addEventListener("click", (e) => { if (e.target.closest("#collabEndBtn")) endCollab(); });

    $("#openDivide").addEventListener("click", toggleDivide);
    $("#openClassSettings").addEventListener("click", openClassSettings);
    $("#openKickStudent").addEventListener("click", openKickStudent);
    $("#kickStudentForm").addEventListener("submit", submitKickStudent);
    $("#orgEditor").addEventListener("dragstart", handleOrgDragStart);
    $("#orgEditor").addEventListener("dragover", handleOrgDragOver);
    $("#orgEditor").addEventListener("dragleave", handleOrgDragLeave);
    $("#orgEditor").addEventListener("drop", handleOrgDrop);

    // Student action menu
    $("#actHomework").addEventListener("click", openHomework);
    $("#actChat").addEventListener("click", openChat);
    $("#actAttendance").addEventListener("click", openAttendance);
    $("#actReport").addEventListener("click", openReport);
    $("#homeworkForm").addEventListener("submit", submitHomework);
    $("#chatForm").addEventListener("submit", submitChat);
    $("#attMonthSelect").addEventListener("change", renderAttendanceMonth);
    $("#attBody").addEventListener("change", handleAttendanceInput);
    $("#reportForm").addEventListener("submit", submitReport);
    $("#printReportBtn").addEventListener("click", printReport);

    // Peer profile (classmates / teacher) reached from a student's own view
    $("#peerMessageBtn").addEventListener("click", () => {
      $("#peerMessageText").value = "";
      $("#peerMessageFile").value = "";
      openDialog("peerMessageDialog");
    });
    $("#peerMessageForm").addEventListener("submit", submitPeerMessage);
    $("#peerChatBtn").addEventListener("click", startPeerChat);

    // News broadcast
    $("#openNews").addEventListener("click", () => { $("#newsText").value = ""; openDialog("newsDialog"); });
    $("#newsForm").addEventListener("submit", submitNews);

    // Inbox
    $("#openInbox").addEventListener("click", openInbox);
    $("#inboxList").addEventListener("click", (e) => {
      const acceptBtn = e.target.closest("[data-accept-request]");
      const rejectBtn = e.target.closest("[data-reject-request]");
      const answerBtn = e.target.closest("[data-answer-homework]");
      if (acceptBtn) acceptJoinRequest(acceptBtn.dataset.acceptRequest);
      if (rejectBtn) rejectJoinRequest(rejectBtn.dataset.rejectRequest);
      if (answerBtn) openHomeworkAnswer(answerBtn.dataset.answerHomework);
    });
    $("#homeworkAnswerForm").addEventListener("submit", submitHomeworkAnswer);

    // Auth
    $("#authTabLogin").addEventListener("click", () => setAuthTab("login"));
    $("#authTabSignup").addEventListener("click", () => setAuthTab("signup"));
    $("#loginForm").addEventListener("submit", submitLogin);
    $("#signupForm").addEventListener("submit", submitSignup);
    $("#logoutBtn").addEventListener("click", () => { closeDialog("settingsDialog"); logout(); });
    $("#exportSchoolBtn").addEventListener("click", exportSchoolData);

    // Study Farm
    $("#openFarm").addEventListener("click", openFarm);
    $("#farmGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-animal]");
      if (btn) openFarmAnimal(btn.dataset.animal);
    });
    $("#farmMicBtn").addEventListener("click", toggleFarmSpeech);
    $("#farmSubmitBtn").addEventListener("click", submitFarmExplanation);
    $("#farmExplainDialog").addEventListener("close", stopFarmSpeech);
    $("#schoolGateForm").addEventListener("submit", submitSchoolGate);
    $("#bannedCloseBtn").addEventListener("click", closeBannedOverlay);

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
