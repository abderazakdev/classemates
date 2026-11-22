/* =====================================================================
   app-logic.js
   Translations, theme, accounts (local demo login), classes (free tier
   = 2 for teachers, join by ID + secret code, 1 class per free
   student), students added by existing account ID (never invented),
   profile with a 7-day edit lock, a live clock, a school-year
   calendar, Plus modal, and registerStudent() -> Firebase.
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
      accountLookupFailed: "Couldn't check that ID — check the internet connection and the Firebase setup, then try again.",
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
      farmReportKind: "Study Farm report",
      /* START A MATE: live camera session */
      liveTitle: "START A MATE",
      liveEnd: "End",
      liveLeave: "Leave",
      liveNoCloud: "Live video needs the cloud connection — check firebase-rtdb-config.js.",
      liveNoCamera: "This browser doesn't support camera access.",
      liveCameraDenied: "Couldn't access the camera/microphone.",
      liveNotesPh: "Write what you're teaching here — students see it live.",
      liveInboxText: "A live session just started. Open it from the banner or your classroom while it's live.",
      liveBannerText: "Live now",
      joinNow: "Join now",
      liveSessionKind: "Live session",
      liveMute: "Mute my mic", liveUnmute: "Unmute my mic", liveCamOff: "Turn camera off", liveCamOn: "Turn camera on",
      liveShareImage: "Share an image", liveRemoveImage: "Remove image",
      liveQuestionMode: "Question mode", liveQuestionEnd: "End question mode",
      liveStudents: "Students in the call", liveWaiting: "Waiting for students to join…",
      liveYou: "You", liveTeacher: "Teacher", liveConnecting: "Connecting…", liveConnected: "Connected", liveFailed: "Connection failed",
      liveMuteStudent: "Mute", liveUnmuteStudent: "Unmute", liveAskStudent: "Ask this student", liveAskStop: "Stop",
      liveMutedByTeacher: "Your microphone is off (set by the teacher).", liveYourTurn: "It's your turn — your microphone is on.",
      liveImageFailed: "Couldn't share that image.", liveEnded: "The live class has ended.",
      liveJoinInClass: "Live now — join the class",
      spaceChooseTitle: "Choose your space", spaceStudents: "Students", spaceTeachers: "Teachers", spaceAdmin: "Administration",
      spaceStudentsDesc: "Your class, games and lessons", spaceTeachersDesc: "Your classes and students", spaceAdminDesc: "Accounts, classes and fees",
      loginTo: "Log in to", backToSpaces: "Change space", wrongSpace: "This account doesn't belong to this space.",
      accountsByAdmin: "Accounts are created by your school's administration.",
      claimClass: "Add my class", claimIntro: "Enter the class name and code the administration gave you.", classClaimed: "Class added.",
      noClassStudent: "No class yet — the administration will add you to your class.", noClassTeacher: "No class yet — enter the name and code you received from the administration.",
      adminTabStudents: "Students", adminTabTeachers: "Teachers", adminTabPayments: "Payments", adminTabClasses: "Classes", adminTabReports: "Attendance reports",
      colStudentName: "Student name", colParentPhone: "Parent's phone", colLevel: "Level", colTeacherName: "Teacher name", colPhone: "Phone / contact", colSubject: "Subject",
      colClass: "Class", colAccountId: "Account ID", colCode: "Code", colActions: "Actions", colParentName: "Parent name", colMonthlyFee: "Monthly fee",
      colPaid: "Paid", colContacted: "Contacted", colDue: "Amount due",
      adminAddRow: "+ Add a row", adminCreateAccount: "Create account", adminSaveCredentials: "Save ID & code", adminDownloadAll: "Download all accounts (CSV)",
      adminDelete: "Delete", adminConfirmDeleteRow: "Delete this row (and its account, if any)?", adminNameRequired: "Enter a name first.",
      adminAccountCreated: "Account created.", adminSaveFailed: "Couldn't save — check the connection and the Firebase rules.", adminSaved: "Saved.",
      adminNoClass: "— no class —", adminMonth: "Month", adminDefaultFee: "Default monthly fee (new rows)", adminTotals: "Totals",
      adminTotalDue: "Due", adminTotalCollected: "Collected", adminClassName: "Class name", adminClassCode: "Class code", adminCreateClass: "Create class",
      adminClassExists: "A class with this name already exists.", adminClassCodeNote: "Give the class name and code to the teacher.",
      adminTeachers: "Teachers", adminStudentsCount: "Students", adminSaveClassCode: "Save name & code",
      adminConfirmDeleteClass: "Delete this class? Its students stay registered but lose the class.", adminNoReports: "No attendance reports received yet.",
      adminViewReport: "Open / print", adminReceived: "Received", adminFrom: "Teacher", adminEmpty: "Nothing here yet.",
      attReport: "Attendance register", attSendAdmin: "Send to administration", attPrint: "Print / save as PDF", attSent: "Attendance register sent to the administration.",
      attPresent: "Present", attAbsent: "Absent", attExcused: "Excused", attAbsenceDates: "Absence dates", attNoStudents: "No students in this class.",
      attPdfHint: "To get a PDF, choose \"Save as PDF\" in the print window."
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
      accountLookupFailed: "Impossible de vérifier cet identifiant — vérifiez la connexion internet et la configuration Firebase, puis réessayez.",
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
      farmReportKind: "Rapport de la ferme d'étude",
      /* START A MATE : session vidéo en direct */
      liveTitle: "START A MATE",
      liveEnd: "Terminer",
      liveLeave: "Quitter",
      liveNoCloud: "La vidéo en direct a besoin de la connexion au cloud — vérifiez firebase-rtdb-config.js.",
      liveNoCamera: "Ce navigateur ne prend pas en charge l'accès à la caméra.",
      liveCameraDenied: "Impossible d'accéder à la caméra/au microphone.",
      liveNotesPh: "Écrivez ici ce que vous enseignez — les élèves le voient en direct.",
      liveInboxText: "Une session en direct vient de commencer. Ouvrez-la depuis la bannière ou votre classe tant qu'elle est active.",
      liveBannerText: "En direct maintenant",
      joinNow: "Rejoindre",
      liveSessionKind: "Session en direct",
      liveMute: "Couper mon micro", liveUnmute: "Réactiver mon micro", liveCamOff: "Couper la caméra", liveCamOn: "Activer la caméra",
      liveShareImage: "Partager une image", liveRemoveImage: "Retirer l'image",
      liveQuestionMode: "Mode questions", liveQuestionEnd: "Fin du mode questions",
      liveStudents: "Élèves dans l'appel", liveWaiting: "En attente des élèves…",
      liveYou: "Vous", liveTeacher: "Enseignant", liveConnecting: "Connexion…", liveConnected: "Connecté", liveFailed: "Connexion échouée",
      liveMuteStudent: "Couper", liveUnmuteStudent: "Réactiver", liveAskStudent: "Interroger cet élève", liveAskStop: "Arrêter",
      liveMutedByTeacher: "Votre micro est coupé (par l'enseignant).", liveYourTurn: "C'est votre tour — votre micro est actif.",
      liveImageFailed: "Impossible de partager cette image.", liveEnded: "Le cours en direct est terminé.",
      liveJoinInClass: "En direct — rejoindre le cours",
      spaceChooseTitle: "Choisissez votre espace", spaceStudents: "Élèves", spaceTeachers: "Enseignants", spaceAdmin: "Administration",
      spaceStudentsDesc: "Votre classe, jeux et leçons", spaceTeachersDesc: "Vos classes et élèves", spaceAdminDesc: "Comptes, classes et frais",
      loginTo: "Connexion —", backToSpaces: "Changer d'espace", wrongSpace: "Ce compte n'appartient pas à cet espace.",
      accountsByAdmin: "Les comptes sont créés par l'administration de votre école.",
      claimClass: "Ajouter ma classe", claimIntro: "Saisissez le nom et le code de la classe donnés par l'administration.", classClaimed: "Classe ajoutée.",
      noClassStudent: "Pas encore de classe — l'administration vous ajoutera à votre classe.", noClassTeacher: "Pas encore de classe — saisissez le nom et le code reçus de l'administration.",
      adminTabStudents: "Élèves", adminTabTeachers: "Enseignants", adminTabPayments: "Paiements", adminTabClasses: "Classes", adminTabReports: "Registres de présence",
      colStudentName: "Nom de l'élève", colParentPhone: "Téléphone du parent", colLevel: "Niveau", colTeacherName: "Nom de l'enseignant", colPhone: "Téléphone / contact", colSubject: "Matière",
      colClass: "Classe", colAccountId: "Identifiant", colCode: "Code", colActions: "Actions", colParentName: "Nom du parent", colMonthlyFee: "Frais mensuels",
      colPaid: "Payé", colContacted: "Contacté", colDue: "Reste à payer",
      adminAddRow: "+ Ajouter une ligne", adminCreateAccount: "Créer le compte", adminSaveCredentials: "Enregistrer identifiant et code", adminDownloadAll: "Télécharger tous les comptes (CSV)",
      adminDelete: "Supprimer", adminConfirmDeleteRow: "Supprimer cette ligne (et son compte, s'il existe) ?", adminNameRequired: "Saisissez d'abord un nom.",
      adminAccountCreated: "Compte créé.", adminSaveFailed: "Enregistrement impossible — vérifiez la connexion et les règles Firebase.", adminSaved: "Enregistré.",
      adminNoClass: "— aucune classe —", adminMonth: "Mois", adminDefaultFee: "Frais mensuels par défaut (nouvelles lignes)", adminTotals: "Totaux",
      adminTotalDue: "Reste", adminTotalCollected: "Encaissé", adminClassName: "Nom de la classe", adminClassCode: "Code de la classe", adminCreateClass: "Créer la classe",
      adminClassExists: "Une classe porte déjà ce nom.", adminClassCodeNote: "Donnez le nom et le code de la classe à l'enseignant.",
      adminTeachers: "Enseignants", adminStudentsCount: "Élèves", adminSaveClassCode: "Enregistrer nom et code",
      adminConfirmDeleteClass: "Supprimer cette classe ? Ses élèves restent inscrits mais perdent leur classe.", adminNoReports: "Aucun registre de présence reçu.",
      adminViewReport: "Ouvrir / imprimer", adminReceived: "Reçu le", adminFrom: "Enseignant", adminEmpty: "Rien ici pour l'instant.",
      attReport: "Registre de présence", attSendAdmin: "Envoyer à l'administration", attPrint: "Imprimer / enregistrer en PDF", attSent: "Registre envoyé à l'administration.",
      attPresent: "Présent", attAbsent: "Absent", attExcused: "Excusé", attAbsenceDates: "Dates d'absence", attNoStudents: "Aucun élève dans cette classe.",
      attPdfHint: "Pour obtenir un PDF, choisissez \"Enregistrer au format PDF\" dans la fenêtre d'impression."
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
      accountLookupFailed: "تعذّر التحقق من هذا المعرف — تحقق من الاتصال بالإنترنت وإعداد Firebase، ثم أعد المحاولة.",
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
      farmReportKind: "تقرير مزرعة الدراسة",
      /* START A MATE: بث مباشر بالكاميرا */
      liveTitle: "START A MATE",
      liveEnd: "إنهاء",
      liveLeave: "مغادرة",
      liveNoCloud: "البث المباشر يحتاج الاتصال بالسحابة — تحقق من firebase-rtdb-config.js.",
      liveNoCamera: "هذا المتصفح لا يدعم الوصول إلى الكاميرا.",
      liveCameraDenied: "تعذّر الوصول إلى الكاميرا/الميكروفون.",
      liveNotesPh: "اكتب هنا ما تشرحه — يراه التلاميذ مباشرة.",
      liveInboxText: "بدأت حصة مباشرة للتو. افتحها من الشريط العلوي أو من القسم طالما هي نشطة.",
      liveBannerText: "بث مباشر الآن",
      joinNow: "انضم الآن",
      liveSessionKind: "حصة مباشرة",
      liveMute: "كتم الميكروفون", liveUnmute: "تشغيل الميكروفون", liveCamOff: "إطفاء الكاميرا", liveCamOn: "تشغيل الكاميرا",
      liveShareImage: "رفع صورة", liveRemoveImage: "إزالة الصورة",
      liveQuestionMode: "وضع أسئلة الفهم", liveQuestionEnd: "إنهاء وضع الأسئلة",
      liveStudents: "التلاميذ في المكالمة", liveWaiting: "في انتظار انضمام التلاميذ…",
      liveYou: "أنت", liveTeacher: "الأستاذ", liveConnecting: "جارٍ الاتصال…", liveConnected: "متصل", liveFailed: "فشل الاتصال",
      liveMuteStudent: "كتم", liveUnmuteStudent: "إلغاء الكتم", liveAskStudent: "اسأل هذا التلميذ", liveAskStop: "إيقاف",
      liveMutedByTeacher: "الميكروفون مكتوم (بقرار الأستاذ).", liveYourTurn: "دورك الآن — الميكروفون يعمل.",
      liveImageFailed: "تعذّر رفع هذه الصورة.", liveEnded: "انتهت الحصة المباشرة.",
      liveJoinInClass: "بث مباشر الآن — ادخل الحصة",
      spaceChooseTitle: "اختر فضاءك", spaceStudents: "فضاء التلاميذ", spaceTeachers: "فضاء الأساتذة", spaceAdmin: "فضاء الإدارة",
      spaceStudentsDesc: "قسمك وألعابك ودروسك", spaceTeachersDesc: "أقسامك وتلاميذك", spaceAdminDesc: "الحسابات والأقسام والأداءات",
      loginTo: "تسجيل الدخول إلى", backToSpaces: "تغيير الفضاء", wrongSpace: "هذا الحساب لا ينتمي إلى هذا الفضاء.",
      accountsByAdmin: "الحسابات تُنشئها إدارة مدرستك.",
      claimClass: "إضافة قسمي", claimIntro: "أدخل اسم القسم والرمز اللذين أعطتك إياهما الإدارة.", classClaimed: "تمت إضافة القسم.",
      noClassStudent: "لا يوجد قسم بعد — ستضيفك الإدارة إلى قسمك.", noClassTeacher: "لا يوجد قسم بعد — أدخل الاسم والرمز اللذين استلمتهما من الإدارة.",
      adminTabStudents: "التلاميذ", adminTabTeachers: "الأساتذة", adminTabPayments: "الأداءات", adminTabClasses: "الأقسام", adminTabReports: "سجلات الحضور",
      colStudentName: "اسم التلميذ", colParentPhone: "رقم ولي الأمر", colLevel: "المستوى الدراسي", colTeacherName: "اسم الأستاذ", colPhone: "الهاتف / التواصل", colSubject: "المادة",
      colClass: "القسم", colAccountId: "معرف الحساب", colCode: "الرمز", colActions: "إجراءات", colParentName: "اسم ولي الأمر", colMonthlyFee: "الواجب الشهري",
      colPaid: "دفع", colContacted: "تم التواصل", colDue: "المبلغ المتبقي",
      adminAddRow: "+ إضافة سطر", adminCreateAccount: "إنشاء الحساب", adminSaveCredentials: "حفظ المعرف والرمز", adminDownloadAll: "تنزيل كل الحسابات (CSV)",
      adminDelete: "حذف", adminConfirmDeleteRow: "حذف هذا السطر (وحسابه إن وُجد)؟", adminNameRequired: "اكتب الاسم أولاً.",
      adminAccountCreated: "تم إنشاء الحساب.", adminSaveFailed: "تعذّر الحفظ — تحقق من الاتصال وقواعد Firebase.", adminSaved: "تم الحفظ.",
      adminNoClass: "— بلا قسم —", adminMonth: "الشهر", adminDefaultFee: "الواجب الشهري الافتراضي (للأسطر الجديدة)", adminTotals: "المجموع",
      adminTotalDue: "المتبقي", adminTotalCollected: "المحصَّل", adminClassName: "اسم القسم", adminClassCode: "رمز القسم", adminCreateClass: "إنشاء قسم",
      adminClassExists: "يوجد قسم بهذا الاسم من قبل.", adminClassCodeNote: "أعطِ اسم القسم ورمزه للأستاذ.",
      adminTeachers: "الأساتذة", adminStudentsCount: "التلاميذ", adminSaveClassCode: "حفظ الاسم والرمز",
      adminConfirmDeleteClass: "حذف هذا القسم؟ يبقى تلاميذه مسجلين لكنهم يفقدون القسم.", adminNoReports: "لم يصل أي سجل حضور بعد.",
      adminViewReport: "فتح / طباعة", adminReceived: "وصل في", adminFrom: "الأستاذ", adminEmpty: "لا شيء هنا بعد.",
      attReport: "سجل الحضور", attSendAdmin: "إرسال إلى الإدارة", attPrint: "طباعة / حفظ PDF", attSent: "تم إرسال سجل الحضور إلى الإدارة.",
      attPresent: "حاضر", attAbsent: "غائب", attExcused: "بعذر", attAbsenceDates: "تواريخ الغياب", attNoStudents: "لا يوجد تلاميذ في هذا القسم.",
      attPdfHint: "للحصول على ملف PDF اختر \"حفظ بتنسيق PDF\" في نافذة الطباعة."
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
    { id: "al_murabitin", name: "مدرسة المرابطين", code: "Test10154546ibrahim",
      admin: { id: "Abderazaktest_00", code: "111111test", name: "الإدارة" } }
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

  // ---------------------------------------------------------------------
  // "START A MATE" live video: ICE servers for the WebRTC connection
  // between the teacher's camera and each student. The public STUN
  // server below is free and gets many connections working on open
  // networks, but it cannot relay traffic, so it will fail for some
  // students on stricter networks (quite a few school networks included).
  // For reliable connections, add a TURN server: sign up for a free tier
  // with a provider such as Twilio Network Traversal, Xirsys, Metered.ca
  // or Cloudflare Calls, then uncomment the line below and paste in its
  // urls/username/credential.
  // ---------------------------------------------------------------------
  const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" }
    // , { urls: "turn:YOUR_TURN_HOST:3478", username: "YOUR_TURN_USERNAME", credential: "YOUR_TURN_CREDENTIAL" }
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
    if (state.dataVersion !== 3) {
      state.classes = []; state.users = []; state.messages = []; state.chats = {}; state.records = {}; state.reports = {};
      state.currentUserId = null; state.dataVersion = 3;
    }
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
  const isOwner = (cls) => {
    const me = (state.currentUserId || "").toLowerCase();
    return !!me && ((cls.ownerId || "").toLowerCase() === me || (cls.teacherIds || []).some((x) => String(x).toLowerCase() === me));
  };
  const idFormatOk = (id) => ID_RE.test(id);
  const cleanId = (s) => String(s || "").replace(/[\s\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "");
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
    document.querySelectorAll("#langSelect, #langSelectAuth, #langSelectSchool, #langSelectSpace").forEach((el) => { if (el) el.value = state.lang; });
    updateThemeButtons();
    renderSpaceCards();
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

  /* ---------- "START A MATE": live class (teacher <-> students) ----------
     Video and sound go directly between devices (WebRTC); Firebase only
     carries the small handshake messages and the shared state:
       live_sessions/{classId}                 active, className, notes,
                                               focus (the one student allowed to
                                               talk in question mode), muted/{id}
       live_sessions/{classId}/participants    who is in the call (name)
       live_sessions/{classId}/signals         offer / answer / ICE / leave, each
                                               removed as soon as it is read
       live_media/{classId}                    the image the teacher is showing
     Teacher: sees every student as a tile (video, name, mute button).
     Student: sees the teacher (and the shared image beside the camera) plus
     their own small camera, with mic / camera buttons. The teacher can mute
     one student, or switch on "question mode" so only the chosen student
     can speak. It is a star: one connection per student, which suits a
     class of up to roughly 6-8 on an ordinary connection.

     TURN (read this if two devices on different networks cannot connect):
     the free Google STUN server below only works when both devices can
     reach each other directly. Phones on mobile data and many school
     networks cannot, and then a TURN relay is required. Make a free
     account at https://www.metered.ca (Open Relay, 20 GB/month free), open
     its dashboard, and put your app name and API key here — that is all. */
  const METERED_TURN = { appName: "", apiKey: "" };

  const livePeers = {};            // host: studentId -> peer record | viewer: "host" -> peer record
  const liveTiles = {};            // host only: studentId -> tile
  const liveListeners = [];        // { ref, event, cb } for the call that is open
  const liveNoticeUnsubs = {};     // classId -> { ref, cb }  (the "is it live" listeners)
  const liveActiveByClass = {};    // classId -> true while that class is live
  let liveSessionActive = null;    // classId being hosted / attended on this device
  let liveRole = null;             // "host" | "viewer"
  let liveLocalStream = null;
  let liveJoinSid = null;          // viewer: id of this join attempt, so stale handshake messages are ignored
  let liveSessionData = { focus: null, muted: {} };
  let liveQuestionMode = false;
  let liveMicOff = false;
  let liveCamOff = false;
  let liveIceCache = null;
  let liveNotesTimer = null;

  const liveRef = (path) => (window.rtdb ? sref(path) : null);
  const liveSessionRef = (id) => liveRef("live_sessions/" + id);
  const liveSignalsRef = (id) => liveRef("live_sessions/" + id + "/signals");
  const liveParticipantsRef = (id) => liveRef("live_sessions/" + id + "/participants");
  const liveMediaRef = (id) => liveRef("live_media/" + id);
  function liveListen(ref, event, cb) { ref.on(event, cb); liveListeners.push({ ref, event, cb }); }
  function stopLiveListeners() {
    liveListeners.splice(0).forEach((l) => { try { l.ref.off(l.event, l.cb); } catch (err) { /* already gone */ } });
  }
  function sendSignal(classId, to, from, type, payload) {
    const ref = liveSignalsRef(classId);
    if (!ref) return;
    ref.push({ to, from, type, payload: payload || null, createdAt: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  }

  async function getIceServers() {
    if (liveIceCache) return liveIceCache;
    let list = ICE_SERVERS.slice();
    if (METERED_TURN.appName && METERED_TURN.apiKey) {
      try {
        const res = await fetch("https://" + METERED_TURN.appName + ".metered.live/api/v1/turn/credentials?apiKey=" + encodeURIComponent(METERED_TURN.apiKey));
        if (res.ok) {
          const extra = await res.json();
          if (Array.isArray(extra) && extra.length) list = list.concat(extra);
        }
      } catch (err) { console.warn("[Classe mates] Could not load the TURN servers:", err); }
    }
    liveIceCache = list;
    return list;
  }

  /* One RTCPeerConnection plus the bookkeeping that makes the handshake safe:
     a candidate that arrives before the remote description is queued, not lost. */
  function newPeerRec(iceServers) {
    return { pc: new RTCPeerConnection({ iceServers }), remoteSet: false, pendingIce: [], sid: null, tracksAdded: false };
  }
  async function setRemote(rec, desc) {
    await rec.pc.setRemoteDescription(new RTCSessionDescription(desc));
    rec.remoteSet = true;
    const queued = rec.pendingIce.splice(0);
    for (const c of queued) { try { await rec.pc.addIceCandidate(new RTCIceCandidate(c)); } catch (err) { /* stale candidate */ } }
  }
  function addRemoteIce(rec, cand) {
    if (!cand) return;
    if (rec.remoteSet) rec.pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
    else rec.pendingIce.push(cand);
  }
  function closePeer(id) {
    const rec = livePeers[id];
    if (!rec) return;
    try { rec.pc.onicecandidate = null; rec.pc.ontrack = null; rec.pc.onconnectionstatechange = null; rec.pc.close(); } catch (err) { /* already closed */ }
    delete livePeers[id];
  }
  async function getLocalMedia() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
    try { return await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); }
    catch (err1) {
      try { return await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (err2) { return null; }
    }
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

  /* ----- what is allowed to be heard ----- */
  const liveStudentMuted = (id) => !!(liveSessionData.muted && liveSessionData.muted[id]);
  const liveTeacherHears = (id) => !liveStudentMuted(id) && (!liveSessionData.focus || liveSessionData.focus === id);
  function liveViewerForcedMute() {
    const me = state.currentUserId;
    return !!((liveSessionData.muted && liveSessionData.muted[me]) || (liveSessionData.focus && liveSessionData.focus !== me));
  }
  function applyLocalTracks() {
    if (liveLocalStream) {
      const forced = liveRole === "viewer" && liveViewerForcedMute();
      liveLocalStream.getAudioTracks().forEach((tr) => { tr.enabled = !liveMicOff && !forced; });
      liveLocalStream.getVideoTracks().forEach((tr) => { tr.enabled = !liveCamOff; });
    }
    updateLiveButtons();
  }
  function updateLiveButtons() {
    const hasAudio = !!(liveLocalStream && liveLocalStream.getAudioTracks().length);
    const hasVideo = !!(liveLocalStream && liveLocalStream.getVideoTracks().length);
    const micText = liveMicOff ? t("liveUnmute") : t("liveMute");
    const camText = liveCamOff ? t("liveCamOn") : t("liveCamOff");
    [["#liveMicBtn", "#liveCamBtn"], ["#liveSelfMicBtn", "#liveSelfCamBtn"]].forEach(([m, c]) => {
      const mb = $(m), cb = $(c);
      if (mb) { mb.textContent = micText; mb.disabled = !hasAudio; }
      if (cb) { cb.textContent = camText; cb.disabled = !hasVideo; }
    });
    const forced = liveRole === "viewer" && liveViewerForcedMute();
    const selfMic = $("#liveSelfMicBtn");
    if (selfMic && forced) selfMic.disabled = true;
    const note = $("#liveMutedNote");
    if (note) {
      const iAmFocus = liveRole === "viewer" && liveSessionData.focus === state.currentUserId;
      note.hidden = !(forced || iAmFocus);
      note.textContent = iAmFocus ? t("liveYourTurn") : t("liveMutedByTeacher");
    }
    const qb = $("#liveQuestionBtn");
    if (qb) qb.textContent = liveQuestionMode ? t("liveQuestionEnd") : t("liveQuestionMode");
  }

  /* ----- teacher: student tiles ----- */
  function updateStudentsEmpty() {
    const n = Object.keys(liveTiles).length;
    const empty = $("#liveStudentsEmpty");
    if (empty) empty.hidden = n > 0;
    const title = $("#liveStudentsTitle");
    if (title) title.textContent = t("liveStudents") + " (" + n + ")";
  }
  function setTileStatus(tile, key) { if (tile) { tile.status.textContent = t(key); tile.status.dataset.key = key; } }
  function ensureTile(id, name) {
    if (liveTiles[id]) { liveTiles[id].name.textContent = name; return liveTiles[id]; }
    const el = document.createElement("div");
    el.className = "live-tile";
    el.dataset.student = id;
    el.innerHTML =
      '<video autoplay playsinline></video>' +
      '<div class="live-tile__bar"><span class="live-tile__name"></span><span class="live-tile__status"></span></div>' +
      '<div class="live-tile__actions">' +
      '<button type="button" class="btn live-tile__mute" data-action="mute"></button>' +
      '<button type="button" class="btn live-tile__ask" data-action="ask" hidden></button>' +
      '</div>';
    const tile = {
      el, video: el.querySelector("video"), name: el.querySelector(".live-tile__name"),
      status: el.querySelector(".live-tile__status"), muteBtn: el.querySelector(".live-tile__mute"), askBtn: el.querySelector(".live-tile__ask")
    };
    tile.name.textContent = name;
    $("#liveStudentsGrid").appendChild(el);
    liveTiles[id] = tile;
    updateStudentsEmpty();
    refreshHostTiles();
    return tile;
  }
  function removeTile(id) {
    const tile = liveTiles[id];
    if (!tile) return;
    tile.el.remove();
    delete liveTiles[id];
    updateStudentsEmpty();
  }
  function refreshHostTiles() {
    Object.keys(liveTiles).forEach((id) => {
      const tile = liveTiles[id];
      tile.video.muted = !liveTeacherHears(id);
      tile.muteBtn.textContent = liveStudentMuted(id) ? t("liveUnmuteStudent") : t("liveMuteStudent");
      tile.askBtn.hidden = !liveQuestionMode;
      tile.askBtn.textContent = liveSessionData.focus === id ? t("liveAskStop") : t("liveAskStudent");
      tile.el.classList.toggle("live-tile--focus", liveSessionData.focus === id);
      tile.el.classList.toggle("live-tile--muted", liveStudentMuted(id) || (!!liveSessionData.focus && liveSessionData.focus !== id));
    });
    updateLiveButtons();
  }

  function showLiveImage(media) {
    const has = !!(media && media.data);
    const pane = $("#liveImagePane");
    if (pane) pane.hidden = !has;
    const img = $("#liveImageEl");
    if (img) { if (has) img.src = media.data; else img.removeAttribute("src"); }
    const stage = $("#liveStage");
    if (stage) stage.classList.toggle("has-image", has);
    const rm = $("#liveImageRemoveBtn");
    if (rm) rm.hidden = !has;
  }

  function renderLiveShell() {
    const root = $("#liveRoot");
    root.dataset.role = liveRole || "";
    $("#liveEndBtn").textContent = liveRole === "host" ? t("liveEnd") : t("liveLeave");
    const main = $("#liveMainVideo");
    main.srcObject = liveRole === "host" ? liveLocalStream : null;
    main.muted = liveRole === "host";
    $("#liveMainLabel").textContent = liveRole === "host" ? t("liveYou") : t("liveTeacher");
    $("#liveSelfVideo").srcObject = liveRole === "viewer" ? liveLocalStream : null;
    $("#liveNotesBox").readOnly = liveRole !== "host";
    $("#liveNotesBox").value = "";
    $("#liveStudentsGrid").innerHTML = "";
    $("#liveStatus").textContent = liveRole === "viewer" ? t("liveConnecting") : "";
    showLiveImage(null);
    updateStudentsEmpty();
    updateLiveButtons();
  }

  /* ================= teacher ================= */
  async function startLiveSession() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    if (liveSessionActive) { openDialog("liveDialog"); return; }
    if (!window.rtdb) { toast(t("liveNoCloud"), "error"); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast(t("liveNoCamera"), "error"); return; }

    const stream = await getLocalMedia();
    if (!stream || !stream.getVideoTracks().length) {
      if (stream) stream.getTracks().forEach((tr) => tr.stop());
      toast(t("liveCameraDenied"), "error");
      return;
    }
    liveLocalStream = stream;
    liveRole = "host";
    liveSessionActive = cls.id;
    liveSessionData = { focus: null, muted: {} };
    liveQuestionMode = false; liveMicOff = false; liveCamOff = false;
    renderLiveShell();
    openDialog("liveDialog");

    try {
      await Promise.all([liveSignalsRef(cls.id).remove(), liveParticipantsRef(cls.id).remove(), liveMediaRef(cls.id).remove()]);
      const sref = liveSessionRef(cls.id);
      await sref.set({ active: true, className: cls.name, notes: "", updatedAt: firebase.database.ServerValue.TIMESTAMP });
      // if this tab is closed or loses its connection, the class must not stay "live" for the students
      sref.onDisconnect().update({ active: false });
    } catch (err) {
      console.warn("[Classe mates] Could not start the live session on Firebase:", err);
      toast(t("liveNoCloud"), "error");
      endLiveSession(true);
      return;
    }
    notifyClassLiveStarted(cls);

    const signals = liveSignalsRef(cls.id).orderByChild("to").equalTo("host");
    liveListen(signals, "child_added", (snap) => {
      const data = snap.val();
      snap.ref.remove().catch(() => {});
      if (!data) return;
      if (data.type === "join") hostHandleJoin(data);
      else if (data.type === "answer") hostHandleAnswer(data);
      else if (data.type === "ice") hostHandleIce(data);
      else if (data.type === "leave") hostHandleLeave(data);
    });
    liveListen(liveSessionRef(cls.id), "value", (snap) => {
      const d = snap.val();
      if (!d) return;
      liveSessionData = { focus: d.focus || null, muted: d.muted || {} };
      refreshHostTiles();
    });
    liveListen(liveParticipantsRef(cls.id), "value", (snap) => {
      const here = snap.val() || {};
      Object.keys(liveTiles).forEach((id) => { if (!here[id]) { closePeer(id); removeTile(id); } });
    });
    liveListen(liveMediaRef(cls.id), "value", (snap) => showLiveImage(snap.val()));
  }

  async function hostHandleJoin(data) {
    const id = data.from;
    const classId = liveSessionActive;
    if (liveRole !== "host" || !classId || !id) return;
    const payload = data.payload || {};
    closePeer(id);
    const tile = ensureTile(id, payload.name || id);
    setTileStatus(tile, "liveConnecting");
    const rec = newPeerRec(await getIceServers());
    if (liveSessionActive !== classId) { try { rec.pc.close(); } catch (err) { /* closed */ } return; }
    rec.sid = payload.sid || null;
    livePeers[id] = rec;
    const pc = rec.pc;
    liveLocalStream.getTracks().forEach((tr) => pc.addTrack(tr, liveLocalStream));
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(classId, id, "host", "ice", { sid: rec.sid, candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate });
    };
    pc.ontrack = (e) => {
      tile.video.srcObject = (e.streams && e.streams[0]) || (typeof MediaStream !== "undefined" ? new MediaStream([e.track]) : null);
      refreshHostTiles();
    };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "connected") setTileStatus(tile, "liveConnected");
      else if (st === "failed") setTileStatus(tile, "liveFailed");
      else if (st === "disconnected") setTileStatus(tile, "liveConnecting");
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal(classId, id, "host", "offer", { sid: rec.sid, sdp: { type: offer.type, sdp: offer.sdp } });
  }
  async function hostHandleAnswer(data) {
    const rec = livePeers[data.from];
    const p = data.payload || {};
    if (!rec || (rec.sid && p.sid !== rec.sid)) return;
    await setRemote(rec, p.sdp);
  }
  function hostHandleIce(data) {
    const rec = livePeers[data.from];
    const p = data.payload || {};
    if (!rec || (rec.sid && p.sid !== rec.sid)) return;
    addRemoteIce(rec, p.candidate);
  }
  function hostHandleLeave(data) {
    const rec = livePeers[data.from];
    const p = data.payload || {};
    if (rec && rec.sid && p.sid && p.sid !== rec.sid) return;
    closePeer(data.from);
    removeTile(data.from);
  }

  function hostBroadcastNotes() {
    if (liveRole !== "host" || !liveSessionActive) return;
    clearTimeout(liveNotesTimer);
    const classId = liveSessionActive;
    const text = $("#liveNotesBox").value;
    liveNotesTimer = setTimeout(() => {
      const ref = liveSessionRef(classId);
      if (ref && liveSessionActive === classId) ref.update({ notes: text }).catch(() => {});
    }, 350);
  }
  function hostToggleStudentMute(id) {
    const classId = liveSessionActive;
    if (liveRole !== "host" || !classId) return;
    const ref = liveRef("live_sessions/" + classId + "/muted/" + id);
    if (liveStudentMuted(id)) ref.remove().catch(() => {}); else ref.set(true).catch(() => {});
  }
  function hostAskStudent(id) {
    const classId = liveSessionActive;
    if (liveRole !== "host" || !classId) return;
    liveSessionRef(classId).update({ focus: liveSessionData.focus === id ? null : id }).catch(() => {});
  }
  function hostToggleQuestionMode() {
    const classId = liveSessionActive;
    if (liveRole !== "host" || !classId) return;
    liveQuestionMode = !liveQuestionMode;
    if (!liveQuestionMode) liveSessionRef(classId).update({ focus: null }).catch(() => {});
    refreshHostTiles();
  }
  async function hostShareImage(file) {
    const classId = liveSessionActive;
    if (liveRole !== "host" || !classId || !file) return;
    const dataUrl = await readAndResizeImage(file, 900);
    if (!dataUrl || dataUrl.length > 900000) { toast(t("liveImageFailed"), "error"); return; }
    liveMediaRef(classId).set({ data: dataUrl, at: firebase.database.ServerValue.TIMESTAMP }).catch(() => toast(t("liveImageFailed"), "error"));
  }
  function hostRemoveImage() {
    const classId = liveSessionActive;
    if (liveRole === "host" && classId) liveMediaRef(classId).remove().catch(() => {});
  }

  /* ================= student ================= */
  async function joinLiveSession(classId) {
    const cls = state.classes.find((c) => c.id === classId);
    if (!cls || !window.rtdb) { toast(t("liveNoCloud"), "error"); return; }
    if (liveSessionActive) { openDialog("liveDialog"); return; }
    const me = state.currentUserId;
    const u = currentUser();
    liveRole = "viewer";
    liveSessionActive = classId;
    liveJoinSid = uid();
    liveSessionData = { focus: null, muted: {} };
    liveMicOff = false; liveCamOff = false;
    liveLocalStream = null;
    renderLiveShell();
    openDialog("liveDialog");
    hideLiveBanner(classId);

    const stream = await getLocalMedia();           // the student's own camera / mic (optional)
    if (liveSessionActive !== classId) { if (stream) stream.getTracks().forEach((tr) => tr.stop()); return; }
    liveLocalStream = stream;
    $("#liveSelfVideo").srcObject = stream;
    const iceServers = await getIceServers();
    if (liveSessionActive !== classId) { if (stream) stream.getTracks().forEach((tr) => tr.stop()); return; }

    const rec = newPeerRec(iceServers);
    rec.sid = liveJoinSid;
    livePeers.host = rec;
    const pc = rec.pc;
    pc.ontrack = (e) => {
      $("#liveMainVideo").srcObject = (e.streams && e.streams[0]) || (typeof MediaStream !== "undefined" ? new MediaStream([e.track]) : null);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(classId, "host", me, "ice", { sid: liveJoinSid, candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate });
    };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      $("#liveStatus").textContent = st === "connected" ? t("liveConnected") : st === "failed" ? t("liveFailed") : t("liveConnecting");
    };

    liveListen(liveSignalsRef(classId).orderByChild("to").equalTo(me), "child_added", async (snap) => {
      const data = snap.val();
      snap.ref.remove().catch(() => {});
      if (!data) return;
      const p = data.payload || {};
      if (p.sid !== liveJoinSid) return;               // a leftover from an earlier attempt
      if (data.type === "offer") {
        await setRemote(rec, p.sdp);
        if (liveLocalStream && !rec.tracksAdded) {
          liveLocalStream.getTracks().forEach((tr) => pc.addTrack(tr, liveLocalStream));
          rec.tracksAdded = true;
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(classId, "host", me, "answer", { sid: liveJoinSid, sdp: { type: answer.type, sdp: answer.sdp } });
        applyLocalTracks();
      } else if (data.type === "ice") {
        addRemoteIce(rec, p.candidate);
      }
    });
    liveListen(liveSessionRef(classId), "value", (snap) => {
      const d = snap.val();
      if (!d) return;
      if (d.active === false) { toast(t("liveEnded"), "info"); endLiveSession(true); return; }
      liveSessionData = { focus: d.focus || null, muted: d.muted || {} };
      if (typeof d.notes === "string") $("#liveNotesBox").value = d.notes;
      applyLocalTracks();
    });
    liveListen(liveMediaRef(classId), "value", (snap) => showLiveImage(snap.val()));

    const me_ref = liveParticipantsRef(classId).child(me);
    await me_ref.set({ name: u ? u.name + " " + u.surname : me, at: firebase.database.ServerValue.TIMESTAMP });
    me_ref.onDisconnect().remove();
    sendSignal(classId, "host", me, "join", { sid: liveJoinSid, name: u ? u.name + " " + u.surname : me });
    applyLocalTracks();
  }

  /* ================= both ================= */
  function endLiveSession(fromRemote) {
    const classId = liveSessionActive;
    if (!classId) return;
    const me = state.currentUserId;
    if (liveRole === "host" && !fromRemote) {
      const sref = liveSessionRef(classId);
      if (sref) { sref.update({ active: false, focus: null }).catch(() => {}); try { sref.onDisconnect().cancel(); } catch (err) { /* none */ } }
      [liveParticipantsRef(classId), liveSignalsRef(classId), liveMediaRef(classId)].forEach((r) => { if (r) r.remove().catch(() => {}); });
    }
    if (liveRole === "viewer") {
      if (!fromRemote) sendSignal(classId, "host", me, "leave", { sid: liveJoinSid });
      const mine = liveParticipantsRef(classId);
      if (mine) { const r = mine.child(me); r.remove().catch(() => {}); try { r.onDisconnect().cancel(); } catch (err) { /* none */ } }
    }
    clearTimeout(liveNotesTimer);
    stopLiveListeners();
    Object.keys(livePeers).forEach(closePeer);
    Object.keys(liveTiles).forEach(removeTile);
    if (liveLocalStream) { liveLocalStream.getTracks().forEach((tr) => tr.stop()); liveLocalStream = null; }
    liveSessionActive = null; liveRole = null; liveJoinSid = null;
    liveQuestionMode = false; liveIceCache = null;
    liveSessionData = { focus: null, muted: {} };
    const main = $("#liveMainVideo"); if (main) main.srcObject = null;
    const self = $("#liveSelfVideo"); if (self) self.srcObject = null;
    $("#liveRoot").dataset.role = "";
    closeDialog("liveDialog");
    render();
  }

  function bindLiveControls() {
    $("#liveEndBtn").addEventListener("click", () => endLiveSession(false));
    $("#liveDialog").addEventListener("close", () => { if (liveSessionActive) endLiveSession(false); });
    $("#liveNotesBox").addEventListener("input", hostBroadcastNotes);
    const toggleMic = () => { liveMicOff = !liveMicOff; applyLocalTracks(); };
    const toggleCam = () => { liveCamOff = !liveCamOff; applyLocalTracks(); };
    $("#liveMicBtn").addEventListener("click", toggleMic);
    $("#liveCamBtn").addEventListener("click", toggleCam);
    $("#liveSelfMicBtn").addEventListener("click", toggleMic);
    $("#liveSelfCamBtn").addEventListener("click", toggleCam);
    $("#liveImageBtn").addEventListener("click", () => $("#liveImageInput").click());
    $("#liveImageInput").addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; hostShareImage(f); });
    $("#liveImageRemoveBtn").addEventListener("click", hostRemoveImage);
    $("#liveQuestionBtn").addEventListener("click", hostToggleQuestionMode);
    $("#liveStudentsGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      const tileEl = e.target.closest("[data-student]");
      if (!btn || !tileEl) return;
      if (btn.dataset.action === "mute") hostToggleStudentMute(tileEl.dataset.student);
      else if (btn.dataset.action === "ask") hostAskStudent(tileEl.dataset.student);
    });
    $("#joinLiveInClass").addEventListener("click", () => { const c = currentClass(); if (c) joinLiveSession(c.id); });
  }

  /* A student sees a banner the moment a teacher goes live anywhere in the
     app, and a "join" button inside the classroom itself. One listener per
     classroom this account belongs to; safe to call again when the list of
     classrooms changes. */
  function subscribeToMyLiveNotices() {
    if (!window.rtdb || !state.currentUserId) return;
    state.classes.forEach((c) => {
      if (!c.students.some((s) => s.accountId === state.currentUserId)) return;
      if (liveNoticeUnsubs[c.id]) return;
      const ref = liveSessionRef(c.id);
      if (!ref) return;
      const cb = (snap) => {
        const data = snap.val();
        const active = !!(data && data.active);
        liveActiveByClass[c.id] = active;
        if (active && liveSessionActive !== c.id) showLiveBanner(c.id, data.className || c.name);
        else hideLiveBanner(c.id);
        if (state.currentClassId === c.id) render();
      };
      ref.on("value", cb);
      liveNoticeUnsubs[c.id] = { ref, cb };
    });
  }
  function stopLiveNoticeListeners() {
    Object.keys(liveNoticeUnsubs).forEach((id) => {
      try { liveNoticeUnsubs[id].ref.off("value", liveNoticeUnsubs[id].cb); } catch (err) { /* gone */ }
      delete liveNoticeUnsubs[id];
      delete liveActiveByClass[id];
    });
  }
  function showLiveBanner(classId, className) {
    const el = $("#liveNoticeBanner");
    el.hidden = false;
    el.dataset.classId = classId;
    $("#liveNoticeText").textContent = t("liveBannerText") + " — " + className;
  }
  function hideLiveBanner(classId) {
    const el = $("#liveNoticeBanner");
    if (!el.hidden && el.dataset.classId === classId) el.hidden = true;
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

  /* ---------- Spaces: students / teachers / administration ----------
     After a device passes the school gate it chooses one of three spaces and
     logs in there. Nobody can create an account by themselves: the
     administration creates every student and teacher account, and the
     administration's own account is defined for each school in SCHOOLS
     (top of this file). Everything a school stores lives under
     schools/{schoolId}/... in the Realtime Database, so schools never see
     each other's data.

     DECORATION: every space card can show a picture. Put the image in
     assets/spaces/ and write its path in "imageSrc" below (see
     ASSETS_GUIDE.md). Without a picture the card shows its colour only.

     TABLES: to add, remove or rename a column of the administration's
     student / teacher tables, edit the two lists below. "key" is the name
     the value is stored under, "label" is the title shown (or "labelKey" to
     use a translated one). The account / class / code / buttons columns are
     always added at the end. */
  const SPACES = [
    { id: "student", titleKey: "spaceStudents", descKey: "spaceStudentsDesc", emoji: "🎒", color: "#2F6FD6", imageSrc: "assets/spaces/students.jpg" },
    { id: "teacher", titleKey: "spaceTeachers", descKey: "spaceTeachersDesc", emoji: "📚", color: "#1F8A4C", imageSrc: "assets/spaces/teachers.jpg" },
    { id: "admin",   titleKey: "spaceAdmin",    descKey: "spaceAdminDesc",    emoji: "🏫", color: "#7A4FD6", imageSrc: "assets/spaces/administration.jpg" }
  ];
  const ADMIN_STUDENT_COLUMNS = [
    { key: "name",        labelKey: "colStudentName", type: "text" },
    { key: "parentPhone", labelKey: "colParentPhone", type: "tel" },
    { key: "level",       labelKey: "colLevel",       type: "text" }
  ];
  const ADMIN_TEACHER_COLUMNS = [
    { key: "name",    labelKey: "colTeacherName", type: "text" },
    { key: "phone",   labelKey: "colPhone",       type: "tel" },
    { key: "subject", labelKey: "colSubject",     type: "text" }
  ];

  let pendingSpace = null;           // the space chosen on this device, until someone logs in
  const roleOf = () => { const u = currentUser(); return (u && u.role) || null; };
  const isAdmin = () => roleOf() === "admin";
  const isTeacher = () => roleOf() === "teacher";
  const isStudent = () => roleOf() === "student";

  function sref(path) {
    if (!window.rtdb || !state.schoolId) return null;
    return window.rtdb.ref("schools/" + state.schoolId + "/" + path);
  }
  const schoolInfo = () => SCHOOLS.find((s) => s.id === state.schoolId) || null;

  /* ----- choosing a space, logging in ----- */
  function renderSpaceCards() {
    const grid = $("#spaceGrid");
    if (!grid) return;
    grid.innerHTML = SPACES.map((s) => `
      <button type="button" class="space-card" data-space="${esc(s.id)}"
        style="--space-color:${esc(s.color)};background-image:url('${esc(s.imageSrc)}'),linear-gradient(160deg,${esc(s.color)},#0A0F1A)">
        <span class="space-card__emoji" aria-hidden="true">${s.emoji}</span>
        <span class="space-card__title">${esc(t(s.titleKey))}</span>
        <span class="space-card__desc">${esc(t(s.descKey))}</span>
      </button>`).join("");
  }
  function chooseSpace(id) {
    if (!SPACES.some((s) => s.id === id)) return;
    pendingSpace = id;
    $("#loginForm").reset();
    renderAuthGate();
    setTimeout(() => $("#loginId").focus(), 30);
  }
  function backToSpaces() { pendingSpace = null; renderAuthGate(); }

  function renderAuthGate() {
    // A device must pass the partner-school gate before it ever sees the spaces.
    if (state.schoolId && !isSchoolActive(state.schoolId)) state.schoolId = null;
    const schoolOk = !!state.schoolId;
    $("#schoolGateOverlay").hidden = schoolOk;
    if (!schoolOk) {
      populateSchoolSelect();
      $("#spaceOverlay").hidden = true; $("#authOverlay").hidden = true; $("#appShell").hidden = true;
      return;
    }
    // An already-logged-in account may belong to a school that was removed since.
    if (state.currentUserId) {
      const u0 = currentUser();
      if (checkAccountBanned(u0)) { state.currentUserId = null; save(); showBannedOverlay(); }
    }
    const loggedIn = isLoggedIn();
    $("#spaceOverlay").hidden = loggedIn || !!pendingSpace;
    $("#authOverlay").hidden = loggedIn || !pendingSpace;
    $("#appShell").hidden = !loggedIn;
    if (!loggedIn && pendingSpace) {
      const sp = SPACES.find((s) => s.id === pendingSpace);
      $("#loginSpaceTitle").textContent = t("loginTo") + " " + t(sp.titleKey);
    }
    renderSpaceCards();
    const u = currentUser();
    const chip = $("#accountChip");
    if (chip) chip.textContent = u ? (t("loggedInAs") + ": " + (u.name + " " + (u.surname || "")).trim()) : "";
    applyRoleChrome();
    updateInboxBadge();
    if (loggedIn) {
      subscribeToMyClasses();
      subscribeToMyLiveNotices();
      if (isAdmin()) startAdminListeners();
    }
  }

  function applyRoleChrome() {
    const farm = $("#openFarm"); if (farm) farm.hidden = !isStudent();
    const inbox = $("#openInbox"); if (inbox) inbox.hidden = !(isStudent() || isTeacher());
    const sch = $("#exportSchoolBtn"); if (sch) sch.closest(".setting-row").hidden = !isAdmin();
  }

  async function submitLogin(e) {
    e.preventDefault();
    if (!pendingSpace) return;
    const id = cleanId($("#loginId").value);
    const pw = $("#loginPassword").value;
    if (!id || !pw) { toast(t("required"), "error"); return; }

    let user = null;
    if (pendingSpace === "admin") {
      const school = schoolInfo();
      const adm = school && school.admin;
      if (adm && adm.id.toLowerCase() === id.toLowerCase() && adm.code === pw) {
        user = { id: adm.id, password: adm.code, name: adm.name || "Administration", surname: "", role: "admin", schoolId: state.schoolId, level: "", age: "", photo: null, plus: false, lastEdit: null };
      }
    } else {
      const local = state.users.find((u) => u.id.toLowerCase() === id.toLowerCase()) || null;
      const found = await cloudFindAccountById(id);      // the cloud copy wins: the administration may have changed it
      if (found.data) user = found.data;
      else if (found.error) user = local;                  // offline: fall back to what this device already knows
      if (user && user.role !== pendingSpace) { toast(t("wrongSpace"), "error"); return; }
    }
    if (!user || user.password !== pw) { toast(t("invalidLogin"), "error"); return; }
    if (checkAccountBanned(user)) { $("#loginForm").reset(); showBannedOverlay(); return; }

    const idx = state.users.findIndex((u) => u.id.toLowerCase() === user.id.toLowerCase());
    if (idx === -1) state.users.push(user); else state.users[idx] = user;
    state.currentUserId = user.id;
    save();
    $("#loginForm").reset();
    renderAuthGate();
    render();
  }

  function logout() {
    state.currentUserId = null;
    save();
    stopMyClassListeners();
    stopLiveNoticeListeners();
    stopAdminListeners();
    pendingSpace = null;
    renderAuthGate();
  }

  /* ---------- Administration space ---------- */
  const adminCache = { students: {}, teachers: {}, payments: {}, classes: {}, reports: {}, settings: {} };
  const adminListeners = [];
  let adminTab = "students";
  let adminMonth = null;
  let adminRenderTimer = null;
  let adminRenderPending = false;
  const monthKeyOf = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");

  function startAdminListeners() {
    if (adminListeners.length || !window.rtdb) return;
    const nodes = [["students", "registry/students"], ["teachers", "registry/teachers"], ["payments", "registry/payments"],
                   ["settings", "registry/settings"], ["classes", "classes"], ["reports", "attendance_reports"]];
    nodes.forEach(([name, path]) => {
      const ref = sref(path);
      const cb = (snap) => { adminCache[name] = snap.val() || {}; scheduleAdminRender(); };
      ref.on("value", cb);
      adminListeners.push({ ref, cb });
    });
  }
  function stopAdminListeners() {
    adminListeners.splice(0).forEach((l) => { try { l.ref.off("value", l.cb); } catch (err) { /* gone */ } });
    ["students", "teachers", "payments", "classes", "reports", "settings"].forEach((k) => { adminCache[k] = {}; });
  }
  function scheduleAdminRender() {
    clearTimeout(adminRenderTimer);
    adminRenderTimer = setTimeout(renderAdmin, 60);
  }
  const rowsOf = (obj) => Object.keys(obj || {}).map((id) => ({ id, ...obj[id] })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  function renderAdmin() {
    if (!isAdmin()) return;
    const body = $("#adminBody");
    if (!body) return;
    const active = document.activeElement;
    if (active && body.contains(active) && /^(INPUT|SELECT|TEXTAREA)$/.test(active.tagName)) { adminRenderPending = true; return; }   // never steal focus while typing
    adminRenderPending = false;
    document.querySelectorAll("#adminTabs [data-admin-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.adminTab === adminTab ? "true" : "false"));
    if (adminTab === "students") body.innerHTML = adminPeopleHtml("students");
    else if (adminTab === "teachers") body.innerHTML = adminPeopleHtml("teachers");
    else if (adminTab === "payments") body.innerHTML = adminPaymentsHtml();
    else if (adminTab === "classes") body.innerHTML = adminClassesHtml();
    else body.innerHTML = adminReportsHtml();
  }

  function adminPeopleHtml(kind) {
    const cols = kind === "students" ? ADMIN_STUDENT_COLUMNS : ADMIN_TEACHER_COLUMNS;
    const rows = rowsOf(adminCache[kind]);
    const classes = rowsOf(adminCache.classes);
    const head = cols.map((c) => `<th>${esc(c.label || t(c.labelKey))}</th>`).join("") +
      (kind === "students" ? `<th>${esc(t("colClass"))}</th>` : "") +
      `<th>${esc(t("colAccountId"))}</th><th>${esc(t("colCode"))}</th><th>${esc(t("colActions"))}</th>`;
    const body = rows.map((r) => {
      const done = !!r.accountCreatedAt;
      const cells = cols.map((c) => `<td><input type="${esc(c.type || "text")}" data-cell data-table="${kind}" data-row="${esc(r.id)}" data-key="${esc(c.key)}" value="${esc(r[c.key] || "")}"></td>`).join("");
      const clsCell = kind === "students"
        ? `<td><select data-cell data-table="students" data-row="${esc(r.id)}" data-key="classId"><option value="">${esc(t("adminNoClass"))}</option>${classes.map((c) => `<option value="${esc(c.id)}"${r.classId === c.id ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></td>`
        : "";
      const idCell = `<td><input type="text" data-cell data-table="${kind}" data-row="${esc(r.id)}" data-key="accountId" value="${esc(r.accountId || "")}" autocapitalize="off" autocorrect="off" spellcheck="false"${done ? " disabled" : ""}></td>`;
      const codeCell = `<td><input type="text" data-cell data-table="${kind}" data-row="${esc(r.id)}" data-key="accountCode" value="${esc(r.accountCode || "")}" autocapitalize="off" autocorrect="off" spellcheck="false"${done ? " disabled" : ""}></td>`;
      const actions = `<td class="admin-actions">` +
        (done
          ? `<button type="button" class="btn btn--primary" data-admin-action="save-credentials" data-table="${kind}" data-row="${esc(r.id)}">${esc(t("adminSaveCredentials"))}</button>`
          : `<button type="button" class="btn btn--primary" data-admin-action="create-account" data-table="${kind}" data-row="${esc(r.id)}">${esc(t("adminCreateAccount"))}</button>`) +
        `<button type="button" class="btn" data-admin-action="delete-row" data-table="${kind}" data-row="${esc(r.id)}">${esc(t("adminDelete"))}</button></td>`;
      return `<tr>${cells}${clsCell}${idCell}${codeCell}${actions}</tr>`;
    }).join("");
    return `<div class="admin-bar">
        <button type="button" class="btn btn--primary" data-admin-action="add-row" data-table="${kind}">${esc(t("adminAddRow"))}</button>
        <button type="button" class="btn" data-admin-action="download-all" data-table="${kind}">${esc(t("adminDownloadAll"))}</button>
      </div>
      <div class="table-wrap"><table class="admin-table"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${cols.length + (kind === "students" ? 1 : 0) + 3}" class="muted">${esc(t("adminEmpty"))}</td></tr>`}</tbody></table></div>`;
  }

  function adminMonthsList() {
    return schoolYearMonths().map((m) => ({ key: m.year + "-" + String(m.month + 1).padStart(2, "0"), label: new Date(m.year, m.month, 1).toLocaleDateString(localeFor(), { month: "long", year: "numeric" }) }));
  }
  function adminPaymentsHtml() {
    const months = adminMonthsList();
    if (!adminMonth || !months.some((m) => m.key === adminMonth)) {
      const cur = monthKeyOf(new Date());
      adminMonth = months.some((m) => m.key === cur) ? cur : months[0].key;
    }
    const rows = rowsOf(adminCache.payments);
    let due = 0, collected = 0;
    const body = rows.map((r) => {
      const m = (r.months && r.months[adminMonth]) || {};
      const fee = Number(r.fee) || 0;
      const owed = m.paid ? 0 : fee;
      due += owed; if (m.paid) collected += fee;
      return `<tr>
        <td><input type="text" data-cell data-table="payments" data-row="${esc(r.id)}" data-key="parentName" value="${esc(r.parentName || "")}"></td>
        <td><input type="number" min="0" step="any" data-cell data-table="payments" data-row="${esc(r.id)}" data-key="fee" value="${esc(r.fee === undefined ? "" : r.fee)}"></td>
        <td><input type="checkbox" data-pay-row="${esc(r.id)}" data-pay-key="paid"${m.paid ? " checked" : ""}></td>
        <td><input type="checkbox" data-pay-row="${esc(r.id)}" data-pay-key="contacted"${m.contacted ? " checked" : ""}></td>
        <td>${esc(owed)}</td>
        <td class="admin-actions"><button type="button" class="btn" data-admin-action="delete-row" data-table="payments" data-row="${esc(r.id)}">${esc(t("adminDelete"))}</button></td>
      </tr>`;
    }).join("");
    const df = adminCache.settings && adminCache.settings.defaultFee;
    return `<div class="admin-bar">
        <label>${esc(t("adminMonth"))} <select id="adminMonthSelect">${months.map((m) => `<option value="${esc(m.key)}"${m.key === adminMonth ? " selected" : ""}>${esc(m.label)}</option>`).join("")}</select></label>
        <label>${esc(t("adminDefaultFee"))} <input type="number" min="0" step="any" id="adminDefaultFee" value="${esc(df === undefined ? "" : df)}"></label>
        <button type="button" class="btn btn--primary" data-admin-action="add-row" data-table="payments">${esc(t("adminAddRow"))}</button>
      </div>
      <div class="table-wrap"><table class="admin-table"><thead><tr>
        <th>${esc(t("colParentName"))}</th><th>${esc(t("colMonthlyFee"))}</th><th>${esc(t("colPaid"))}</th><th>${esc(t("colContacted"))}</th><th>${esc(t("colDue"))}</th><th>${esc(t("colActions"))}</th>
      </tr></thead><tbody>${body || `<tr><td colspan="6" class="muted">${esc(t("adminEmpty"))}</td></tr>`}</tbody>
      <tfoot><tr><td colspan="2"><strong>${esc(t("adminTotals"))}</strong></td><td colspan="2">${esc(t("adminTotalCollected"))}: ${esc(collected)}</td><td colspan="2">${esc(t("adminTotalDue"))}: ${esc(due)}</td></tr></tfoot></table></div>`;
  }

  function adminClassesHtml() {
    const classes = rowsOf(adminCache.classes);
    const body = classes.map((c) => {
      const teachers = Object.keys(c.teacherIds || {}).map((k) => c.teacherIds[k]).join("، ") || "—";
      const students = Object.keys(c.students || {}).length;
      return `<tr><td>${esc(c.name)}</td><td><code>${esc(c.secret)}</code></td><td>${esc(teachers)}</td><td>${students}</td>
        <td class="admin-actions"><button type="button" class="btn" data-admin-action="save-class-code" data-row="${esc(c.id)}">${esc(t("adminSaveClassCode"))}</button>
        <button type="button" class="btn" data-admin-action="delete-class" data-row="${esc(c.id)}">${esc(t("adminDelete"))}</button></td></tr>`;
    }).join("");
    return `<form class="admin-bar" data-admin-form="class" novalidate>
        <input type="text" id="adminClassName" placeholder="${esc(t("adminClassName"))}" autocomplete="off">
        <input type="text" id="adminClassCode" placeholder="${esc(t("adminClassCode"))}" autocomplete="off" autocapitalize="off">
        <button type="submit" class="btn btn--primary">${esc(t("adminCreateClass"))}</button>
      </form>
      <p class="muted">${esc(t("adminClassCodeNote"))}</p>
      <div class="table-wrap"><table class="admin-table"><thead><tr><th>${esc(t("adminClassName"))}</th><th>${esc(t("adminClassCode"))}</th><th>${esc(t("adminTeachers"))}</th><th>${esc(t("adminStudentsCount"))}</th><th>${esc(t("colActions"))}</th></tr></thead>
      <tbody>${body || `<tr><td colspan="5" class="muted">${esc(t("adminEmpty"))}</td></tr>`}</tbody></table></div>`;
  }

  function adminReportsHtml() {
    const reports = rowsOf(adminCache.reports).reverse();
    const body = reports.map((r) => `<tr><td>${esc(new Date(r.createdAt || 0).toLocaleString())}</td><td>${esc(r.className)}</td><td>${esc(r.teacher)}</td>
      <td class="admin-actions"><button type="button" class="btn btn--primary" data-admin-action="open-report" data-row="${esc(r.id)}">${esc(t("adminViewReport"))}</button>
      <button type="button" class="btn" data-admin-action="delete-report" data-row="${esc(r.id)}">${esc(t("adminDelete"))}</button></td></tr>`).join("");
    return `<div class="table-wrap"><table class="admin-table"><thead><tr><th>${esc(t("adminReceived"))}</th><th>${esc(t("adminClassName"))}</th><th>${esc(t("adminFrom"))}</th><th>${esc(t("colActions"))}</th></tr></thead>
      <tbody>${body || `<tr><td colspan="4" class="muted">${esc(t("adminNoReports"))}</td></tr>`}</tbody></table></div>`;
  }

  /* ----- file helpers ----- */
  function downloadFile(name, text, mime) {
    const blob = new Blob(["\uFEFF" + text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  const siteUrl = () => (location.origin + location.pathname).replace(/index\.html$/, "");
  function credentialsText(kind, row) {
    const school = schoolInfo();
    return [school ? school.name : "", (kind === "students" ? t("spaceStudents") : t("spaceTeachers")),
      t("colStudentName") + ": " + (row.name || ""), t("colAccountId") + ": " + row.accountId, t("colCode") + ": " + row.accountCode, siteUrl()].join("\r\n");
  }
  const csvCell = (v) => '"' + String(v === undefined || v === null ? "" : v).replace(/"/g, '""') + '"';

  /* ----- actions ----- */
  const genId = (prefix) => prefix + "_" + Math.floor(1000 + Math.random() * 9000);
  function genCode() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789"; let s = "";
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }
  const rosterSid = (accId) => "s_" + String(accId).toLowerCase();

  async function adminRosterAdd(classId, acc) {
    const sid = rosterSid(acc.id);
    await sref("classes/" + classId + "/students/" + sid).set({ id: sid, accountId: acc.id, name: acc.name, surname: acc.surname || "", age: "", level: acc.level || "", photo: null });
    await sref("account_classes/" + acc.id.toLowerCase() + "/" + classId).set(true);
  }
  async function adminRosterRemove(classId, accId) {
    await sref("classes/" + classId + "/students/" + rosterSid(accId)).remove();
    await sref("account_classes/" + accId.toLowerCase() + "/" + classId).remove();
  }

  async function adminCreateAccount(kind, rowId) {
    const row = adminCache[kind][rowId];
    if (!row || row.accountCreatedAt) return;
    const name = String(row.name || "").trim();
    if (!name) { toast(t("adminNameRequired"), "error"); return; }
    let id = cleanId(row.accountId || "");
    let code = String(row.accountCode || "").trim();
    if (!id) id = genId(kind === "students" ? "stu" : "tch");
    if (!code) code = genCode();
    if (!idFormatOk(id)) { toast(t("idInvalid"), "error"); return; }
    const school = schoolInfo();
    if (school && school.admin && school.admin.id.toLowerCase() === id.toLowerCase()) { toast(t("accountExists"), "error"); return; }
    const exists = await cloudFindAccountById(id);
    if (exists.error) { toast(t("accountLookupFailed"), "error"); return; }
    if (exists.data) { toast(t("accountExists"), "error"); return; }
    const role = kind === "students" ? "student" : "teacher";
    const acc = { id, password: code, name, surname: String(row.surname || "").trim(), level: row.level || "", phone: row.parentPhone || row.phone || "",
                  role, schoolId: state.schoolId, classId: role === "student" ? (row.classId || null) : null, age: "", photo: null, plus: false, lastEdit: null };
    const res = await cloudUpsertAccount(acc);
    if (res.error) { console.warn("[Classe mates] Could not create the account:", res.error); toast(t("adminSaveFailed"), "error"); return; }
    await sref("registry/" + kind + "/" + rowId).update({ accountId: id, accountCode: code, accountCreatedAt: Date.now() });
    if (role === "student" && acc.classId) await adminRosterAdd(acc.classId, acc);
    toast(t("adminAccountCreated"), "ok");
  }

  async function adminCellChanged(kind, rowId, key, value) {
    const row = (adminCache[kind] || {})[rowId];
    if (!row) return;
    const v = typeof value === "string" ? value.trim() : value;
    if (key === "classId" && kind === "students") { await adminAssignClass(rowId, v || null); return; }
    if (key === "fee") { await sref("registry/" + kind + "/" + rowId + "/fee").set(v === "" ? null : Number(v)); return; }
    await sref("registry/" + kind + "/" + rowId + "/" + key).set(v === "" ? null : v);
    if (row.accountCreatedAt && row.accountId && (key === "name" || key === "surname" || key === "level")) {      // keep the account and the class list in step
      await sref("accounts/" + row.accountId.toLowerCase() + "/" + key).set(v);
      if (kind === "students" && row.classId) await sref("classes/" + row.classId + "/students/" + rosterSid(row.accountId) + "/" + key).set(v);
    }
  }
  async function adminAssignClass(rowId, newClassId) {
    const row = adminCache.students[rowId];
    if (!row) return;
    const old = row.classId || null;
    await sref("registry/students/" + rowId + "/classId").set(newClassId);
    if (row.accountCreatedAt && row.accountId) {
      if (old && old !== newClassId) await adminRosterRemove(old, row.accountId);
      if (newClassId) await adminRosterAdd(newClassId, { id: row.accountId, name: row.name || "", surname: row.surname || "", level: row.level || "" });
      await sref("accounts/" + row.accountId.toLowerCase() + "/classId").set(newClassId);
    }
  }

  async function adminDeleteRow(kind, rowId) {
    const row = (adminCache[kind] || {})[rowId];
    if (!row) return;
    if (!window.confirm(t("adminConfirmDeleteRow"))) return;
    if (row.accountCreatedAt && row.accountId) {
      const acc = row.accountId.toLowerCase();
      if (kind === "students" && row.classId) await adminRosterRemove(row.classId, row.accountId);
      if (kind === "teachers") {
        for (const c of rowsOf(adminCache.classes)) {
          if (c.teacherIds && c.teacherIds[acc]) {
            await sref("classes/" + c.id + "/teacherIds/" + acc).remove();
            await sref("account_classes/" + acc + "/" + c.id).remove();
            if ((c.ownerId || "").toLowerCase() === acc) await sref("classes/" + c.id).update({ ownerId: null, teacher: null });
          }
        }
      }
      await sref("accounts/" + acc).remove();
    }
    await sref("registry/" + kind + "/" + rowId).remove();
  }

  async function adminCreateClass(name, code) {
    name = String(name || "").trim(); code = String(code || "").trim();
    if (!name || !code) { toast(t("required"), "error"); return; }
    const taken = await sref("class_lookup/" + classLookupKey(name)).once("value");
    if (taken.exists()) { toast(t("adminClassExists"), "error"); return; }
    const id = uid();
    await sref("classes/" + id).set({ id, name, secret: code, schoolId: state.schoolId, createdBy: state.currentUserId, createdAt: firebase.database.ServerValue.TIMESTAMP });
    await sref("class_lookup/" + classLookupKey(name)).set(id);
    toast(t("adminSaved"), "ok");
  }
  async function adminDeleteClass(classId) {
    const c = adminCache.classes[classId];
    if (!c) return;
    if (!window.confirm(t("adminConfirmDeleteClass"))) return;
    for (const sid of Object.keys(c.students || {})) {
      const accId = (c.students[sid] || {}).accountId;
      if (accId) { await sref("account_classes/" + accId.toLowerCase() + "/" + classId).remove(); await sref("accounts/" + accId.toLowerCase() + "/classId").set(null); }
    }
    for (const tid of Object.keys(c.teacherIds || {})) await sref("account_classes/" + tid + "/" + classId).remove();
    for (const r of rowsOf(adminCache.students)) if (r.classId === classId) await sref("registry/students/" + r.id + "/classId").set(null);
    await sref("class_lookup/" + classLookupKey(c.name)).remove();
    await sref("live_sessions/" + classId).remove();
    await sref("live_media/" + classId).remove();
    await sref("classes/" + classId).remove();
  }

  function openAdminReport(reportId) {
    const r = adminCache.reports[reportId];
    if (!r) return;
    $("#attendanceTitle").textContent = t("attReport") + " — " + (r.className || "");
    $("#attendanceBody").innerHTML = attendanceReportHtml(reportFromCloud(r));
    attendanceDraft = null;
    $("#attendanceSendBtn").hidden = true;
    openDialog("attendanceDialog");
  }

  function bindAdminControls() {
    const body = $("#adminBody");
    $("#adminTabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-admin-tab]");
      if (!b) return;
      adminTab = b.dataset.adminTab;
      renderAdmin();
    });
    body.addEventListener("focusout", () => { setTimeout(() => { if (adminRenderPending) renderAdmin(); }, 0); });
    body.addEventListener("change", (e) => {
      const el = e.target;
      if (el.matches("[data-cell]")) { adminCellChanged(el.dataset.table, el.dataset.row, el.dataset.key, el.value).catch((err) => { console.warn(err); toast(t("adminSaveFailed"), "error"); }); }
      else if (el.matches("[data-pay-row]")) {
        const ref = sref("registry/payments/" + el.dataset.payRow + "/months/" + adminMonth + "/" + el.dataset.payKey);
        (el.checked ? ref.set(true) : ref.remove()).catch(() => toast(t("adminSaveFailed"), "error"));
      } else if (el.id === "adminMonthSelect") { adminMonth = el.value; renderAdmin(); }
      else if (el.id === "adminDefaultFee") { sref("registry/settings/defaultFee").set(el.value === "" ? null : Number(el.value)).catch(() => {}); }
    });
    body.addEventListener("submit", (e) => {
      const f = e.target.closest("[data-admin-form]");
      if (!f) return;
      e.preventDefault();
      adminCreateClass($("#adminClassName").value, $("#adminClassCode").value).catch((err) => { console.warn(err); toast(t("adminSaveFailed"), "error"); });
    });
    body.addEventListener("click", (e) => {
      const b = e.target.closest("[data-admin-action]");
      if (!b) return;
      const a = b.dataset.adminAction, kind = b.dataset.table, row = b.dataset.row;
      const fail = (err) => { console.warn("[Classe mates]", err); toast(t("adminSaveFailed"), "error"); };
      if (a === "add-row") {
        const base = { createdAt: Date.now() };
        if (kind === "payments" && adminCache.settings && adminCache.settings.defaultFee !== undefined) base.fee = adminCache.settings.defaultFee;
        sref("registry/" + kind).push(base).catch(fail);
      } else if (a === "create-account") adminCreateAccount(kind, row).catch(fail);
      else if (a === "delete-row") adminDeleteRow(kind, row).catch(fail);
      else if (a === "save-credentials") { const r = adminCache[kind][row]; if (r) downloadFile("account-" + r.accountId + ".txt", credentialsText(kind, r)); }
      else if (a === "download-all") {
        const cols = kind === "students" ? ADMIN_STUDENT_COLUMNS : ADMIN_TEACHER_COLUMNS;
        const lines = [cols.map((c) => csvCell(c.label || t(c.labelKey))).concat([csvCell(t("colAccountId")), csvCell(t("colCode"))]).join(",")];
        rowsOf(adminCache[kind]).filter((r) => r.accountCreatedAt).forEach((r) => lines.push(cols.map((c) => csvCell(r[c.key])).concat([csvCell(r.accountId), csvCell(r.accountCode)]).join(",")));
        downloadFile("accounts-" + kind + ".csv", lines.join("\r\n"), "text/csv;charset=utf-8");
      } else if (a === "save-class-code") { const c = adminCache.classes[row]; if (c) downloadFile("class-" + c.name + ".txt", [schoolInfo() ? schoolInfo().name : "", t("adminClassName") + ": " + c.name, t("adminClassCode") + ": " + c.secret, siteUrl()].join("\r\n")); }
      else if (a === "delete-class") adminDeleteClass(row).catch(fail);
      else if (a === "open-report") openAdminReport(row);
      else if (a === "delete-report") { if (window.confirm(t("adminConfirmDeleteRow"))) sref("attendance_reports/" + row).remove().catch(fail); }
    });
  }

  /* ---------- Teacher: add a class with the name + code from the administration ---------- */
  function openClaimClass() { $("#claimForm").reset(); openDialog("claimDialog"); setTimeout(() => $("#claimName").focus(), 30); }
  async function submitClaimClass(e) {
    e.preventDefault();
    const name = $("#claimName").value.trim();
    const secret = $("#claimSecret").value.trim();
    if (!name || !secret) { toast(t("required"), "error"); return; }
    const found = await cloudFindClass(name, secret);
    if (found.error) { console.warn("[Classe mates] class lookup failed:", found.error); toast(t("accountLookupFailed"), "error"); return; }
    if (!found.cls) { toast(t("joinFailed"), "error"); return; }
    const cls = found.cls;
    const me = currentUser();
    const label = (me.name + " " + (me.surname || "")).trim();
    try {
      await sref("classes/" + cls.id + "/teacherIds/" + me.id.toLowerCase()).set(label);
      if (!cls.ownerId) await sref("classes/" + cls.id).update({ ownerId: me.id, teacher: label });
      await sref("account_classes/" + me.id.toLowerCase() + "/" + cls.id).set(true);
    } catch (err) { console.warn(err); toast(t("adminSaveFailed"), "error"); return; }
    closeDialog("claimDialog");
    toast(t("classClaimed"), "ok");
  }

  /* ---------- Attendance register: print / save as PDF, and send to the administration ----------
     "Save as PDF" uses the browser's own print dialog (choose "Save as PDF"),
     which draws Arabic correctly. The register is also uploaded so the
     administration receives it. */
  let attendanceDraft = null;
  function buildAttendanceReport(cls) {
    const rows = cls.students.map((s) => {
      const rec = state.records[recordKey(cls.id, s.id)] || {};
      let present = 0, absent = 0, excused = 0;
      const absences = [];
      Object.keys(rec).sort().forEach((date) => {
        const d = rec[date];
        if (d.present) present++;
        else { absent++; if (d.excused) excused++; absences.push({ date, excused: !!d.excused, reason: d.reason || "" }); }
      });
      return { name: (s.name + " " + (s.surname || "")).trim(), present, absent, excused, absences };
    });
    return { classId: cls.id, className: cls.name, teacher: cls.teacher, teacherId: state.currentUserId, createdAt: Date.now(), rows };
  }
  function reportFromCloud(r) {
    const list = (v) => (!v ? [] : Array.isArray(v) ? v.filter(Boolean) : Object.values(v));
    return { ...r, rows: list(r.rows).map((x) => ({ ...x, absences: list(x.absences) })) };
  }
  function attendanceReportHtml(rep) {
    const school = schoolInfo();
    const body = rep.rows.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${esc(r.present)}</td><td>${esc(r.absent)}</td><td>${esc(r.excused)}</td>
      <td>${r.absences.map((a) => esc(a.date) + (a.excused ? " ✓" : "") + (a.reason ? " (" + esc(a.reason) + ")" : "")).join("<br>")}</td></tr>`).join("");
    return `<div class="report-sheet"><h3>${esc(school ? school.name : "")}</h3>
      <p>${esc(t("attReport"))} — ${esc(rep.className)} — ${esc(rep.teacher || "")} — ${esc(new Date(rep.createdAt).toLocaleDateString(localeFor()))}</p>
      <table class="admin-table"><thead><tr><th>#</th><th>${esc(t("students"))}</th><th>${esc(t("attPresent"))}</th><th>${esc(t("attAbsent"))}</th><th>${esc(t("attExcused"))}</th><th>${esc(t("attAbsenceDates"))}</th></tr></thead>
      <tbody>${body || `<tr><td colspan="6">${esc(t("attNoStudents"))}</td></tr>`}</tbody></table></div>`;
  }
  function openAttendanceReport() {
    const cls = currentClass();
    if (!cls || !isOwner(cls)) return;
    attendanceDraft = buildAttendanceReport(cls);
    $("#attendanceTitle").textContent = t("attReport") + " — " + cls.name;
    $("#attendanceBody").innerHTML = attendanceReportHtml(attendanceDraft);
    $("#attendanceSendBtn").hidden = false;
    openDialog("attendanceDialog");
  }
  function printAttendanceReport() {
    const sheet = $("#printSheet");
    sheet.innerHTML = $("#attendanceBody").innerHTML;
    document.body.classList.add("printing");
    const done = () => { document.body.classList.remove("printing"); sheet.innerHTML = ""; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  }
  async function sendAttendanceReport() {
    if (!attendanceDraft) return;
    const id = uid();
    const rows = attendanceDraft.rows.map((r) => ({ ...r }));
    try {
      await sref("attendance_reports/" + id).set({ id, classId: attendanceDraft.classId, className: attendanceDraft.className, teacher: attendanceDraft.teacher || "", teacherId: attendanceDraft.teacherId, createdAt: firebase.database.ServerValue.TIMESTAMP, rows });
    } catch (err) { console.warn(err); toast(t("adminSaveFailed"), "error"); return; }
    toast(t("attSent"), "ok");
    closeDialog("attendanceDialog");
  }

  function bindSpaceControls() {
    $("#spaceGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-space]"); if (b) chooseSpace(b.dataset.space); });
    $("#backToSpaces").addEventListener("click", backToSpaces);
    bindAdminControls();
    document.querySelectorAll("[data-claim-class]").forEach((b) => b.addEventListener("click", openClaimClass));
    $("#claimForm").addEventListener("submit", submitClaimClass);
    $("#openAttendanceReport").addEventListener("click", openAttendanceReport);
    $("#attendancePrintBtn").addEventListener("click", printAttendanceReport);
    $("#attendanceSendBtn").addEventListener("click", sendAttendanceReport);
  }

  /* ---------- Rendering ---------- */
  function render() {
    const list = $("#view-list");
    const detail = $("#view-detail");
    const admin = $("#view-admin");
    if (isAdmin()) { list.hidden = true; detail.hidden = true; admin.hidden = false; renderAdmin(); return; }
    admin.hidden = true;
    const cls = currentClass();
    list.hidden = !!cls;
    detail.hidden = !cls;
    if (cls) renderDetail(cls); else renderList();
  }

  function myClasses() {
    const me = (state.currentUserId || "").toLowerCase();
    return state.classes.filter((c) => isOwner(c) || c.students.some((s) => (s.accountId || "").toLowerCase() === me));
  }
  function renderList() {
    const mine = myClasses();
    document.querySelectorAll("[data-claim-class]").forEach((b) => { b.hidden = !isTeacher(); });
    $("#emptyText").textContent = isTeacher() ? t("noClassTeacher") : t("noClassStudent");
    $("#usage").textContent = mine.length + " " + t("classesUsed");
    const empty = $("#empty");
    const grid = $("#classGrid");
    empty.hidden = mine.length > 0;
    $("#listHeader").hidden = mine.length === 0;
    grid.innerHTML = mine.map((c) => {
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
    $("#openNews").hidden = !owner || orgEditMode;
    $("#openCollab").hidden = !owner || orgEditMode;
    $("#openStartMate").hidden = !owner || orgEditMode;
    $("#openAttendanceReport").hidden = !owner || orgEditMode;
    $("#joinLiveInClass").hidden = !(!owner && liveActiveByClass[cls.id] && liveSessionActive !== cls.id);

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
            ${s.age ? `<span class="student-card__meta">${esc(t("age"))}: ${esc(s.age)}</span>` : ""}
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
      syncClass(cls);
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
    syncClass(cls);
    renderOrgEditor(cls);
  }

  /* ---------- Classroom settings: expel a student ---------- */

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
    if (kind === "liveSession") return t("liveSessionKind");
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
    syncClass(cls);
    toast(t("collabStarted"), "ok");
    renderDetail(cls);
  }
  function endCollab() {
    const cls = currentClass();
    if (!cls) return;
    cls.collab = null;
    save();
    syncClass(cls);
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



  /* ---------- Join a classroom (student side, 1 free class per year) ---------- */


  /* ---------- Students (Controller adds an EXISTING account by its ID) ---------- */


  /* ---------- Classroom sync (Realtime Database) ----------
     Classes are created by the administration and live in the cloud at
     schools/{school}/classes/{classId}. The roster (students/) is written
     only by the administration; a teacher who enters the class name + code
     is added under teacherIds/. What a teacher or student device writes
     back is just the shared classroom state (the seating division and the
     collaboration pairs), so nobody overwrites the roster by accident.
     Realtime Database can't store empty arrays, null entries or empty
     objects (they vanish), so state is stored as maps and rebuilt on read.
       - account_classes/{accountId}/{classId}: which classrooms an account
         belongs to, so a device finds its classrooms after logging in.
       - class_lookup/{lowercased class name}: classId, so a teacher can find
         a class from its name + code. */
  function classStateToCloud(cls) {
    const out = { orgInit: cls.org ? true : null, orgSlots: null, collabStartedAt: null, collabEndsAt: null, collabPairs: null };
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
    const teacherMap = raw.teacherIds || {};
    const cls = {
      id: raw.id, name: raw.name, teacher: raw.teacher || "", secret: raw.secret,
      ownerId: raw.ownerId || null, schoolId: raw.schoolId || null,
      teacherIds: Object.keys(teacherMap),
      students: toList(raw.students), joinRequests: [],
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
    sref("classes/" + cls.id).update(classStateToCloud(cls)).catch((err) => {
      console.warn("[Classe mates] Could not sync the classroom to Firebase:", err);
    });
  }

  function mergeClassFromCloud(raw) {
    if (!raw || !raw.id) return;
    const cls = classFromCloud(raw);
    const idx = state.classes.findIndex((c) => c.id === cls.id);
    if (idx === -1) state.classes.push(cls); else state.classes[idx] = cls;
    save();
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
     listener on each classroom so changes made on any other device show up
     here immediately. */
  function subscribeToMyClasses() {
    if (!window.rtdb || !state.currentUserId || isAdmin()) return;
    const me = state.currentUserId.toLowerCase();
    const idxRef = sref("account_classes/" + me);
    if (myClassIndexListener) myClassIndexListener.ref.off("value", myClassIndexListener.cb);
    const cb = (snap) => {
      const ids = snap.val() ? Object.keys(snap.val()) : [];
      ids.forEach((classId) => {
        if (myClassListeners[classId]) return;
        const ref = sref("classes/" + classId);
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

  /* Find a classroom by name + secret code (a teacher adding the class the
     administration gave them). */
  async function cloudFindClass(name, secret) {
    if (!window.rtdb) return { cls: null, error: new Error("Firebase is not configured.") };
    try {
      const idSnap = await sref("class_lookup/" + classLookupKey(name)).once("value");
      if (!idSnap.exists()) return { cls: null, error: null };
      const clsSnap = await sref("classes/" + idSnap.val()).once("value");
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
      await sref("students").push({
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
    if (!window.rtdb || !state.schoolId) return { error: new Error("Firebase is not configured.") };
    try {
      await sref("accounts/" + u.id.toLowerCase()).update({
        id: u.id, password: u.password, name: u.name, surname: u.surname || "",
        age: u.age === undefined || u.age === "" ? null : (Number(u.age) || null), level: u.level || "", photo: u.photo || null,
        plus: !!u.plus, lastEdit: u.lastEdit || null,
        role: u.role || null, schoolId: u.schoolId || state.schoolId, classId: u.classId || null, phone: u.phone || null
      });
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }
  async function cloudFindAccountById(id) {
    if (!window.rtdb || !state.schoolId) return { data: null, error: new Error("Firebase is not configured.") };
    try {
      const snap = await sref("accounts/" + id.toLowerCase()).once("value");
      if (!snap.exists()) return { data: null, error: null };
      const d = snap.val();
      return { data: {
        id: d.id, password: d.password, name: d.name, surname: d.surname || "", age: d.age || "", level: d.level || "", photo: d.photo || null,
        plus: !!d.plus, lastEdit: d.lastEdit || null, role: d.role || null, schoolId: d.schoolId || state.schoolId, classId: d.classId || null, phone: d.phone || ""
      }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
  async function ensureAccountLocally(id) {
    let local = state.users.find((u) => u.id.toLowerCase() === id.toLowerCase());
    if (local) return { account: local, error: null };
    const { data, error } = await cloudFindAccountById(id);
    if (data) {
      state.users.push(data);
      save();
      return { account: data, error: null };
    }
    // error is null when the lookup genuinely found no such account; it is
    // set when the lookup itself failed (offline, misconfigured Firebase,
    // missing table/RLS policy) — those two cases must not look the same
    // to the teacher, or a real connection problem reads as "no such user".
    return { account: null, error: error || null };
  }

  /* ---------- Events ---------- */
  function bind() {
    document.querySelectorAll("#langSelect, #langSelectAuth, #langSelectSchool, #langSelectSpace").forEach((el) => {
      el.addEventListener("change", (e) => { state.lang = e.target.value; save(); applyLanguage(); });
    });

    document.querySelectorAll("[data-theme-choice]").forEach((b) => {
      b.addEventListener("click", () => { state.theme = b.dataset.themeChoice; save(); applyTheme(); });
    });

    $("#openSettings").addEventListener("click", () => openDialog("settingsDialog"));


    $("#classGrid").addEventListener("click", (e) => {
      const card = e.target.closest("[data-open]");
      if (!card) return;
      state.currentClassId = card.dataset.open;
      render();
      window.scrollTo({ top: 0 });
    });
    $("#backToList").addEventListener("click", () => { state.currentClassId = null; render(); });


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
      syncClass(cls);
      renderDetail(cls);
    });

    $("#openCollab").addEventListener("click", startCollab);
    $("#collabBanner").addEventListener("click", (e) => { if (e.target.closest("#collabEndBtn")) endCollab(); });

    $("#openDivide").addEventListener("click", toggleDivide);
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
      const answerBtn = e.target.closest("[data-answer-homework]");
      if (answerBtn) openHomeworkAnswer(answerBtn.dataset.answerHomework);
    });
    $("#homeworkAnswerForm").addEventListener("submit", submitHomeworkAnswer);

    // Auth
    $("#loginForm").addEventListener("submit", submitLogin);
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

    // "START A MATE" live session
    $("#openStartMate").addEventListener("click", startLiveSession);
    bindLiveControls();
    bindSpaceControls();
    $("#liveNoticeJoinBtn").addEventListener("click", () => joinLiveSession($("#liveNoticeBanner").dataset.classId));
    $("#liveNoticeDismiss").addEventListener("click", () => { $("#liveNoticeBanner").hidden = true; });

    // Co-teacher AI
    $("#schoolGateForm").addEventListener("submit", submitSchoolGate);
    $("#bannedCloseBtn").addEventListener("click", closeBannedOverlay);

    // Profile

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
    renderAuthGate();
    applyLanguage();
    setInterval(tickClock, 1000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
