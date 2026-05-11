// ═══════════════════════════════════════════════════════════════════════
//  GRM PLAN — REPLIT PATCH FILE
//  Apply to: esms-builder/src/App.jsx
//            esms-builder/src/i18n/translations.js
//            esms-builder/src/i18n/guideTranslations.js
//
//  INSTRUCTIONS (4 steps):
//  ─────────────────────────────────────────────────────────────────────
//  STEP 1 — App.jsx: Add the GRM plan definition to PLAN_DEFS_SIMPLE
//           Find the closing of the sep_plan entry:
//             {id:\"sep_records\", ...}
//           ],
//         },
//       ];                 ← the closing of the array
//           Paste the GRM_PLAN_DEF block immediately BEFORE the ]; line.
//
//  STEP 2 — App.jsx: Add the GRM guide entry to GUIDELINES_DB
//           Find the closing of the tool_supplier_assessment entry:
//             },
//           };             ← the closing of the const GUIDELINES_DB object
//           Paste the GUIDELINES_DB_GRM_ENTRY block immediately BEFORE the }; line.
//
//  STEP 3 — translations.js: Add keys for all three languages.
//           Inside each language object (en: {}, fr: {}, pt: {}),
//           paste the translation keys from TRANSLATIONS_ADDITIONS
//           immediately before the closing } of each language block.
//
//  STEP 4 — guideTranslations.js: Add FR and PT guide translations.
//           Inside the fr: {} block, paste GRM_GUIDE_FR before the }, // end fr line.
//           Inside the pt: {} block, paste GRM_GUIDE_PT before the }, // end pt line.
// ═══════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════
//  STEP 1 — PASTE INTO PLAN_DEFS_SIMPLE (before the closing ];)
// ═══════════════════════════════════════════════════════════════════════
/*
  {
    id:"grm_plan", icon:"📣", label:"Grievance Redress Mechanism Plan", color:"#6C3483",
    required:"WB ESS10 | IFC PS1 | ROGEAP §13 (pp.90-94) | ROGEAP GRM Operational Manual",
    intro:"Establishes your company's system for receiving, processing, and resolving complaints from workers, customers, and communities. The GRM Plan governs the design and governance of the mechanism; the Grievance Log tool (Section 6) provides the day-to-day operational register for recording cases.",
    linkedTools:["grievance_log","stakeholder_register"],
    fields:[
      {id:"grm_scope",label:"GRM Scope & Objectives",t:"ta",rows:3,
       ph:"This GRM applies to all grievances from: employees, field agents, customers, community members, and third parties related to our operations. Objectives: (1) provide accessible, fair, and timely resolution; (2) identify and address systemic issues; (3) prevent escalation."},
      {id:"grm_channels",label:"Complaint Channels (how to submit a grievance)",t:"ta",rows:5,
       ph:"1. Phone/WhatsApp: [Number] — 8am–6pm Mon-Fri, [Language(s)]\n2. Email: [address]\n3. Written: Submit at [service centre / agent point]\n4. In-person: Request meeting with [Role] at [office address]\n5. Anonymous box: Located at [location]\n6. GBV/SEAH-specific channel: Direct to [Name/Role, different from line manager] — confidential"},
      {id:"grm_process",label:"Five-Stage Processing Procedure (ROGEAP Table 18)",t:"ta",rows:8,
       ph:"STAGE 1 — IDENTIFICATION (Day 1): Complaint received via any channel. GRM Officer logs immediately in the Grievance Log with case number, date, channel, and nature.\n\nSTAGE 2 — ASSESSMENT & LOGGING (Days 1-3): GRM Officer assesses significance and assigns Level (1/2/3). Complainant acknowledged in writing.\n\nSTAGE 3 — ACKNOWLEDGEMENT (within 3 days): Formal acknowledgement sent to complainant confirming receipt, case number, and expected timeline.\n\nSTAGE 4 — RESPONSE DEVELOPMENT & IMPLEMENTATION (Days 4-15): Assigned to appropriate team/manager. Response developed; redress action implemented; outcome communicated to complainant.\n\nSTAGE 5 — MONITORING & CLOSURE: Outcome recorded in log. Complainant asked if satisfied. Case closed. Data reviewed quarterly for systemic trends."},
      {id:"grm_levels",label:"Grievance Level Classification & Escalation",t:"ta",rows:5,
       ph:"LEVEL 1 — One-off, minor: Standard process; GRM Officer resolves within 15 days.\nLEVEL 2 — Widespread / repeated / PAYG: Escalate to Department Manager within 5 days. Resolution plan within 10 days.\nLEVEL 3 — Breach of law / serious harm / SEAH: Escalate immediately to MD. Potential external notification. Legal/HR involvement. GBV/SEAH protocol activated.\n\nExternal escalation: Complainant always retains right to approach regulator, court, or investor-level mechanism (CAO/IRM/ROGEAP Programme Office)."},
      {id:"grm_seah_protocol",label:"GBV/SEAH Special Protocol",t:"ta",rows:6,
       ph:"SEAH complaints are handled under a SEPARATE, CONFIDENTIAL protocol:\n• Dedicated reporting channel: [Name/Role — not line manager]\n• Ethical: Respect survivor's dignity, autonomy, and confidentiality at all times\n• Confidential: Need-to-know only; no victim details in general GRM log\n• Rapid: Acknowledge within 24 hours; provide safety information\n• Survivor-centred: Offer referral to medical, psychosocial, and legal services\n• Investigation: Separate, trained investigators; findings not shared without consent\n• Non-retaliation: Zero-tolerance for retaliation against complainants or witnesses\n\nSEAH Log: Maintained separately, password-protected, accessible only to GRM Officer and MD."},
      {id:"grm_roles",label:"GRM Roles & Responsibilities",t:"ta",rows:4,
       ph:"GRM Officer (primary): [Name, Role] — receives all complaints, maintains log, coordinates response\nDeputy GRM Officer: [Name, Role] — covers GRM Officer absence; handles Level 2+ cases\nMD/CEO: Receives Level 3 escalations; approves external notifications; quarterly GRM review\nSEAH Focal Point: [Name, Role — female officer preferred] — handles all GBV/SEAH complaints under separate protocol\nAll staff: Responsible for directing complaints to GRM Officer within 24 hours of receipt"},
      {id:"grm_timeline",label:"Response Timelines Commitment",t:"ta",rows:4,
       ph:"Acknowledgement: within 3 calendar days of receipt\nInitial response (Level 1): within 15 calendar days\nInitial response (Level 2): within 10 calendar days\nInitial response (Level 3/SEAH): within 5 calendar days\nAll timelines communicated in writing to complainant at acknowledgement stage"},
      {id:"grm_accessibility",label:"Accessibility & Inclusion",t:"ta",rows:4,
       ph:"Languages: [List language(s) GRM operates in]\nLiteracy: Verbal complaints accepted via phone or in person (not required to write)\nAnonymity: Anonymous complaints accepted and investigated (response posted at complaint point if no contact details)\nGender: Female complainants may request female GRM Officer\nVulnerable groups: Trusted intermediary (e.g. community leader, NGO partner) may submit on behalf of complainant with written consent"},
      {id:"grm_transparency",label:"Transparency & Reporting",t:"ta",rows:3,
       ph:"Internal: GRM summary report to MD monthly; full case log available for ROGEAP/investor review\nExternal: Grievance statistics published in Annual Sustainability Report; community feedback shared at quarterly community meetings\nROGEAP monitoring: GRM status reported in quarterly ROGEAP E&S Monitoring Form (Table 22)"},
      {id:"grm_review",label:"GRM Review, Improvement & Capacity",t:"ta",rows:3,
       ph:"Annual review: Process effectiveness assessed; complainant satisfaction rates reviewed; mechanism updated\nTraining: GRM Officer trained in GRM procedures and GBV/SEAH protocol annually\nLessons learned: Systemic issues identified → corrective actions → update to ESMS / ESAP"},
      {id:"grm_kpis",label:"GRM Performance Targets",t:"ta",rows:4,
       ph:"• 100% of complaints acknowledged within 3 calendar days\n• ≥ 90% of Level 1 complaints resolved within 15 days\n• ≥ 85% complainant satisfaction rate (quarterly survey)\n• Zero complaints unanswered beyond 30 days\n• Zero retaliation incidents against complainants\n• GRM data reviewed at every quarterly management meeting"},
    ]
  },
*/


// ═══════════════════════════════════════════════════════════════════════
//  STEP 2 — PASTE INTO GUIDELINES_DB (before the closing };)
// ═══════════════════════════════════════════════════════════════════════
/*
  // ── GRM PLAN ───────────────────────────────────────────────────────
  grm_plan: {
    id: "grm_plan",
    title: "Grievance Redress Mechanism Plan",
    color: "#6C3483",
    rogeapRef: "ROGEAP §13 (pp.90-94); Tables 18-21; ROGEAP GRM Operational Manual",
    ifcRef: "IFC PS1; IFC ESMS Toolkit Element 6; WB ESS10",
    summary: "The GRM Plan establishes the governance, design, and operating procedures of your company's Grievance Redress Mechanism (GRM) — the formal system through which workers, customers, and community members can raise concerns, seek remediation, and have their complaints addressed fairly and in a timely manner. The GRM is required by ROGEAP, WB ESS10, and IFC PS1. It complements the Grievance Log (Section 6 tool) which records day-to-day case management.",
    sections: [
      {
        heading: "What a GRM Plan must contain",
        body: "ROGEAP §13 (pp.90-94) and the ROGEAP GRM Operational Manual specify that a company's GRM must include the following design elements:\n\n1. SCOPE: Who can use it (workers, customers, communities, contractors) and what types of complaints are covered\n2. CHANNELS: How complaints can be submitted (phone, email, in-person, written, anonymous box) — multiple channels are required to ensure accessibility\n3. PROCESS: The five-stage processing procedure (Identification → Assessment → Acknowledgement → Response → Monitoring) with defined timelines at each stage\n4. ESCALATION LEVELS: Level 1 (one-off/minor), Level 2 (widespread/repeated), Level 3 (breach of law or serious harm) — each with different response requirements\n5. SEAH PROTOCOL: A separate, confidential process for GBV/Sexual Exploitation, Abuse, and Harassment complaints\n6. ROLES: Named individuals responsible for operating the GRM\n7. TIMELINES: Committed response timelines communicated to complainants\n8. ACCESSIBILITY: Provisions for illiterate, anonymous, and vulnerable complainants\n9. TRANSPARENCY: How GRM performance will be reported internally and externally\n10. REVIEW: How the mechanism will be assessed and improved over time\n\nThe ROGEAP GRM Operational Manual is the authoritative document for design standards. Source: ROGEAP §13, pp.90-94; ROGEAP GRM Operational Manual (2023)."
      },
      {
        heading: "Five-Stage ROGEAP Process (Tables 18-21)",
        body: "ROGEAP Table 18 (p.92) specifies a five-stage GRM process:\n\nSTAGE 1 — IDENTIFICATION (Day 1): Complaint received via any channel and logged immediately by the GRM Officer. A unique case number is assigned.\n\nSTAGE 2 — ASSESSMENT & LOGGING (Days 1-3): Significance of complaint assessed. Assigned a Level: Level 1 (one-off event), Level 2 (widespread or repeated), Level 3 (breach of law or company policy). Recorded in GRM log. Complainant acknowledged.\n\nSTAGE 3 — ACKNOWLEDGEMENT (within 3 days): Formal written acknowledgement sent to complainant confirming receipt, case number, and expected timeline.\n\nSTAGE 4 — RESPONSE DEVELOPMENT & IMPLEMENTATION (Days 4-15): Complaint assigned to appropriate person for resolution. Response developed with management input as needed. Redress action implemented. Outcome communicated to complainant in writing.\n\nSTAGE 5 — MONITORING: Outcomes tracked. Complainant satisfaction confirmed. Grievance data reviewed quarterly for systemic trends. Mechanism updated based on lessons learned.\n\nSource: ROGEAP Tables 18-21, pp.92-94; ROGEAP GRM Operational Manual."
      },
      {
        heading: "GBV/SEAH Complaints — Mandatory Special Protocol",
        body: "GBV/Sexual Exploitation, Abuse, and Harassment (SEAH) complaints must follow a completely separate, confidential process. The ROGEAP GRM Operational Manual specifies five non-negotiable principles:\n\n• ETHICAL: All actions must respect the dignity, rights, and autonomy of the survivor at all times\n• CONFIDENTIAL: Information shared only on a strict need-to-know basis; personal details never in the general GRM log\n• NON-BIASED: Dedicated, trained investigators who recognise and manage their own biases\n• RAPID: Initial response within 24-72 hours; clear timelines communicated to survivor\n• SURVIVOR-CENTRED: Survivor's safety, needs, and well-being take priority; proactive referral to medical, psychosocial, and legal services\n\nThe SEAH log must be maintained separately, password-protected, and accessible only to designated personnel. In the general GRM log, record only the NATURE of complaint (e.g. 'SEAH') and PROCESSING OUTCOME — never victim personal details.\n\nThe company must designate a dedicated, trained SEAH Focal Point who is different from the complainant's line manager. Female focal points are strongly recommended in mixed-gender workplaces.\n\nSource: ROGEAP §13, pp.91-92; ROGEAP GRM Operational Manual, Section 4."
      },
      {
        heading: "Relationship between GRM Plan and Grievance Log",
        body: "The GRM Plan (this section) and the Grievance Log tool (Section 6) are complementary but distinct components of your ESMS:\n\nGRM PLAN sets out the SYSTEM DESIGN:\n• Governance structure (who is responsible, what authority they have)\n• Complaint channels and intake procedures\n• Processing stages and timelines\n• Level classification and escalation rules\n• SEAH special protocol\n• Accessibility and inclusion provisions\n• Reporting and review commitments\n\nGRIEVANCE LOG is the OPERATIONAL RECORD:\n• Individual case register (one row per complaint)\n• Fields for case number, date, complainant, nature, level, assigned to, action taken, outcome, satisfaction\n• Evidences that the GRM Plan is being implemented\n• Used for quarterly ROGEAP monitoring reports\n\nInvestors, auditors, and ROGEAP reviewers will ask to see BOTH: the Plan (to verify the system is properly designed) and the Log (to verify it is being used). Absence of the Log is treated as absence of implementation even if the Plan exists."
      },
      {
        heading: "IFC Requirements and Design Principles",
        body: "IFC Performance Standard 1 (Assessment and Management of Environmental and Social Risks) requires that companies establish a 'grievance mechanism for Affected Communities' that meets these criteria:\n\n• PROPORTIONALITY: Scaled to the risks and adverse impacts of the project\n• ACCESSIBILITY: Accessible to all affected people without cost, and without fear of retaliation\n• TRANSPARENT: Affected communities are informed of how the mechanism works\n• LEGITIMATE: Operated in a culturally appropriate manner and with appropriate authority\n• CULTURALLY APPROPRIATE: Methods and channels suitable to local context\n• GENDER-SENSITIVE: Specific design features for women and vulnerable groups\n• CONFIDENTIAL: Personal information protected\n\nThe IFC ESMS Toolkit Element 6 (Operational Control) frames grievance management as an operational control measure — not just a complaint box, but a systematic process integrated into company management.\n\nWB ESS10 adds that the grievance mechanism must be established early in project implementation, before activities begin in new communities. It must provide for GBV/SEA/SH complaints via a separate, safe channel.\n\nSource: IFC PS1 §35-36; IFC ESMS Toolkit Element 6; WB ESS10 §§20-24."
      },
      {
        heading: "Practical Guidance for OGS Companies",
        body: "For off-grid solar companies operating in West and Central Africa, the following practical points apply:\n\nMULTIPLE CHANNELS ARE ESSENTIAL: Many customers in rural areas are more comfortable using WhatsApp or calling than submitting written complaints. Phone and WhatsApp channels are typically the most used by OGS customers.\n\nANONYMITY: A significant proportion of complaints — particularly those involving SEAH, agent misconduct, or sensitive issues — will only be submitted if anonymity is possible. An anonymous channel (suggestion box, anonymous email, or anonymous WhatsApp) must be available and communicated.\n\nLANGUAGE: The GRM must operate in the languages your customers and workers actually speak — not just the official national language. Verbal complaints must be accepted for customers with low literacy.\n\nAGENT MISCONDUCT: A common complaint category for OGS companies is agent misconduct (mis-selling, harassment, false promises). The GRM must be accessible to customers independently of the agent who sold to them — customers must be able to contact the company directly.\n\nROGEAP MONITORING: Grievance data (number received, resolved, pending, by category) must be reported in every quarterly ROGEAP E&S Monitoring Form (Table 22). The ROGEAP Programme Office treats a non-functional or under-reported GRM as a significant compliance gap.\n\nSource: ROGEAP GRM Operational Manual; ROGEAP §13; IFC PS1."
      }
    ],
    resources: [
      { label: "ROGEAP GRM Operational Manual (2023)", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/GRM-Operational-Manual-ROGEAP-ECOWAS.pdf" },
      { label: "ROGEAP ESMS Guidelines (PDF) — §13 Grievance Mechanism", url: "https://ecowas.rogeap.org/wp-content/uploads/2023/10/ROGEAP_ESMS-Guidelines_v_01.pdf" },
      { label: "IFC PS1 — Assessment & Management of E&S Risks (§35-36 GRM)", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards" },
      { label: "IFC ESMS Toolkit Element 6 — Operational Control", url: "https://www.ifc.org/en/insights-reports/2015/publications-handbook-esms-general" },
      { label: "WB ESS10 — Stakeholder Engagement & GRM", url: "https://www.worldbank.org/en/projects-operations/environmental-and-social-framework" },
      { label: "CAO Grievance Mechanism Design Resources", url: "https://www.cao-ombudsman.org/accessing-cao/making-a-complaint/grievance-mechanism-resources" },
      { label: "OHCHR — Operational-level Grievance Mechanisms", url: "https://www.ohchr.org/sites/default/files/Documents/Publications/Guiding_Principles_Business_HR_EN.pdf" },
    ]
  },
*/


// ═══════════════════════════════════════════════════════════════════════
//  STEP 3 — PASTE INTO translations.js (inside each language block)
// ═══════════════════════════════════════════════════════════════════════

// ── English (en) ──────────────────────────────────────────────────────
/*  Add inside en: { ... }

    // GRM Plan fields
    grmScope: "GRM Scope & Objectives",
    grmChannels: "Complaint Channels",
    grmProcess: "Five-Stage Processing Procedure",
    grmLevels: "Grievance Level Classification & Escalation",
    grmSeahProtocol: "GBV/SEAH Special Protocol",
    grmRoles: "GRM Roles & Responsibilities",
    grmTimeline: "Response Timelines Commitment",
    grmAccessibility: "Accessibility & Inclusion",
    grmTransparency: "Transparency & Reporting",
    grmReview: "GRM Review, Improvement & Capacity",
    grmKpis: "GRM Performance Targets",
*/

// ── Français (fr) ─────────────────────────────────────────────────────
/*  Add inside fr: { ... }

    // Plan MGR — libellés des champs
    grmScope: "Champ d'application et objectifs du MGR",
    grmChannels: "Canaux de soumission des plaintes",
    grmProcess: "Procédure de traitement en cinq étapes",
    grmLevels: "Classification des réclamations et escalade",
    grmSeahProtocol: "Protocole spécial VFS/HAS",
    grmRoles: "Rôles et responsabilités du MGR",
    grmTimeline: "Engagement sur les délais de réponse",
    grmAccessibility: "Accessibilité et inclusion",
    grmTransparency: "Transparence et rapportage",
    grmReview: "Révision, amélioration et capacité du MGR",
    grmKpis: "Objectifs de performance du MGR",
*/

// ── Português (pt) ────────────────────────────────────────────────────
/*  Add inside pt: { ... }

    // Plano MR — rótulos dos campos
    grmScope: "Âmbito e objetivos do MR",
    grmChannels: "Canais de submissão de reclamações",
    grmProcess: "Procedimento de processamento em cinco estágios",
    grmLevels: "Classificação das reclamações e escalonamento",
    grmSeahProtocol: "Protocolo especial VBG/ASS",
    grmRoles: "Papéis e responsabilidades do MR",
    grmTimeline: "Compromisso com prazos de resposta",
    grmAccessibility: "Acessibilidade e inclusão",
    grmTransparency: "Transparência e reporte",
    grmReview: "Revisão, melhoria e capacidade do MR",
    grmKpis: "Metas de desempenho do MR",
*/


// ═══════════════════════════════════════════════════════════════════════
//  STEP 4a — PASTE INTO guideTranslations.js INSIDE fr: { ... }
//            (before the closing }, // end fr line)
// ═══════════════════════════════════════════════════════════════════════
/*
  // ── grm_plan ──────────────────────────────────────────────────────
  grm_plan: {
    title: "Plan de Mécanisme de Gestion des Réclamations (MGR)",
    summary: "Le Plan MGR établit la gouvernance, la conception et les procédures opérationnelles du Mécanisme de gestion des réclamations de votre entreprise — le système formel par lequel les travailleurs, les clients et les membres de la communauté peuvent soulever des préoccupations, demander réparation et faire traiter leurs plaintes de manière équitable et rapide. Le MGR est requis par ROGEAP, l'ESS10 de la BM et la NP SFI 1. Il complète le Journal de réclamations (outil de la Section 6) qui enregistre la gestion quotidienne des cas.",
    sections: [
      {
        heading: "Ce que le Plan MGR doit contenir",
        body: "ROGEAP §13 (pp.90-94) et le Manuel opérationnel ROGEAP précisent que le MGR d'une entreprise doit inclure les éléments de conception suivants :\n\n1. CHAMP D'APPLICATION : Qui peut l'utiliser (travailleurs, clients, communautés, contractuels) et quels types de plaintes sont couverts\n2. CANAUX : Comment les plaintes peuvent être soumises (téléphone, e-mail, en personne, écrit, boîte anonyme) — plusieurs canaux sont requis pour garantir l'accessibilité\n3. PROCESSUS : La procédure de traitement en cinq étapes (Identification → Évaluation → Accusé de réception → Réponse → Suivi) avec des délais définis à chaque étape\n4. NIVEAUX D'ESCALADE : Niveau 1 (ponctuel/mineur), Niveau 2 (répandu/récurrent), Niveau 3 (violation de loi ou préjudice grave) — chacun avec des exigences de réponse différentes\n5. PROTOCOLE HAS : Un processus séparé et confidentiel pour les plaintes de VFS/Exploitation, Abus et Harcèlement Sexuels\n6. RÔLES : Personnes nommées responsables du fonctionnement du MGR\n7. DÉLAIS : Délais de réponse engagés communiqués aux plaignants\n8. ACCESSIBILITÉ : Dispositions pour les plaignants analphabètes, anonymes et vulnérables\n9. TRANSPARENCE : Comment les performances du MGR seront rapportées en interne et en externe\n10. RÉVISION : Comment le mécanisme sera évalué et amélioré au fil du temps\n\nLe Manuel opérationnel ROGEAP est le document de référence pour les normes de conception. Source : ROGEAP §13, pp.90-94 ; Manuel opérationnel ROGEAP (2023)."
      },
      {
        heading: "Procédure ROGEAP en cinq étapes (Tableaux 18-21)",
        body: "Le Tableau 18 de ROGEAP (p.92) précise un processus MGR en cinq étapes :\n\nÉTAPE 1 — IDENTIFICATION (Jour 1) : Plainte reçue via n'importe quel canal et immédiatement enregistrée par l'Agent MGR. Un numéro de dossier unique est attribué.\n\nÉTAPE 2 — ÉVALUATION ET ENREGISTREMENT (Jours 1-3) : Importance de la plainte évaluée. Assignation d'un niveau : Niveau 1 (événement ponctuel), Niveau 2 (répandu ou récurrent), Niveau 3 (violation de loi ou de politique d'entreprise). Enregistrée dans le journal MGR. Plaignant accusé de réception.\n\nÉTAPE 3 — ACCUSÉ DE RÉCEPTION (dans les 3 jours) : Accusé de réception formel écrit envoyé au plaignant confirmant la réception, le numéro de dossier et le calendrier prévu.\n\nÉTAPE 4 — ÉLABORATION ET MISE EN ŒUVRE DE LA RÉPONSE (Jours 4-15) : Plainte assignée à la personne appropriée pour résolution. Réponse développée avec l'appui de la direction si nécessaire. Action corrective mise en œuvre. Résultat communiqué par écrit au plaignant.\n\nÉTAPE 5 — SUIVI ET CLÔTURE : Résultats suivis. Satisfaction du plaignant confirmée. Dossier clôturé. Données examinées trimestriellement pour les tendances systémiques.\n\nSource : Tableaux 18-21 de ROGEAP, pp.92-94 ; Manuel opérationnel ROGEAP."
      },
      {
        heading: "Plaintes VFS/HAS — Protocole spécial obligatoire",
        body: "Les plaintes de VFS/Exploitation, Abus et Harcèlement Sexuels (HAS) doivent suivre un processus entièrement séparé et confidentiel. Le Manuel opérationnel ROGEAP précise cinq principes non négociables :\n\n• ÉTHIQUE : Toutes les actions doivent respecter la dignité, les droits et l'autonomie du survivant à tout moment\n• CONFIDENTIEL : Informations partagées uniquement sur la base stricte du besoin d'en connaître ; données personnelles jamais dans le journal général\n• IMPARTIAL : Enquêteurs dédiés et formés qui reconnaissent et gèrent leurs propres biais\n• RAPIDE : Réponse initiale dans les 24-72 heures ; délais clairs communiqués au survivant\n• CENTRÉ SUR LE SURVIVANT : Sécurité, besoins et bien-être du survivant en priorité ; orientation proactive vers des services médicaux, psychosociaux et juridiques\n\nLe journal HAS doit être tenu séparément, protégé par mot de passe, et accessible uniquement au personnel désigné. Dans le journal général, n'enregistrer que la NATURE de la plainte (ex. « HAS ») et le RÉSULTAT DU TRAITEMENT — jamais les données personnelles de la victime.\n\nL'entreprise doit désigner un Point focal HAS dédié et formé, différent du responsable hiérarchique du plaignant. Des points focaux féminins sont fortement recommandés.\n\nSource : ROGEAP §13, pp.91-92 ; Manuel opérationnel ROGEAP, Section 4."
      },
      {
        heading: "Relation entre le Plan MGR et le Journal de réclamations",
        body: "Le Plan MGR (cette section) et le Journal de réclamations (outil de la Section 6) sont des composantes complémentaires mais distinctes de votre SGSE :\n\nLE PLAN MGR établit la CONCEPTION DU SYSTÈME :\n• Structure de gouvernance (qui est responsable, quelle autorité)\n• Canaux de plaintes et procédures d'admission\n• Étapes de traitement et délais\n• Classification par niveau et règles d'escalade\n• Protocole spécial HAS\n• Dispositions d'accessibilité et d'inclusion\n• Engagements de rapportage et de révision\n\nLE JOURNAL DE RÉCLAMATIONS est LE REGISTRE OPÉRATIONNEL :\n• Registre de cas individuels (une ligne par plainte)\n• Champs : numéro de dossier, date, plaignant, nature, niveau, assigné à, action prise, résultat, satisfaction\n• Atteste que le Plan MGR est mis en œuvre\n• Utilisé pour les rapports de suivi trimestriels ROGEAP\n\nLes investisseurs, auditeurs et examinateurs ROGEAP demanderont à voir LES DEUX : le Plan (pour vérifier que le système est correctement conçu) et le Journal (pour vérifier qu'il est utilisé). L'absence du Journal est traitée comme une absence de mise en œuvre, même si le Plan existe."
      },
      {
        heading: "Exigences SFI et principes de conception",
        body: "La Norme de performance SFI 1 exige que les entreprises établissent un « mécanisme de réclamation pour les communautés affectées » répondant à ces critères :\n\n• PROPORTIONNALITÉ : Adapté aux risques et impacts négatifs de l'activité\n• ACCESSIBILITÉ : Accessible à toutes les personnes affectées sans coût et sans crainte de représailles\n• TRANSPARENT : Les communautés affectées sont informées du fonctionnement du mécanisme\n• LÉGITIME : Opéré de manière culturellement appropriée et avec l'autorité appropriée\n• CULTURELLEMENT APPROPRIÉ : Méthodes et canaux adaptés au contexte local\n• SENSIBLE AU GENRE : Caractéristiques de conception spécifiques pour les femmes et les groupes vulnérables\n• CONFIDENTIEL : Informations personnelles protégées\n\nL'ESS10 de la BM ajoute que le mécanisme de réclamation doit être établi tôt dans la mise en œuvre du projet, avant le démarrage des activités dans de nouvelles communautés.\n\nSource : NP SFI 1 §35-36 ; Boîte à outils SGSE SFI Élément 6 ; ESS10 BM §§20-24."
      },
      {
        heading: "Guide pratique pour les entreprises solaires hors réseau",
        body: "Pour les entreprises solaires hors réseau opérant en Afrique de l'Ouest et Centrale, les points pratiques suivants s'appliquent :\n\nPLUSIEURS CANAUX SONT ESSENTIELS : De nombreux clients en zones rurales sont plus à l'aise avec WhatsApp ou le téléphone que pour soumettre des plaintes écrites. Les canaux téléphoniques et WhatsApp sont généralement les plus utilisés par les clients solaires hors réseau.\n\nANONYMAT : Une proportion significative des plaintes — notamment celles concernant les HAS, la conduite des agents ou des questions sensibles — ne sera soumise que si l'anonymat est possible. Un canal anonyme doit être disponible et communiqué.\n\nLANGUE : Le MGR doit fonctionner dans les langues que vos clients et travailleurs parlent réellement — pas seulement la langue nationale officielle. Les plaintes verbales doivent être acceptées pour les clients peu alphabétisés.\n\nCONDUITE DES AGENTS : Une catégorie de plaintes fréquente pour les entreprises solaires hors réseau est la conduite inappropriée des agents (vente abusive, harcèlement, fausses promesses). Le MGR doit être accessible aux clients indépendamment de l'agent qui leur a vendu.\n\nSUIVI ROGEAP : Les données sur les réclamations (nombre reçues, résolues, en attente, par catégorie) doivent être rapportées dans chaque Formulaire de suivi E&S ROGEAP trimestriel (Tableau 22).\n\nSource : Manuel opérationnel ROGEAP ; ROGEAP §13 ; NP SFI 1."
      }
    ],
    resources: [
      { label: "Manuel opérationnel ROGEAP (2023)" },
      { label: "Directives SGSE ROGEAP (PDF) — §13 Mécanisme de réclamation" },
      { label: "NP SFI 1 — Évaluation et gestion des risques E&S (§35-36 MGR)" },
      { label: "Boîte à outils SGSE SFI Élément 6 — Contrôle opérationnel" },
      { label: "ESS10 BM — Engagement des parties prenantes et MGR" },
      { label: "Ressource CAO sur la conception des mécanismes de réclamation" },
      { label: "OHCHR — Mécanismes de réclamation au niveau opérationnel" },
    ]
  },
*/


// ═══════════════════════════════════════════════════════════════════════
//  STEP 4b — PASTE INTO guideTranslations.js INSIDE pt: { ... }
//            (before the closing }, // end pt line)
// ═══════════════════════════════════════════════════════════════════════
/*
  // ── grm_plan ──────────────────────────────────────────────────────
  grm_plan: {
    title: "Plano do Mecanismo de Reclamações (MR)",
    summary: "O Plano MR estabelece a governança, o design e os procedimentos operacionais do Mecanismo de Reclamações da sua empresa — o sistema formal pelo qual trabalhadores, clientes e membros da comunidade podem levantar preocupações, buscar reparação e ter suas reclamações tratadas de forma justa e oportuna. O MR é exigido pelo ROGEAP, ESS10 do BM e PD IFC 1. Ele complementa o Log de Reclamações (ferramenta da Seção 6) que registra o gerenciamento diário dos casos.",
    sections: [
      {
        heading: "O que o Plano MR deve conter",
        body: "ROGEAP §13 (pp.90-94) e o Manual Operacional ROGEAP especificam que o MR de uma empresa deve incluir os seguintes elementos de design:\n\n1. ÂMBITO: Quem pode usá-lo (trabalhadores, clientes, comunidades, contratados) e quais tipos de reclamações são cobertos\n2. CANAIS: Como as reclamações podem ser submetidas (telefone, e-mail, pessoalmente, escrito, caixa anônima) — múltiplos canais são necessários para garantir acessibilidade\n3. PROCESSO: O procedimento de processamento em cinco estágios (Identificação → Avaliação → Reconhecimento → Resposta → Monitoramento) com prazos definidos em cada estágio\n4. NÍVEIS DE ESCALONAMENTO: Nível 1 (isolado/menor), Nível 2 (generalizado/repetido), Nível 3 (violação de lei ou dano grave) — cada um com requisitos de resposta diferentes\n5. PROTOCOLO ASS: Um processo separado e confidencial para reclamações de VBG/Exploração, Abuso e Assédio Sexual\n6. PAPÉIS: Indivíduos nomeados responsáveis pela operação do MR\n7. PRAZOS: Prazos de resposta comprometidos comunicados aos reclamantes\n8. ACESSIBILIDADE: Disposições para reclamantes analfabetos, anônimos e vulneráveis\n9. TRANSPARÊNCIA: Como o desempenho do MR será reportado interna e externamente\n10. REVISÃO: Como o mecanismo será avaliado e melhorado ao longo do tempo\n\nO Manual Operacional ROGEAP é o documento de referência para os padrões de design. Fonte: ROGEAP §13, pp.90-94; Manual Operacional ROGEAP (2023)."
      },
      {
        heading: "Processo ROGEAP de cinco estágios (Tabelas 18-21)",
        body: "A Tabela 18 do ROGEAP (p.92) especifica um processo MR de cinco estágios:\n\nESTÁGIO 1 — IDENTIFICAÇÃO (Dia 1): Reclamação recebida por qualquer canal e imediatamente registrada pelo Responsável pelo MR. Um número único de caso é atribuído.\n\nESTÁGIO 2 — AVALIAÇÃO E REGISTRO (Dias 1-3): Significância da reclamação avaliada. Atribuído um Nível: Nível 1 (evento isolado), Nível 2 (generalizado ou repetido), Nível 3 (violação de lei ou política da empresa). Registrada no log MR. Reclamante reconhecido.\n\nESTÁGIO 3 — RECONHECIMENTO (dentro de 3 dias): Reconhecimento formal escrito enviado ao reclamante confirmando o recebimento, número do caso e prazo esperado.\n\nESTÁGIO 4 — DESENVOLVIMENTO E IMPLEMENTAÇÃO DA RESPOSTA (Dias 4-15): Reclamação atribuída à pessoa adequada para resolução. Resposta desenvolvida com contribuição da gestão conforme necessário. Ação corretiva implementada. Resultado comunicado por escrito ao reclamante.\n\nESTÁGIO 5 — MONITORAMENTO E ENCERRAMENTO: Resultados rastreados. Satisfação do reclamante confirmada. Caso encerrado. Dados revisados trimestralmente para tendências sistêmicas.\n\nFonte: Tabelas 18-21 do ROGEAP, pp.92-94; Manual Operacional ROGEAP."
      },
      {
        heading: "Reclamações de VBG/ASS — Protocolo especial obrigatório",
        body: "Reclamações de VBG/Exploração, Abuso e Assédio Sexual (ASS) devem seguir um processo completamente separado e confidencial. O Manual Operacional ROGEAP especifica cinco princípios não negociáveis:\n\n• ÉTICO: Todas as ações devem respeitar a dignidade, direitos e autonomia do sobrevivente a todo momento\n• CONFIDENCIAL: Informações compartilhadas apenas com base estrita na necessidade de saber; dados pessoais nunca no log geral\n• IMPARCIAL: Investigadores dedicados e treinados que reconhecem e gerenciam seus próprios preconceitos\n• RÁPIDO: Resposta inicial em 24-72 horas; prazos claros comunicados ao sobrevivente\n• CENTRADO NO SOBREVIVENTE: Segurança, necessidades e bem-estar do sobrevivente têm prioridade; encaminhamento proativo para serviços médicos, psicossociais e jurídicos\n\nO log ASS deve ser mantido separadamente, protegido por senha, e acessível apenas ao pessoal designado. No log geral, registrar apenas a NATUREZA da reclamação (ex. 'ASS') e o RESULTADO DO PROCESSAMENTO — nunca dados pessoais da vítima.\n\nA empresa deve designar um Ponto Focal ASS dedicado e treinado, diferente do supervisor do reclamante. Pontos focais femininos são fortemente recomendados.\n\nFonte: ROGEAP §13, pp.91-92; Manual Operacional ROGEAP, Seção 4."
      },
      {
        heading: "Relação entre o Plano MR e o Log de Reclamações",
        body: "O Plano MR (esta seção) e o Log de Reclamações (ferramenta da Seção 6) são componentes complementares mas distintos do seu SGAS:\n\nO PLANO MR estabelece o DESIGN DO SISTEMA:\n• Estrutura de governança (quem é responsável, qual autoridade têm)\n• Canais de reclamação e procedimentos de admissão\n• Estágios de processamento e prazos\n• Classificação por nível e regras de escalonamento\n• Protocolo especial ASS\n• Disposições de acessibilidade e inclusão\n• Compromissos de reporte e revisão\n\nO LOG DE RECLAMAÇÕES é o REGISTRO OPERACIONAL:\n• Registro de casos individuais (uma linha por reclamação)\n• Campos: número do caso, data, reclamante, natureza, nível, atribuído a, ação tomada, resultado, satisfação\n• Evidencia que o Plano MR está sendo implementado\n• Usado para relatórios de monitoramento trimestrais do ROGEAP\n\nInvestidores, auditores e revisores ROGEAP pedirão para ver AMBOS: o Plano (para verificar se o sistema está corretamente projetado) e o Log (para verificar se está sendo usado). A ausência do Log é tratada como ausência de implementação, mesmo que o Plano exista."
      },
      {
        heading: "Requisitos IFC e princípios de design",
        body: "O Padrão de Desempenho IFC 1 exige que as empresas estabeleçam um 'mecanismo de reclamação para Comunidades Afetadas' que atenda a estes critérios:\n\n• PROPORCIONALIDADE: Dimensionado para os riscos e impactos adversos do projeto\n• ACESSIBILIDADE: Acessível a todas as pessoas afetadas sem custo e sem medo de retaliação\n• TRANSPARENTE: As comunidades afetadas são informadas sobre como o mecanismo funciona\n• LEGÍTIMO: Operado de maneira culturalmente apropriada e com autoridade adequada\n• CULTURALMENTE APROPRIADO: Métodos e canais adequados ao contexto local\n• SENSÍVEL AO GÊNERO: Características específicas de design para mulheres e grupos vulneráveis\n• CONFIDENCIAL: Informações pessoais protegidas\n\nO ESS10 do BM acrescenta que o mecanismo de reclamação deve ser estabelecido cedo na implementação do projeto, antes do início das atividades em novas comunidades.\n\nFonte: PD IFC 1 §35-36; Kit de Ferramentas SGAS IFC Elemento 6; ESS10 BM §§20-24."
      },
      {
        heading: "Orientação prática para empresas de energia solar fora da rede",
        body: "Para empresas de energia solar fora da rede que operam na África Ocidental e Central, os seguintes pontos práticos se aplicam:\n\nMÚLTIPLOS CANAIS SÃO ESSENCIAIS: Muitos clientes em áreas rurais estão mais confortáveis usando WhatsApp ou ligando do que submetendo reclamações escritas. Os canais de telefone e WhatsApp são tipicamente os mais usados pelos clientes de energia solar fora da rede.\n\nANONIMIDADE: Uma proporção significativa das reclamações — particularmente aquelas envolvendo ASS, conduta de agentes ou questões sensíveis — só será submetida se o anonimato for possível. Um canal anônimo deve estar disponível e ser comunicado.\n\nIDIOMA: O MR deve operar nos idiomas que seus clientes e trabalhadores realmente falam — não apenas no idioma nacional oficial. Reclamações verbais devem ser aceitas para clientes com baixa alfabetização.\n\nCONDUTA DO AGENTE: Uma categoria comum de reclamações para empresas de energia solar fora da rede é a conduta inadequada do agente (venda abusiva, assédio, promessas falsas). O MR deve ser acessível aos clientes independentemente do agente que os atendeu.\n\nMONITORAMENTO ROGEAP: Os dados de reclamações (número recebidas, resolvidas, pendentes, por categoria) devem ser reportados em cada Formulário de Monitoramento A&S ROGEAP trimestral (Tabela 22).\n\nFonte: Manual Operacional ROGEAP; ROGEAP §13; PD IFC 1."
      }
    ],
    resources: [
      { label: "Manual Operacional ROGEAP (2023)" },
      { label: "Diretrizes SGAS ROGEAP (PDF) — §13 Mecanismo de Reclamações" },
      { label: "PD IFC 1 — Avaliação e Gestão de Riscos A&S (§35-36 MR)" },
      { label: "Kit de Ferramentas SGAS IFC Elemento 6 — Controle Operacional" },
      { label: "ESS10 BM — Engajamento de Partes Interessadas e MR" },
      { label: "Recurso de Design de Mecanismo de Reclamações CAO" },
      { label: "OHCHR — Mecanismos de Reclamação no Nível Operacional" },
    ]
  },
*/
