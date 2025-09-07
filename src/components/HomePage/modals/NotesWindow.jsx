import React from "react";
import { motion } from "motion/react";
import { X, Download, Eye } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Subjects for each semester
const semesterSubjects = {
// Prompt: Notes section me jaise Data Science subject hai, uspe click karne par sare Data Science ke notes aa jayein. Filter me bhi Data Science select karne par wahi notes dikhein. Notes card me Title (bold), Semester, Subject, Size, Preview button ho jo click karne par PDF website ke andar hi iframe me khule.
  3: [
    "Data Science",
    "Data Structures",
    "Principles of Artificial Intelligence",
    "Probability, Statistics and Linear Algebra",
    "Digital Logic Design",
    "Universal Human Values",
    "Critical Reasoning, System Thinking"
  ],
  4: [
    "Machine Learning",
    "Object-Oriented Programming",
    "Computational Mathematics",
    "Computer Networks and Internet Protocols",
    "Software Engineering",
    "Database Management System"
  ],
  5: [
    "Computer Architecture and Organization",
    "Design and Analysis of Algorithms",
    "Data Mining",
    "Internet of Things",
    "Operating System",
    "Principles of Entrepreneurship Mindset"
  ],
  6: [
    "Digital Image Processing",
    "Fundamentals of Deep Learning",
    "Big Data Analytics",
    "Cognitive Computing",
    "Blockchain Technology",
    "Cloud Computing"
  ]
};

export default function NotesWindow({ onClose }) {
  // Data Science notes (example)
  const notesData = {
    "Data Science": [
      { title: "linear-regression.pdf", url: "https://drive.google.com/file/d/188rdGm-gAwuQKq8IhaXuid-pKAkBWhV-/view?usp=drivesdk", semester: "3"},
      { title: "FODS assignment.pdf", url: "https://drive.google.com/file/d/19DE-CrGL6zWmqfY1MRkhElx-YIUQNDxm/view?usp=drivesdk", semester: "3" },
      { title: "FODS AAKASH.pdf", url: "https://drive.google.com/file/d/1C2V_HQSy8N3RYDavXCQymj84qZY9GDoo/view?usp=drivesdk", semester: "3" },
      { title: "DS Notes.pdf", url: "https://drive.google.com/file/d/1EXNk6-o0zFKkV4YJ4Y-Ssd4REKSdYWjM/view?usp=drivesdk", semester: "3"},
      { title: "Introduction to Datascience.pdf", url: "https://drive.google.com/file/d/1Zy9JHgm-FinUyxIeDDFPGKZHH3PCCYIV/view?usp=drivesdk", semester: "3"},
      { title: "unit 2 fods.pdf", url: "https://drive.google.com/file/d/1_AVvS6HkN1ZK7EEekqnY6DdmCTuEGn9b/view?usp=drivesdk", semester: "3"},
      { title: "FODS SHORT NOTES.pdf", url: "https://drive.google.com/file/d/1_li9e2uLBuFcaBoOMLFOp7ZXU0-HFyh4/view?usp=drivesdk", semester: "3"},
      { title: "Data science Lecture notes.pdf", url: "https://drive.google.com/file/d/1cNrRSHdmGvwWOxdqN8tcWsB_zFxFKn-h/view?usp=drivesdk", semester: "3" },
      { title: "FODS FOR END TERM UNIT 1,2 and 4.pdf", url: "https://drive.google.com/file/d/1d2m44yM8Wch5hkQ4Wd7k3-z4BJb1kNn-/view?usp=drivesdk",semester: "3" },
      { title: "CHAPTER 4 FODS.pdf", url: "https://drive.google.com/file/d/1d_cOZTlmNTp6_4OHkPQE_wIy2HTAhn_h/view?usp=drivesdk", semester: "3"},
      { title: "Data_Science_Unit_I[.pdf", url: "https://drive.google.com/file/d/1ejHMQ3egBg4q80jQqZQNn2jIyZJKR4vi/view?usp=drivesdk", semester: "3"},
      { title: "Introduction to Machine Learning with Python ( PDFDrive.com )-min (1).pdf", url: "https://drive.google.com/file/d/1l-E2vl508f0N_nZ9dMw2w6Tyfyki9Qdv/view?usp=drivesdk", semester: "3" },
      { title: "FODS predictive minnig (1).pdf", url: "https://drive.google.com/file/d/1ovu4J_OCax2ZGJHfgiq19WsFAOWjLdHX/view?usp=drivesdk", semester: "3"},
      { title: "python-cheatsheets (1).pdf", url: "https://drive.google.com/file/d/1p2qGdnaoR-gqdRMVPo5hhJOAoKpGoRgq/view?usp=drivesdk", semester: "3" },
      { title: "linear_regression_notes (1).pdf", url: "https://drive.google.com/file/d/1pOirDqj3zEkqF9ZROHJyMsEPiPi4frbi/view?usp=drivesdk", semester: "3" },
      { title: "fds notes (1).pdf", url: "https://drive.google.com/file/d/1r5c5VbqbazFYpr3FWlw0xgdR6tYNNnkL/view?usp=drivesdk", semester: "3" },
      { title: "python libraries.pdf", url: "https://drive.google.com/file/d/1rM7-BocAaWsSIg5-Q9Zbw1WCeTb8Rr4K/view?usp=drivesdk", semester: "3" }
    ],
    "Data Structures": [
      { title: "Data Structure Akash.pdf", url: "https://drive.google.com/file/d/1_0qyW6J7E_WaIGTZBmfDmAjM8Uw2dyMw/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS - Assignment.pdf", url: "https://drive.google.com/file/d/16YWYDVhHJ4ttvc_nPobJdfry6BictpYd/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Unit 1 Ds.pdf", url: "https://drive.google.com/file/d/1A-fWhsqTsKgJWkCYCrG-W4EIxmWu7oWI/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS - Jyoti Notes.pdf", url: "https://drive.google.com/file/d/1IEPkj8xd2oeLZXvIziaQ_tSgZBf8VW8o/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS assignment.pdf", url: "https://drive.google.com/file/d/1IfOwiNr0Os2zIX82MIsQk1YCskD_2B8N/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DSA notes.pdf", url: "https://drive.google.com/file/d/1Kqh1gQSIRsXVfI_ZV48FTd7UW7G8q4ZI/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Ds-Aakash.pdf", url: "https://drive.google.com/file/d/1PGivIeP831IwdowImM7gDpOZ18LVIxQp/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS_Unit4.pdf", url: "https://drive.google.com/file/d/1PXc9Ex6iiqvZUSBkjUwqfOGMEAQO4bYq/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS Unit 2.pdf", url: "https://drive.google.com/file/d/1RtsE2oXu1X10Kl-bRpF3Si-tvC-62w9R/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "comrade ka DS (tree tk🥲) (1).pdf", url: "https://drive.google.com/file/d/1XF5LpWJlRqWpi8ObCCNfGpiWbqu6nnr6/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Data structure all unit (1).pdf", url: "https://drive.google.com/file/d/1ZVDvwSq9Qw62FINNQ3qrQj-xmgS0ks-t/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS NOTES.pdf", url: "https://drive.google.com/file/d/1Z_OOz-tCLOIssKCqeogNLUXRktu7TyO3/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Ds_Unit1.pdf", url: "https://drive.google.com/file/d/1dsJ1C9i1ezrqYtrK9wfYMDsmbu4Kc3wO/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS unit 1.pdf", url: "https://drive.google.com/file/d/1oe5vGhZxLJd1cLdDRctXdTvpfYB_dmCI/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DS 3 4.pdf", url: "https://drive.google.com/file/d/1x2U9rg1jKhcHU7ZeedbK2sdUa8UpvXqr/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "unit 2 ds.pdf", url: "https://drive.google.com/file/d/1zkxkBE9mEPSru4PcWTN_LPydxxvczV9y/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Digital Logic Design": [
      { title: "DLD (1-4) short notes.pdf", url: "https://drive.google.com/file/d/1T2K0LUox69Wl8bkS59-bScKLIgSI4w3v/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD unit 1,2.pdf", url: "https://drive.google.com/file/d/12nNNFDMToFAc9-QdzKppBBzAjqwhepaH/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Digitallogicdesign (morris mano.pdf", url: "https://drive.google.com/file/d/12sZ8uf9FIiNb2sEisnOXkvK6-jE7VJo3/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD E_book.pdf", url: "https://drive.google.com/file/d/13SsboPRPFwIHuyZnHvOx9qro_7jn8Q5Z/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD ASSIGNMENT.pdf", url: "https://drive.google.com/file/d/1HrnDCAGsJ6EghmOr54pZh8RHs_6EGag8/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Solution Previous end term (2022).pdf", url: "https://drive.google.com/file/d/1SwMUZCXO-p-WGhWT_hfDbnfsXNtAytZF/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "end time formula revision.pdf", url: "https://drive.google.com/file/d/1_1ja6fPzMIaTW4lmpBSA0PFtYcPGRxa0/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD.pdf", url: "https://drive.google.com/file/d/1a31GKR2fFVwJGP0yzO_O0rFbQyY-BDaT/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD IMP.pdf", url: "https://drive.google.com/file/d/1f-eypCh66PHFzxDdB9QrRsMDesCLe6eq/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD unit 1 & 2.pdf", url: "https://drive.google.com/file/d/1w7TgAwzK6hdJ5yMzBKzt-Uy3a5-0kbxi/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "DLD SIR NOTES.pdf", url: "https://drive.google.com/file/d/1xprVAYgPohzHyNH-PxzLjbt57SZu2chD/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Principles of Artificial Intelligence": [
      { title: "unit 4 pai - kasak.pdf", url: "https://drive.google.com/file/d/11vy4frIf6WrQPAuFiMWuErw3_5Nelfxk/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI previous year question paper [22,23].pdf", url: "https://drive.google.com/file/d/18EtLQ-3WeAd9xE9ntwan26OT98wUi4Ch/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI (digital notes).pdf", url: "https://drive.google.com/file/d/191yhS8TUhLYtJY6MXVf-KN9GfhKTMdkD/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Principles of Artificial Intelligence ( PDFDrive ) (1).pdf", url: "https://drive.google.com/file/d/1AP_NhJ30NKEfWuQKnNp3tKy7APWFDrE2/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Forward Chaining and backward chaining in AI - Javatpoint (1).pdf", url: "https://drive.google.com/file/d/1CgctNfIaBYWb1UIqsDLLA8wsf3o7KKpD/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Reasoning in Artificial intelligence.pdf", url: "https://drive.google.com/file/d/1D92ZejZUyb34uDyZ9KcV-0vaYRqjj7MD/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "First-order logic in Artificial Intelligence - Javatpoint (1).pdf", url: "https://drive.google.com/file/d/1JgrKiQ_vVgO_bPdHKxVc3HX1ChH5B6Vu/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI U1 U2 U3 U4.pdf", url: "https://drive.google.com/file/d/1OOt2_MRWZQjKeMhUJovuDvx3aMzNxR0L/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "notes unit 1 and 2 std.pdf", url: "https://drive.google.com/file/d/1QjmKZvg3imwArE8y5BnZDrOydhGlIXJR/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "4 - AStar.pdf", url: "https://drive.google.com/file/d/1TJIFPvr_T1XxxWxMhDbC6CcwWTYABfZD/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI previous year qp.pdf", url: "https://drive.google.com/file/d/1WTXXvxNHLnsVJTIvIWD4oOQhrLCB4Zno/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Learning.pdf", url: "https://drive.google.com/file/d/1WXl7dsFqPIGaqBdokzTTIUOp8Xlv0KnU/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Propositional Logic in Artificial Intelligence - Javatpoint.pdf", url: "https://drive.google.com/file/d/1YVYe5o0wbusm50bdMRt8oh_HCRO3tflC/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI - Jyoti Notes.pdf", url: "https://drive.google.com/file/d/1Z7ORxPllrwaSAtaGnZbrwQp5SJu5z4R3/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Resolution in First-order logic - Javatpoint.pdf", url: "https://drive.google.com/file/d/1dQVDsbJzwrBeA7yYKaYUvH2wmMDLVOPV/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "1._Search_1.pdf", url: "https://drive.google.com/file/d/1dg4MkFPmTZLd83T85U_Wo6dK7_F3YNDO/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "AI UNIT 4.pdf", url: "https://drive.google.com/file/d/1fMJ8opUOBq8xr-4CU6qgNnJYpyd_yW9S/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Reasoning in Artificial intelligence.pdf", url: "https://drive.google.com/file/d/1h-2YgJkf_ov5h1JI_nRozs4Sb-WnoNEA/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PAI ASSIGNMENT.pdf", url: "https://drive.google.com/file/d/1iSszkbLFlZXFBTWCRIoAZ7DowRsQLsVu/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "2_Logic_1.pdf", url: "https://drive.google.com/file/d/1jfposHlJ9fJVXdJHy2DkXXSBBZ6H3IT-/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "pai notes.pdf", url: "https://drive.google.com/file/d/1peamiL1veCIWUaJzO8_fbeBoz2vBk3IV/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Unification in First-order logic - Javatpoint.pdf", url: "https://drive.google.com/file/d/1vrAoXAnB9LFEC4flPn5otcR3ZW6qW-RZ/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Probability, Statistics and Linear Algebra": [
      { title: "PSLA.pdf", url: "https://drive.google.com/file/d/1iNP2RtkCfD9f4keLemx8slXHsE3D29RB/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "The formulas.pdf", url: "https://drive.google.com/file/d/1-U2OASV5kELPnl9Ip-vsVlQ5ci9_o3gU/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "probability_and_statistics_for_engineering_and_the_sciences (1).pdf", url: "https://drive.google.com/file/d/11As7dJxMDuonBqM3moaQCp13CwiYYchw/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA-lll.pdf", url: "https://drive.google.com/file/d/19fLkyY1GCLNOhbEWgSbAy58xrudrxCAY/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA previous year question paper [22,23].pdf", url: "https://drive.google.com/file/d/1EHe-mdIeCLr2Ae1KZjU5dJyQNXnWYD8F/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Maths Akash_s.pdf", url: "https://drive.google.com/file/d/1LD66sxyIoXUz_9gH7epWJoX7PkegHVfs/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA book.pdf", url: "https://drive.google.com/file/d/1PopDrwPfTu0NPPKCdTu-XO1OioOgtnxs/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA (by hari arora).pdf", url: "https://drive.google.com/file/d/1YO3bsGDE8vW2nCCufA7TEzXTGey7Y8eu/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA.pdf", url: "https://drive.google.com/file/d/1dJE-6NabkBDs3_fqXRTcI3aHcWw9XYND/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "maths previous year paper solution.pdf", url: "https://drive.google.com/file/d/1i1cs-ecrE65-0vGJHfiXLyvLs_s6UVFu/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "psla assignment.pdf", url: "https://drive.google.com/file/d/1tUxSMfe0ks3r-v2xEWjaj7B0YnrXBJTD/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Probability and Stats Amit Sir Notes.pdf", url: "https://drive.google.com/file/d/1v76kX2dF9i0IwUWE17erqy7VCFbPa1S3/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "PSLA-IV.pdf", url: "https://drive.google.com/file/d/1z-tuEvap6hjy_zFKBXXj0QEZGX_3X-L_/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Universal Human Values": [
      { title: "UHV BY KASAK.pdf", url: "https://drive.google.com/file/d/10mczo4rGA7SZszlwZSRq9ysOL9a6xnVL/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Handout 4-Harmony in the Society.pdf", url: "https://drive.google.com/file/d/12hAlwoUT39FySI-6WXjJZAqpXL_0fiov/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV UNIT 3.pdf", url: "https://drive.google.com/file/d/1Ait7M2pi9gPOHuUo5dZv85r0nRjnP0AE/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "202003271510186297kaumudi_Human_values.pdf", url: "https://drive.google.com/file/d/1G2MsYzGxeEGEsLg8yGmu-jfVUU7L-Xjf/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "6. Und Human Being - Prosperity _ Health.pdf", url: "https://drive.google.com/file/d/1GDlxFfAraiEC-kdz8k8xuFMnj9QCiioM/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Handout 3-Harmony in the Family.pdf", url: "https://drive.google.com/file/d/1H7iPA1eFrqS9hv60NBeTbwaS9sRNodfL/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "3. Holistic Devl _ Role of Education.pdf", url: "https://drive.google.com/file/d/1IM0M8lhzlZHdp128cPHM32kc6RjAHHW-/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV-Imp-Questions.pdf", url: "https://drive.google.com/file/d/1N3NFbjlrocvryLbfkPzJSWNoGV3wf7Nu/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Handout 2-Harmony in the Human Being (1).pdf", url: "https://drive.google.com/file/d/1NIwOyMv6KMX7qVlGouQr6ocCOQkLOZoT/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Unit - 1 Notes 1.pdf", url: "https://drive.google.com/file/d/1OITO-n1aGUtUOQPfJ0Bmezulb9fsNzjT/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "5. Und Human Being - Self.pdf", url: "https://drive.google.com/file/d/1OmbKvjHzzdb_qWucu-lB9jL-WhBFmP15/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Unit - 1 Notes 2.pdf", url: "https://drive.google.com/file/d/1Sk27vXRWfmr49MZ4NOd7SuSdTkCtLeIK/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "uhv.pdf", url: "https://drive.google.com/file/d/1YvlxQn0tLsEW_9V9NsUWGkwj6rX37HfQ/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "4. Und Human Being - Self _ Body.pdf", url: "https://drive.google.com/file/d/1_lPSPGNWPw_6W0Vu6Vmzp0eS_RV3u2Kv/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Handout 1-Introduction to Value Education (1).pdf", url: "https://drive.google.com/file/d/1bJFkl22qrl05saLvGzDvEHbqCN5QqpTY/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "Thinking, Fast and Slow (Daniel Kahneman) (z-lib.org).pdf", url: "https://drive.google.com/file/d/1dHiFPvMYRCYGd6GRCRaqVe413tsGqA5c/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "END time topics of UHV.pdf", url: "https://drive.google.com/file/d/1jXRLMia5Gy1bgGXWgc2-u3W4SbDhogCB/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "UHV Handout 5-Harmony in the Nature and Existence.pdf", url: "https://drive.google.com/file/d/1pr1fldnn_rZ1FpDUS-keJ-IViH9Jy2Eb/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Critical Reasoning, System Thinking": [
      { title: "critical-thinking.pdf", url: "https://drive.google.com/file/d/11hlpbg4i4CqCCa4qerYd6ZGHVoWlhTdj/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "crst u1 and 2.pdf", url: "https://drive.google.com/file/d/1JafNJq-KbaWGzO2amCMyO9ST93JXUBR1/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "crst_akash_pdf.pdf", url: "https://drive.google.com/file/d/1bHs6xyFqZWHz2wTxQKNFNqXpLmVz4qs1/view?usp=drivesdk", size: "2 MB", semester: "3" },
      { title: "End time notes of CRST.pdf", url: "https://drive.google.com/file/d/1hEZm484QJCqXsfphuLoP5nrnFQZdAqhH/view?usp=drivesdk", size: "2 MB", semester: "3" }
    ],
    "Computer Networks and Internet Protocols": [
      { title: "cnip mid term.pdf", url: "https://drive.google.com/file/d/10sjZx7mllQt3HcJYZFLw-xA8sCtLxfxM/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "transmission impairments (1).pdf", url: "https://drive.google.com/file/d/18m_C5gYaoaZfGExBTOYx2ITarUImQ5Aw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "cnip short notes.pdf", url: "https://drive.google.com/file/d/1B_ZwBca5BHi8nd-wI67zpjEe54uh--cf/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CS3591 CN UNIT 3 NOTES EduEngg.pdf", url: "https://drive.google.com/file/d/1GzkSi_jONMB-EXPeoz5_pEB66pZMQf9z/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "transmission media (1).pdf", url: "https://drive.google.com/file/d/1H-YrXclx_lOWuX0-sSu8bo-YAqfG678C/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "osi model (1).pdf", url: "https://drive.google.com/file/d/1IC_G-kNCBBUm6Lj_Cvu0ZyAz9c6PoxJl/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "networking fundamental (1).pdf", url: "https://drive.google.com/file/d/1nriHEZgSSGKCvKMIh9sRAzTOQ_Gd3ZB9/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Cnip notessss (1).pdf", url: "https://drive.google.com/file/d/1r9V8am2eZYZWgrsuf5YpC1Ev-pTdc8C6/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CS3591 CN UNIT 4 NOTES EduEngg.pdf", url: "https://drive.google.com/file/d/1xS4bh04_TG_TQWrvze5QqIvhd8WoEt7h/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN_unit_2 (3).pdf", url: "https://drive.google.com/file/d/10bhmy9kFZIDoFx3ebJTt9lnvjafdspop/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CS3591 CN UNIT 2 NOTES EduEngg.pdf", url: "https://drive.google.com/file/d/10fEO-ul9mFEVqMoeWpMf85gbSF3xppWg/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP- UNIT2 (1).pdf", url: "https://drive.google.com/file/d/13bG4grnqFxrr4BzNdEtlk97gJ9Vn7IyE/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP NOTES GC (1).pdf", url: "https://drive.google.com/file/d/18OuzgGO6NHSpbPm-FxNO07fC_Otrwy4K/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN Unit 4 (1).pdf", url: "https://drive.google.com/file/d/1BeEIJTAX1qh6rDtaiGwC34XjYxL0drYD/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP PYQ.pdf", url: "https://drive.google.com/file/d/1E6h7o3-ZiUtorqA5EmdnaS2QJCtCsyi-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN Unit 4 (1) (1) (1).pdf", url: "https://drive.google.com/file/d/1H33EShww3YGQ241Wy1re2wg1bibxvOSj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN-computer networks akash (1).pdf", url: "https://drive.google.com/file/d/1IIKz4PEokWPjf1q6xfRnsJvk8IXrhWRe/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN_Unit_3 (3).pdf", url: "https://drive.google.com/file/d/1NnOrMKAMJE9mjmk4NeBTgedKbtZOz8kV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN Unit 4 (1) (2).pdf", url: "https://drive.google.com/file/d/1PaHtHTT7Vd3-m2id38Ub9mKlDtF4hi4T/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN_Unit_3 (2).pdf", url: "https://drive.google.com/file/d/1RtS8NyPu8tJYYgu88dt9MW-1mKRuDdO6/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CS3591 CN UNIT 1 NOTES EduEngg.pdf", url: "https://drive.google.com/file/d/1SS6sS7Ovps5CkCxSNcmhUJ6wukTH0v_s/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP UNIT 4.pdf", url: "https://drive.google.com/file/d/1bXuUZ68TuEaa1h9NsXBJ-QJoHqz8zng-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN_unit_2 (2).pdf", url: "https://drive.google.com/file/d/1dYTVGr1yQWJoLGDtNxwJmbPbeTXe1a39/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP Notes 8.05.24.pdf", url: "https://drive.google.com/file/d/1fFByTpBtyCgxUrw1ZeIP7pna3Xu6hzB3/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP NOTES (1).pdf", url: "https://drive.google.com/file/d/1g2wk3ddhmzkRV6dVbbFFbYviismn4JJe/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Akash CNIP.pdf", url: "https://drive.google.com/file/d/1g7ulYqBRzTY9TPJ_pro83ztrJ1fCaFtb/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN &IP Unit 1 (1).pdf", url: "https://drive.google.com/file/d/1hzvd3GK0DHlK_H_-rEp4khdhfp2kEwI-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN unit 1 vips (2).pdf", url: "https://drive.google.com/file/d/1iiZk9utMoLI7H9BPpwibU-51lGnrgG6E/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP_KASAK.pdf", url: "https://drive.google.com/file/d/1mfPghchceBt-Jofm7Z3JTMdXT6K0m7s3/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN&IP ASSIGNMENT.pdf", url: "https://drive.google.com/file/d/1n2M1Y0CYoNGSK6fqJiu-zf2EUqigUWm_/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN&IP.pdf", url: "https://drive.google.com/file/d/1pL5Qn7hilkhV9IxWu858K9gJIuErZDyX/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CNIP unit 2 (1).pdf", url: "https://drive.google.com/file/d/1vuUl7UsjpwosoR94atQw-mHI4b82ezsk/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN_Unit_3 (1) (1).pdf", url: "https://drive.google.com/file/d/1wudF9j10shBwCaUm-Aj_TaNKtde0uejc/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CN unit 1 vips (3).pdf", url: "https://drive.google.com/file/d/1yH74r_7RE6ZhqyhhaDQGJZmdsraT1-NO/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Database Management System": [
      { title: "DBMS Unit -2, jassie.pdf", url: "https://drive.google.com/file/d/10YAVsHv4_6dIgq8w7ZwIFHXj3Hsx1pb_/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "relation algebra ke lie. (1).pdf", url: "https://drive.google.com/file/d/126FJqDH0_Q-xB0pHKcDu2CG4eWPiQZhn/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "2.1_SQL_DataTypes (1).pdf", url: "https://drive.google.com/file/d/171CJI1tFlmvZYb8PoOn8kFHOG_1RHxW6/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "NOTES UNIT 1 2 3 (1).pdf", url: "https://drive.google.com/file/d/173sIHEUp1_5GdPxagQTIOjmcjzoE2IDR/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "plsql (1).pdf", url: "https://drive.google.com/file/d/1AJZBZoSi2MEeqNksl_IhP0NNZcEdijZ3/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT -4 DBMS.pdf", url: "https://drive.google.com/file/d/1B3cRYwxdNFbKKixW7pvpGbMMcIK2PqZB/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "database hi hai sb (1).pdf", url: "https://drive.google.com/file/d/1F8L8mX88w4q7Z10kD3cr05dCPqE-j5mj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 3_Part 1_FD and Normalization.pdf", url: "https://drive.google.com/file/d/1FZckamiPGBj1yfnR9e0dxCJfusP666d0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Unit-4.pdf", url: "https://drive.google.com/file/d/1GNLsbLYe_LaDKLQn7GgBYNnPFHHkuXsQ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Sql .pdf", url: "https://drive.google.com/file/d/1HFmrpEmfHnPLYLoi0lz4rFaJ-RjANTw7/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Assignment I.pdf", url: "https://drive.google.com/file/d/1HphsrLrVBSc1UbbZ7HDwp7QvSZo9nO_Q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 1.pdf", url: "https://drive.google.com/file/d/1I5MIlNNJob4vUxvy_XaVTicCPCeu-yDg/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "short notes DBMS.pdf", url: "https://drive.google.com/file/d/1Je09Y1g69jKjPf9WBPR5do5sMLxygiOt/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "20-NoSQLMongoDB.pdf", url: "https://drive.google.com/file/d/1MMfIAI8mrPVjat6jmsm4G44yFBHdRfse/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS_CLASS NOTES.pdf", url: "https://drive.google.com/file/d/1NYSODRVt3JzMQzD0af7W7WCdQl8fUCZ4/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS ASSIGNMENT 1 KASAK (1).pdf", url: "https://drive.google.com/file/d/1Npe2RQvvMPMhM_agHoOoAgU1rGx-zIcH/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 4 CAP MONGODB.pdf", url: "https://drive.google.com/file/d/1OPEWworgzBTlQ2Z-G9VmuZxslvE4TX4q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit 2_Notes (1).pdf", url: "https://drive.google.com/file/d/1QbYB7dGI4Oc6XUKG-KeKYgHhRDNH1t7X/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Question Bank (1).pdf", url: "https://drive.google.com/file/d/1Qc2bOd27ZmMqZ3HuhDSWShfMApET86Dq/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 2.pdf", url: "https://drive.google.com/file/d/1QfqoabHXf_HhhMpdDWcUyt1xhGZO5Jkj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "QUESTION BANK (1).pdf", url: "https://drive.google.com/file/d/1QiZFLoIXydCMBFvw6iOQG_YgI-fGYh_K/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS sem 4.pdf", url: "https://drive.google.com/file/d/1S1enw5bTLCQaaUYUR-J-863hcLCr7msh/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Unit 3, jassie.pdf", url: "https://drive.google.com/file/d/1SjZjVck8FKMCWtcXQJXLXY5T4ETb20fV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS TUTORIAL.pdf", url: "https://drive.google.com/file/d/1U3GhLYRkUC9XsgXtRy0ATYguxgrP3j9W/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Dbms-notes-part-2.pdf", url: "https://drive.google.com/file/d/1VdomNnsLbSHJfUIGOJyyGkHBufHe7IIJ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "nice notes (1).pdf", url: "https://drive.google.com/file/d/1Vj0QomuJCA_yBZU2fyJL8VmGW96VFiVQ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Unit 4, jassie.pdf", url: "https://drive.google.com/file/d/1WDtI_84WgeQ8ySqH-tgKpS9oKIW3ZpWZ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "2.2_SQL_Command (1).pdf", url: "https://drive.google.com/file/d/1XkS_IQPxGa-J0-sck_OiphUCDKaud_vd/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "tt1 dbms  (1).pdf", url: "https://drive.google.com/file/d/1Y2mQcD8HAyzlPGBMXjgvq37LCGmNw8ZQ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS END SEM QUESTIONS.pdf", url: "https://drive.google.com/file/d/1ZbpAzn01qMrZj7zKGJ1gUTgwm8EhfT6a/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS UNIT 1 PPT (1).pdf", url: "https://drive.google.com/file/d/1bNmGiDRv5vA5qNZbv1h7hk0GT5VMhqJl/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS_KASAK.pdf", url: "https://drive.google.com/file/d/1g0m60wJpZPWXO4CoWrZ6nCdF5gwSCYjW/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "dbms 3rd unit.pdf", url: "https://drive.google.com/file/d/1g4dGzw24w552CnWC-RG5ZZ4pNtFREGDS/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 2_DBMS Notes for Students (1).pdf", url: "https://drive.google.com/file/d/1hvRUYGK9QgazKjwNQb3wGnzglAYrA9ur/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS unit 1, jassie.pdf", url: "https://drive.google.com/file/d/1k8_ZqPduHM47Ar9Qplg3FphPhiULSc2B/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS (1).pdf", url: "https://drive.google.com/file/d/1l-EGtbTh6iBDjxlcG1SedjHwRIf9sTIH/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS PYQ.pdf", url: "https://drive.google.com/file/d/1llXJfsmb9fk8oINFkJa9V9MI_mNT690o/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 1_DBMS Notes for Students (1).pdf", url: "https://drive.google.com/file/d/1mmtytboRlfs9f04u0fdP8gnNhtUfVcN1/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS UNIT 1, 2.pdf", url: "https://drive.google.com/file/d/1n3_FkVWnZ48Lz3jy8JteghN3t4r6uUFT/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SQL (1).pdf", url: "https://drive.google.com/file/d/1nEHONCg-2mW1ZJo-gcLr8KgKB9rgvjY3/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS NOTES UNIT 1 (1).pdf", url: "https://drive.google.com/file/d/1olIuld7xbgb1Ug3utS3u3mCHhawNaFgR/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 1- DBMS (1).pdf", url: "https://drive.google.com/file/d/1pcp61te_w1bD1oPKyidhhb18ymMR9IqH/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 3_Part 2_Transaction management.pdf", url: "https://drive.google.com/file/d/1s0p753fb0YpsnS2PC5oq3SxDEBzDmvA_/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS unit-3.pdf", url: "https://drive.google.com/file/d/1tPUs02Fd7ecyeJJmCpt8k9-4XYyJe44r/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 2_Procedural Sql (1).pdf", url: "https://drive.google.com/file/d/1wK5_vs0m95qASvQhxj9X3iaYvPv2XbEA/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Dbms-notes-part-1 (1).pdf", url: "https://drive.google.com/file/d/1wtAItHDMdHMIKPqxP6CwvN0eXLHbVc4Q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit_1 (1).pdf", url: "https://drive.google.com/file/d/1x1aRBJqT2y5NzjYZ6GHkayOKcw-1qAqG/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "DBMS Akash (1).pdf", url: "https://drive.google.com/file/d/1ytPLzi3GTNAmNQa6hsCBzBq4lLyRP-UI/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Software Engineering": [
      { title: "SE assignment 2.pdf", url: "https://drive.google.com/file/d/12nN-5EqhNHPhmQtWpX3hhim3S-Eqz9Tj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "se layers (1).pdf", url: "https://drive.google.com/file/d/13wkOuYULUZLJRDSvpf0PeIT_r_ZmlgMe/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SOFTWARE ENGG. UNIT 1 (1).pdf", url: "https://drive.google.com/file/d/13xzj4w366yzAq0ufpuImy3mPz1PpUBFw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE_KASAK.pdf", url: "https://drive.google.com/file/d/15puNsBs6TotJAW38C6nFUGPOMIGwR9v-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Chapter_3_Software_Requirements[1].pdf", url: "https://drive.google.com/file/d/16dr1Ux5bk-iKdzcSz7WLlR4Y0q7kWEcw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "lecture1428551142 (1).pdf", url: "https://drive.google.com/file/d/16sXvemsxYbMXKHWj56fz7hRS4QVqfcn-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Chapter_1_Introduction[1].pdf", url: "https://drive.google.com/file/d/1Ae_pkHEqPV0UZ-CSxkzNqnEHzbUetjaU/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SOFTWARE ENGG. UNIT 1.pdf", url: "https://drive.google.com/file/d/1E0yjSBDYOo8EzgJSXLVFavX8xiK0zoJ_/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE.pdf", url: "https://drive.google.com/file/d/1KCZBOv01lyjWIjotNRmXGpKa5FzWH3_Q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Software eng..pdf", url: "https://drive.google.com/file/d/1LN0bzB7ZDUBf7_qnsnAYj6ddamb_ko99/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit2 requirements engg.pdf", url: "https://drive.google.com/file/d/1O_HnPEZ8DfnIfLnuWRUgnNBYtukxrPm1/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Chapter_2_Software_Development_Life_Cycle_Models[1].pdf", url: "https://drive.google.com/file/d/1RJcxPXI39nzGk04BAq3i3XHM5KIov3_P/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE unit1.pdf", url: "https://drive.google.com/file/d/1SNe6xfBXlD2aohpiOpo0vBHG5WLfWnOf/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit1 part2.pdf", url: "https://drive.google.com/file/d/1Tzjyd2JO9JdKKFN3-A2FaLrGTBIaJ19o/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE Unit 3.pdf.pdf", url: "https://drive.google.com/file/d/1XSGUU9TmK3OSxOlyIwxv0ZwDYfQBB74k/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE SHORT NOTES.pdf", url: "https://drive.google.com/file/d/1YgBIa1GmZdEdV2KCBuMahGU363bXKOtq/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE Full.pdf", url: "https://drive.google.com/file/d/1aC07tUo2D8gQkf2OkrOhF9eb9nmEHWVS/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Chapter_4_Software_Project_planning[1].pdf", url: "https://drive.google.com/file/d/1drhXgOOn3p9lv6gKJdo0gkJkQuzvXC8f/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "book ke notes by kasak.pdf", url: "https://drive.google.com/file/d/1fVO-G5x82dy2cRbaZ_Qu7LdNGfh6m1tp/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 1, 2 (1).pdf", url: "https://drive.google.com/file/d/1hlNcyrx7oJ7qIUg_HKbEKfqGO7qV0nnU/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE unit1 (1).pdf", url: "https://drive.google.com/file/d/1iFyD1-a9fqJ0TaAB_p9XpZ4TQ0OF3OFw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE TUT 2 .pdf", url: "https://drive.google.com/file/d/1kHX3tfgZneU-F5krNqynFT83zZn4QacB/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE Notes (1).pdf", url: "https://drive.google.com/file/d/1m_pAQjZ-wx0QEpLWtCuwpdl4LO0U-QF6/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "akash SE.pdf", url: "https://drive.google.com/file/d/1py_GYSKPjSgdLvTnmjZayjQ_teUzpnR0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "se layers.pdf", url: "https://drive.google.com/file/d/1srxXI3lAnXZu3PSDsPAbSke8d13Zm-st/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Software-testing.pdf", url: "https://drive.google.com/file/d/1uQjHu6QNbDmkhNxPycOeYGwfSJ8qPo5Q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "SE PYQ.pdf", url: "https://drive.google.com/file/d/1uRFGvneFwaftFES880Gv8N3bOxpLO3ds/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Computational Mathematics": [
      { title: "CM ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/12qOEvVH2EjL_a5ezag6JWVA7hsL56hSm/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CM_KASAK.pdf", url: "https://drive.google.com/file/d/1SYCUBFlmfR_IkHWLWeMoGr0cyZnQRogn/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "cm akkash 2023.pdf", url: "https://drive.google.com/file/d/1YcUwr1glgAl5Vvv3bqo-zwul_vIRFK3_/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CM PYQ.pdf", url: "https://drive.google.com/file/d/1jZAOvBmTSfyuXlc2-kKjtZE9COBXVbmw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CM - Complete detailed notes.pdf", url: "https://drive.google.com/file/d/1jcriL3qC_8Qhh5aJQSTUP8f3b4FierQ2/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CM EASY by Kasak.pdf", url: "https://drive.google.com/file/d/1xCZzlseXdNFy9bzpnJHhBS1rWsyjc9-Z/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Machine Learning": [
      { title: "UNIT 2Notes.pdf", url: "https://drive.google.com/file/d/115nYBaGjaDRxJgnwXODOFPywDsVMcghK/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "foml assignment 3.pdf", url: "https://drive.google.com/file/d/14KNZKrJeaJ1RzRsP4-8yHyxGq_7EEyd0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "MACHINE LEARNING.pdf", url: "https://drive.google.com/file/d/18JePQPaMcKJb5ZCUiNhcR7sI6H4sipBi/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "2019BurkovTheHundred-pageMachineLearning.pdf", url: "https://drive.google.com/file/d/18uValNEMT8RRLqiPaexsTgr8dDqx6hff/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 1 Notes_FML.pdf", url: "https://drive.google.com/file/d/1CChktFAqM4kr5AfI99S8L4h5AuQJLkHk/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FOML UNIT 3.pdf", url: "https://drive.google.com/file/d/1GbYxsAArW8Uo5LFIPz6-t-knrrrTixHW/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit 1 Notes_FML.pdf", url: "https://drive.google.com/file/d/1HvvpC0fnBSaB8xbivCg5UyoxX3wxFRTg/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CS229_Lecture_Notes.pdf", url: "https://drive.google.com/file/d/1Ix5iS_hsZOIbvHIh2HLvr1bhTEjPBmzs/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML Mid Term Exam 2023.pdf", url: "https://drive.google.com/file/d/1JWioIMtnrE5JBaLB8v2CnZmjOj8lV8DN/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "MACHINE LEARNING(Notes).pdf", url: "https://drive.google.com/file/d/1Je8H7r3Nvacot_Vg7g8bwNSyejGnsPqq/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML Unit 1 Notes.pdf", url: "https://drive.google.com/file/d/1KaVY0lSiz8Fd6Mg_UdaTKjgR0NicFkIl/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML Unit 1 Notes.pdf", url: "https://drive.google.com/file/d/1MP3S7fhQHU29kSg2U6zR4L1AvS8oDnFx/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML Full.pdf", url: "https://drive.google.com/file/d/1QYQcDYlH0An46gid5LFFjRp-yrx2uy4r/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FOML ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/1UagJoyzXqyi8xZQYL3iyxXqmteaTKZiG/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "MACHINE LEARNING(R20A0525).pdf", url: "https://drive.google.com/file/d/1UzSxAmNYcX9QCuwQzxPOoc1B7fbtR21b/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Aurelien-Geron-Hands-On-Machine-Learning-with-Scikit-Learn-Keras-and-Tensorflow_-Concepts-Tools-and-Techniques-to-Build-Intelligent-Systems-OReilly-Media-2019 (1).pdf", url: "https://drive.google.com/file/d/1VQh_osbF6c8FIqiJ_Cq9DaUn4whSCUCt/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML PYQ 2023.pdf", url: "https://drive.google.com/file/d/1WFeB8MgHCKSYDzmPl-vnlcqmy4iENv28/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "MACHINE LEARNING(Notes).pdf", url: "https://drive.google.com/file/d/1YqNsOuAdaMiNdo8eThyus4C7WCeHXiBg/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FOML PYQ.pdf", url: "https://drive.google.com/file/d/1_Tf-r4xYSQOY-XcRf2L49ZJz2uYnoKA0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ML NK Handbook.pdf", url: "https://drive.google.com/file/d/1dQOfiu2eamcRgoTaYmm_HeLiBQYg2yRZ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML_Unit_1&2.pdf", url: "https://drive.google.com/file/d/1egI9SUNAnRePOy7ohRSNI8E5bF6etZmf/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "lecturenotes.pdf", url: "https://drive.google.com/file/d/1fSHDcwzDQXlVXcHk61u0P7w3v3TF9NUy/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 2Notes.pdf", url: "https://drive.google.com/file/d/1g4eRQB22F6icpqFkjIwMZFzYwVAIn_r1/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "foml assignment 4.pdf", url: "https://drive.google.com/file/d/1iYkMuv8UcxdIEQWWwAgRoPFXkLbYAamr/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "machine ko learn nhi Kara rhe khud ko learn Kara rhe hai.pdf", url: "https://drive.google.com/file/d/1jwxGhawYGgkqDLq2Rac0HNlFzt9hH40A/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML_AKASH.pdf", url: "https://drive.google.com/file/d/1kj5WuwOunmF3Hd85xshm9mqKPuBgOaiQ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ML akash.pdf", url: "https://drive.google.com/file/d/1nUybJ3NnxI2Z3-zWTkXL4PVKlAJUzTsG/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FML Full.pdf", url: "https://drive.google.com/file/d/1pwxtWjGqifb20nO-a0SEsqIpDarb07SV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "machine ko nhi khud ko learn Kara rhe hai.pdf", url: "https://drive.google.com/file/d/1uCVE0nH8ygtl4LiSJA8TT7MXNErSO5g4/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ques 2.pdf", url: "https://drive.google.com/file/d/1uss8yoPY7Rlbg0y3a-JEUS7aaa3-AG-0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "FOML_KASAK.pdf", url: "https://drive.google.com/file/d/1uwu19dG6xGoCKTcBJJ_5zRL4XDdNo3nj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT-1 FML notes.pdf", url: "https://drive.google.com/file/d/1wtX3l4dKqZ8nL4_MwcixAbYUeJAxT-zs/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Object Oriented Programming in Java": [
      { title: "VIPS OOPS Unit 3 AWT COMPONENTS-Event-Anonymous class- Layout manager.pdf", url: "https://drive.google.com/file/d/13DD-OCjGcgpitRbGQw6QIChGqrLcN722/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "JAVA End Term (1).pdf", url: "https://drive.google.com/file/d/13tLCZnv45OZ3TWa5ZVYoXRkQ_prC3G7O/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "thode boht notes oops (1).pdf", url: "https://drive.google.com/file/d/16NKisnMgLbQ3wz9rgURjoePzsr-20aTy/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS Unit 1 ,2 Inheritance types Interface Abstaction (1).pdf", url: "https://drive.google.com/file/d/16uc8-sUNe8dkXWuQkixT8R97bYipnNEg/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS TUTORIAL.pdf", url: "https://drive.google.com/file/d/18CeS4Ztv_NUlcVWrpO4gZCtAir2_xDnD/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "javacollections.pdf", url: "https://drive.google.com/file/d/1BYtG2i7pX0VSasArBmB4HyZtcXVgyxyD/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Java All Unit (3).pdf", url: "https://drive.google.com/file/d/1BteVmPXQp08ZG4Wn_ougZt3na9FgysaY/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS Unit 3 AWT COMPONENTS-Event-Anonymous class- Layout manager (1).pdf", url: "https://drive.google.com/file/d/1CcwhdwEaqsPoJ2Iu36-vj_AkOTsI1qv2/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "tut 3 oops (1).pdf", url: "https://drive.google.com/file/d/1Jd09QRB5PXBY7En0OJagZ7BRa0fniozK/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Oops Notes (1).pdf", url: "https://drive.google.com/file/d/1Kijs0Iwm0FLaSnGudrlAyM9Q0SNE1VSC/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOP-NOTES-final (1).pdf", url: "https://drive.google.com/file/d/1Kt6VNjMs-vin_MN4Ds95alikxen_8uhN/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPs concepts in java  (1).pdf", url: "https://drive.google.com/file/d/1L9kav7IUzUd0OqLYWHYqGZFSqzYnSnp-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS bs chl rhi h 👀 (1).pdf", url: "https://drive.google.com/file/d/1M0C5z6Zs86iFewgI8AC_NmzoSnfg6YZM/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "INTRODUCTION TO JAVA PROGRAMMING (1).pdf", url: "https://drive.google.com/file/d/1My1a_uZSirOqvsPK1sy4sVcw5pUt5fVS/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit4_FileHandling (1) (1).pdf", url: "https://drive.google.com/file/d/1NgQIkkHjfb9dIjtD1BZsiHM-u49aKhV0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Java All Unit (2).pdf", url: "https://drive.google.com/file/d/1Q0RVKL-XPES7p47XmFV2DYjN8Z_yAb5B/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "jdbc-thoery.pdf", url: "https://drive.google.com/file/d/1Q2spF-FbkerdOP2EHyWWBk4Xvp480XLk/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS Unit 3 Multithreading.pdf", url: "https://drive.google.com/file/d/1RavgFsAxcnODAW0WPpVbD4tPZOgLdpL1/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS  Unit 3 Applet.pdf", url: "https://drive.google.com/file/d/1SAxV1o3sjL0R18DiSz6KWJ4P9e5TG10E/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "KASAK ASSIGNMENT 1 OOPS (1).pdf", url: "https://drive.google.com/file/d/1TKFzhd_XRNg42ALWrT3-PIM8EL8Yq4ai/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS_KASAK.pdf", url: "https://drive.google.com/file/d/1Umd00eGjUlkqrViBLDWn3QIIfqKPgkxL/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS Unit 2 Arrays (1).pdf", url: "https://drive.google.com/file/d/1VeKib4cQNn3LkbEvo_lAq48V1v_TujFA/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS Unit 2 Anonymous Inner class (1).pdf", url: "https://drive.google.com/file/d/1WWRHf2bAu-So0x8HEkJR5It5KrVh23va/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "04 The Java Collections Framework.pdf", url: "https://drive.google.com/file/d/1Wm5pUpAE1vxuroDY6iuO0GyqUQaQkkPw/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Java tt2 (1).pdf", url: "https://drive.google.com/file/d/1XamndxScnmxcNaBRm5LCH7_-Rqz7DQQK/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "PYQ question unit 1,2 oops (1).pdf", url: "https://drive.google.com/file/d/1Zi4d7OGoVwWTYBCRmOFsibVoHCNYW0lP/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "JAVA Akash (1).pdf", url: "https://drive.google.com/file/d/1Zrlg9bxEIK20wvEcGZJ0WQnf7AODBwOT/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "UNIT 4 OOPS TT.pdf", url: "https://drive.google.com/file/d/1Zs74Y9qEX3nCrh7rPXuvq6DUy_EBPrdZ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Java Handwritten Complete (1).pdf", url: "https://drive.google.com/file/d/1b4ur7m562t0Y-th6-zV6PEltUDM8HZkq/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "oops notes compiling.pdf", url: "https://drive.google.com/file/d/1dJ5hMTnNffyx1U35OQz9380FfBpNUTpW/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Unit4_FileHandling (1).pdf", url: "https://drive.google.com/file/d/1dSQSuPHtFOX8K45KreqgKNnVZIae3i35/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "lecturenote_1789627304Chapter-1 AWT and SWING.pdf", url: "https://drive.google.com/file/d/1e4q_2-e0wpPwqcEYCTkszWN6JH-Zb9n8/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS UNIT 1 PPT (1).pdf", url: "https://drive.google.com/file/d/1eQeOKomgTEp6vPvYeHwboulq7IphlFBB/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ASSISNMENT 1 OOP (1).pdf", url: "https://drive.google.com/file/d/1f8QoTBrAx2ZXj3coKNCadQS3o9iwZEhf/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit 4 jdbc odbc.pdf", url: "https://drive.google.com/file/d/1ft0OuE46mAutsmDRokG7sASPGXwDQQcV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS UNIT 3,4.pdf", url: "https://drive.google.com/file/d/1gGUapLDqIUaKxKjIRT5SGCKuEdx4z5PE/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS PYQ.pdf", url: "https://drive.google.com/file/d/1hJCnmNYBXf60Pv8X-vi_yrBADTRivLQ1/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS KASAK NOTES.pdf", url: "https://drive.google.com/file/d/1kagdyaGwfJW3CTsRV8GHfWQCOspknNKC/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "nice notes (1).pdf", url: "https://drive.google.com/file/d/1n6vyuTLM4MeagbgIk2EfSxvGDOQgCdJx/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS Unit 2 Exception handling (1).pdf", url: "https://drive.google.com/file/d/1ngVD8AmYewqddzmS4bubPNWPohNyzNR0/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "tt1 anwers  (1).pdf", url: "https://drive.google.com/file/d/1oUNeWo6Qwu84N0NXHQgEWI8qk9jo4mRs/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS Unit 3 Event handling and Listeners .pptx.pdf", url: "https://drive.google.com/file/d/1q71FP6Ly6E1kZN4vKl7B_P6fse174qy-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OOPS UNIT 1,2.pdf", url: "https://drive.google.com/file/d/1qcu3KAyTdhUNnuUEuY0tVW55Xtva9hRZ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Assignment-3 to 5 java jan 2024.pdf", url: "https://drive.google.com/file/d/1rxXJMUKqXMRuHJPtEU3ErMBmTuTwuXKp/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "tut 4 oops (1).pdf", url: "https://drive.google.com/file/d/1sZTvU5iRQkFmIBfASnqO-TEBce1MQqUP/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "oops tut 3.pdf", url: "https://drive.google.com/file/d/1tcQM23Jbi1b1GTM_f8Kqhzb4MGsnxbrC/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS Unit 3 Multithreading (1).pdf", url: "https://drive.google.com/file/d/1uRWPzSUCcngvP480AVhPw50ewRfZ8Ri9/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS Unit 3 Event handling and Listeners .pptx (1).pdf", url: "https://drive.google.com/file/d/1uRkXunw52ciDxaG6WqW_k5URZVVKpDW5/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Object Oriented Programming through JAVA (1).pdf", url: "https://drive.google.com/file/d/1vGmkSH0TXWyjIVG7z9xQ4_lRCbONdkx9/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "VIPS OOPS  Unit 3 Applet (1).pdf", url: "https://drive.google.com/file/d/1z274Hw8gjiUdLfn6cktla3VYuBUv6eoC/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Computer Architecture and Organization": [
      { title: "CAO-Unit-I-part-3 (1).pdf", url: "https://drive.google.com/file/d/11stnttIaj2w5DrKNBEUPEcDWNCx-r8b-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA UNIT.pdf", url: "https://drive.google.com/file/d/12L8U5GsAEKxQMj_7PhQwga66ItB1-Zdb/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "6CS4_CAO_Unit-1 (1).pdf", url: "https://drive.google.com/file/d/146RzZTrHsAqtjLL5YFJanD8InD5udoJ3/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO unit 1,2 handwritten.pdf", url: "https://drive.google.com/file/d/15R18OnKUIAQvdbNwQFZdprhBpDE8vs4M/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit 4 badhia notes.pdf", url: "https://drive.google.com/file/d/18gWBjh-FeXI0nqC4RDlOdIPwc4eVArAn/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/1AiyS1I3lyZWqqbtcQtcmYT8axl7cLjzN/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO unit 1,2 (1).pdf", url: "https://drive.google.com/file/d/1Bdsj1g0t8Tr29rj67I7YXgO_tia0bebq/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA END TIME .pdf", url: "https://drive.google.com/file/d/1Bgu170pmPYQw4pQ30-u-ApGb5SEfurYs/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "U2Ch1[1] (1).pdf", url: "https://drive.google.com/file/d/1CasY7RY4h57jH-KybpWYWJWWXxVxGsdH/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "coa ch 5 part 1.pdf", url: "https://drive.google.com/file/d/1DiL0UAVOI_nCt-odzlURK5myVaO2yzdj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO lecture 2 (1).pdf", url: "https://drive.google.com/file/d/1E4VQek1w4jPHzNAGRi2N09-lpgs8Lpgy/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit2 ache notes (1).pdf", url: "https://drive.google.com/file/d/1GM8tUehOYDsXMHOypAD66NX2_LhuAh7F/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA 1-4 (1).pdf", url: "https://drive.google.com/file/d/1Hyif5cyJbTAi3P0sS9S8CzR6_ViRH-4h/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "U1Ch1[1] (1).pdf", url: "https://drive.google.com/file/d/1Ktk-APG2-Zm_ShdC3N3_cwbel0SB4mdz/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "5241_PROGRAM AND NETWORK PROPERTIES - COMPUTER ARCHITECTURE.pdf", url: "https://drive.google.com/file/d/1NoMYFGgi7vXym3TYazgbK9OzzRG5fviv/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "OS ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/1NwZHU6xl8KMNAw_HP-smTjby5mZqKdDI/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO.pdf", url: "https://drive.google.com/file/d/1OQyN2VLXENA03w7VJpXlW9Hv36ECVEmV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA unit 3.pdf", url: "https://drive.google.com/file/d/1PKxbJjNfmiWTttY4wQHGBzHHd7BKMwnL/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ch4 unit 2 coa.pdf", url: "https://drive.google.com/file/d/1Q3g8qymXDc64ZK00wcqoHoJp6VoBKrGH/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA-UNIT-1_vaishali (1).pdf", url: "https://drive.google.com/file/d/1QSrRz3nUldSrfOa2VSkSiA-xqJ7h27yk/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Parallel Computing and Pipeline vaishali.pdf", url: "https://drive.google.com/file/d/1QXkYqISDVgGYxhdFnIfpce7HTvxdoiHJ/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ch1 coa unit 1 part2.pdf", url: "https://drive.google.com/file/d/1R6H5TU8YKL8DUR6QxjVYWiiwKFOYvVJj/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "coa notes.pdf", url: "https://drive.google.com/file/d/1RJmOo2_izgeqqiWELR-ZOeGakuXbK99a/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "coa ch2 unit2.pdf", url: "https://drive.google.com/file/d/1RXVIk-j68K819mlg9T2xNY-_SxZUcMIK/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ch1 unit 2 coa part2.pdf", url: "https://drive.google.com/file/d/1Szc5vT8GRUCzP_OR_5JWRwkuy05H6rj8/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "U2Ch2[1] (1).pdf", url: "https://drive.google.com/file/d/1T7drfmg5SFDdtb9dgwM44b0jtkh96rek/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit4 ache notes (1).pdf", url: "https://drive.google.com/file/d/1VU-we_1VjKdk10bbvnbUCpdm7qHXHmKV/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Addressing modes unit-2 (1).pdf", url: "https://drive.google.com/file/d/1ZgEU9mbsD2LtcCykqrnGBbSLDAdA21Tc/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit 4 part 2.pdf", url: "https://drive.google.com/file/d/1dollLskqh7mCDDnaawgm2wtWYRSn6Iif/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA UNIT-2 (1).pdf", url: "https://drive.google.com/file/d/1e6oikguaFDK3y3dzPV6om65nz2VMg5F7/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CSA_module_1.pdf", url: "https://drive.google.com/file/d/1g7HSWgIyhmt5ec9pYeL-2JYYWFJI9ft-/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "coa ch1 unit 1.pdf", url: "https://drive.google.com/file/d/1h_fsyN53ZH6w5UfcLlOfXbrNope2NJEr/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA_notes.pdf", url: "https://drive.google.com/file/d/1iNv012TaeR4t73JBC6RNxT_qMs5lDklS/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "CAO PYQ (1).pdf", url: "https://drive.google.com/file/d/1oAifuELEv7BAvO4q3aJxEc8KDuQ5p933/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit5 (1).pdf", url: "https://drive.google.com/file/d/1rX98hFnU6TXnMGWCXWbUm-ta8fH50rxn/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit3 ache notes (1).pdf", url: "https://drive.google.com/file/d/1shBU6omtknNiqfklJqztDY3_VOfDyq0Q/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "computer-systems-Architecture.pdf", url: "https://drive.google.com/file/d/1syGDbcQq4aQc7cCvN7I_37hcA8scycpb/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "U1Ch2[1] (1).pdf", url: "https://drive.google.com/file/d/1tnMatXZLzeacnYl305a-7gCTwZ37Crga/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "unit 3.pdf", url: "https://drive.google.com/file/d/1veErMqwks29eCR5DUNTu2Hw2Mxl39_x4/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "COA AKASH.pdf", url: "https://drive.google.com/file/d/1wPWDXysFHOWGEDVeIU-zHt0V4mC4NKzt/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "ComArc (1).pdf", url: "https://drive.google.com/file/d/1xwI7AMMheo-RyGTy5WZXVfGzA1lqm0ny/view?usp=drivesdk", size: "2 MB", semester: "4" },
      { title: "Cache memory COA Vaishali.pdf", url: "https://drive.google.com/file/d/1yEhhm6cbaS2oJPi6XGKVeCkZ93CcVyOa/view?usp=drivesdk", size: "2 MB", semester: "4" }
    ],
    "Principles of Entrepreneurship Mindset": [
      { title: "PEM Akash 5th Sem.pdf", url: "https://drive.google.com/file/d/1-kTXMd93hWWYONrtskLFuqqqMOoF2a4T/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit 4 Creating and writing a Business Plan.pdf", url: "https://drive.google.com/file/d/19hRQLgAx2evVd14StLcTIvSvioTJ0Apd/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM CASE STUDIES.pdf", url: "https://drive.google.com/file/d/1CiB81fqP8NR-qnKMSYEB6lXeRO0Znc6-/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM UNIT-3.pdf", url: "https://drive.google.com/file/d/1MhFnn9P9ndob46ioaCdzId4vDFJ7N7tz/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit 2 Business Model Canvas.pdf", url: "https://drive.google.com/file/d/1ONt_7D8229kxIAoOMQa5ALnk-PkUejs5/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM notes and pyq at last (1).pdf", url: "https://drive.google.com/file/d/1Q0GASa6lidBOxMIKF-bJ6OtX8XKaV9st/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit 3 Finance and Marketing for early entrepreneurs.pdf", url: "https://drive.google.com/file/d/1Q_5z_dFVfuueXJVLlifRt_y4i7j6qfvJ/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM UNIT 2.pdf", url: "https://drive.google.com/file/d/1bFl7NDf8X-R6CnYxGARM1tq_IYf55p0v/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM assignment 1 2.pdf", url: "https://drive.google.com/file/d/1bPFh7P4j1VAocwvpOsuAJd5TNuM8dV7p/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "UNIT-2 (1).pdf", url: "https://drive.google.com/file/d/1bfkzoQ-tEKGvWD42VI6DrutluThle98O/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "unit 4 PEM.pdf", url: "https://drive.google.com/file/d/1eXLxM2XyfBUnmrhg7ayoKEhLRlhJzDWA/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PYQ PEM.pdf", url: "https://drive.google.com/file/d/1l4A9y0PMn9a9-109PwUWlisv6N0zD5c-/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit 1 Introduction to Entreprenuership and innovation (1).pdf", url: "https://drive.google.com/file/d/1obAgGZFxc4NrQ1IPblk1oKWCoibcQw_L/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM Unit 3.pdf", url: "https://drive.google.com/file/d/1sAQi5v4V1u1c1dADhRSiFaZe3D1IOUiI/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM UNIT 1.pdf", url: "https://drive.google.com/file/d/1vGlqYKOS5fXDuxtFMWBWr7V8pYMQbnpC/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PEM - THE END.pdf", url: "https://drive.google.com/file/d/1yz4kx96hgkpQ3Q-f1VSU6NWZEG5EVjkV/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "UNIT-1 (1).pdf", url: "https://drive.google.com/file/d/1zUFJRjQdW4RUggjH4AntU0zA6ZFr_eE9/view?usp=drivesdk", size: "2 MB", semester: "5" }
    ],
    "Operating System": [
      { title: "operating system unit 1.1 (1).pdf", url: "https://drive.google.com/file/d/1-ZQyWHPGu8-3Y_VMb_9JT-yovZDI_AmY/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Complete (1).pdf", url: "https://drive.google.com/file/d/109Yuv4svZwckf8Q2VV8NgJjoKMgKgx2F/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit-4 os (1).pdf", url: "https://drive.google.com/file/d/10e6yt2pCS_6n14wBfjAEe4xFSG2Fxsrr/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS Notes (1).pdf", url: "https://drive.google.com/file/d/12GogaWrO3gGUh9tKK_rDHOuxGOGZbgMK/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "final-unit-4-spos-2023.pdf", url: "https://drive.google.com/file/d/13yH3Tm8xsKozRxmtJI5NKEoG0-923ab6/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PVP20 OS UNIT-2 MATERIAL.pdf", url: "https://drive.google.com/file/d/16MP0lWeh4jub9hwzq_vwrViNVeHJHiPR/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Operating system 5th sem AIML-AIDS (1).pdf", url: "https://drive.google.com/file/d/1ALhOXs2VKe0l_JRwfSzWKxrB-XzquANd/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS 1-4 (1).pdf", url: "https://drive.google.com/file/d/1B2F-cJvHkXecwXV2n_C-DIXB98tBI7N_/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS unit 1&2 (1).pdf", url: "https://drive.google.com/file/d/1Bcab2USm5IvvaLA-Z_xrZucTuTAJTZdN/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS_Concepts_Differences.pdf", url: "https://drive.google.com/file/d/1CaD66AR-sdw4d4LgvjgTzWPsEwY46jzR/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS Tutorial.pdf", url: "https://drive.google.com/file/d/1K05u52bQ07721keCVsubZvpdAu9eklHB/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "ff46a6aa-bfd1-47fe-abc3-b9e5f07a650c.pdf", url: "https://drive.google.com/file/d/1KtAr7VRBx2hmp2-GoDUG-jrbAkx3kI5X/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "PVP20 OS UNIT-3 MATERIAL.pdf", url: "https://drive.google.com/file/d/1Kvb3BbXjvj3M3IAhxM_8MTOqqO0TUISN/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS.pdf", url: "https://drive.google.com/file/d/1MK27jyqxp2WwFzQ4eX6cdJugmMU3LQRX/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS UNIT 3,4.pdf", url: "https://drive.google.com/file/d/1NmIr3oTqbA1bcsOBanoJR-Kcfbe1w1eV/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "unit 3 os.pdf", url: "https://drive.google.com/file/d/1ON-Lf1mhb9mlVpGxpuSbG49r3-_G1Ylp/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Unit_1 and II_Operating System_Dr.Ashish.pdf", url: "https://drive.google.com/file/d/1Qf9qo6mEqBkWfnZyhnynCDTcpZuxTFIX/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS ASSIGNMENTS (1).pdf", url: "https://drive.google.com/file/d/1QxX8fNxt58Jz4qg_0KkSYXw8gCVzz3yZ/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS Notes Unit 2 (1).pdf", url: "https://drive.google.com/file/d/1S-AMSBit4OUyPjDIsLlfa7NK2TaLMQVo/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS Notes Unit 1 (1).pdf", url: "https://drive.google.com/file/d/1UMlGNuHOSTM6WXjyCCKVAYLPlY5QdBOy/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS UNIT 3,4 (1).pdf", url: "https://drive.google.com/file/d/1gQK6cBA-WYo8xItDVSgNuXZFelGH5y3g/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/1jO2gI3tb5yhUU_yT56f4okBWFWMS3YlK/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "os (1).pdf", url: "https://drive.google.com/file/d/1l1vet77fHKtNswdR0oNLiIW5meUTrU32/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "OS Assignment T11 (1).pdf", url: "https://drive.google.com/file/d/1l_7R2uviaQfJ6YirWxHmVPoeTPhznTUh/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Operating System Unit1 pdf (1).pdf", url: "https://drive.google.com/file/d/1lvg75fleMZqvcnmh8pjKyf-TSRaszN5S/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "R20CSE2202-OPERATING-SYSTEMS (1).pdf", url: "https://drive.google.com/file/d/1wLGklg_E4qK0fS_EwWcSFwWvgOWufECF/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "a616ce_c6bc3af9e1f34a3c93b15ce270810e00.pdf", url: "https://drive.google.com/file/d/1yui_Ni2ZqJFX3dwBkTzu0V9yDRAjqVI-/view?usp=drivesdk", size: "2 MB", semester: "5" }
    ],
    "Internet of Things": [
      { title: "IOT Unit-1 (1).pdf", url: "https://drive.google.com/file/d/10tDnhnnTOChsIPwzcdd_02XjPjalydKl/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT 1.pdf", url: "https://drive.google.com/file/d/11C1ueoDdku6S4OdsqPyU5Q19aDFXGdce/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT NOTES Unit 2 (1).pdf", url: "https://drive.google.com/file/d/141qEe71y2VOHBeuMAHgTAqquC94COavO/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT.pdf", url: "https://drive.google.com/file/d/1CF5YCf7btatFjahhEUBa8Xb_icoXET7Z/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "syllabus ke anusaar (1).pdf", url: "https://drive.google.com/file/d/1CN8ubv2X-qLgFdertGPouAiWOZQR2S-K/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT_Unit 1 (2).pdf", url: "https://drive.google.com/file/d/1CkES8lz0swh3HEAlvD2fZWdAj9ocSkKS/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT AKASH.pdf", url: "https://drive.google.com/file/d/1DKwGeaD3jFELg0noQeF2d9Xo--3pGxeW/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IoT unit 2 vips.pptx (2).pdf", url: "https://drive.google.com/file/d/1J-oLZqYvoyMVLE7e-eF9sfndi9MJbtr7/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IoT & Applications Digital Notes (1).pdf", url: "https://drive.google.com/file/d/1L8D5wg9H9v-30N-YxoGy4P8aD1F7PY4c/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "iot unit 2 (1).pdf", url: "https://drive.google.com/file/d/1LFHPRCxEYz5qgH7r-RLzYi5vQ98znEzs/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "Assignment 3 (1).pdf", url: "https://drive.google.com/file/d/1LdZKh1wajBv9bCikOzL7atPownIKXIqy/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "iot unit 2 part 1 (1).pdf", url: "https://drive.google.com/file/d/1Mp6xbddFjA0-dO6pT5twIxrl8p3e0bo6/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT Unit-5 (1).pdf", url: "https://drive.google.com/file/d/1NBXGU7RS2STl9RK9k3u4zeVoWORS1zBG/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IoT unit 1 vips.pptx (1).pdf", url: "https://drive.google.com/file/d/1NUCNPhGdp_WLh_am_j1-dfnbky74b4nR/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT_Unit 1 (3).pdf", url: "https://drive.google.com/file/d/1NYduDhTgm3XXYt_ZVkRFycaSDBSt6Ihk/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "unit 4.pdf", url: "https://drive.google.com/file/d/1OTPhKaUDuF_mD2mWYK6G7sal-WFK0eJb/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IoT Fundamentals (1).pdf", url: "https://drive.google.com/file/d/1TCNdClL6WYy2tXfvemnzcb3EYbmDVu_K/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "iot unit 1 part 2 (1).pdf", url: "https://drive.google.com/file/d/1T_XbgMl1TIwiYVHHZlVF-T9s5A8ueGUr/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT Unit-3 (1).pdf", url: "https://drive.google.com/file/d/1W_PkW8im9aK8nt8mBGlnPhmqM4L1GUbG/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "iot unit 1 part 1 (1).pdf", url: "https://drive.google.com/file/d/1XFJroT8PW1ATFxFnOr_ZNyE8KFrXIwAd/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "UNIT-V (1).pdf", url: "https://drive.google.com/file/d/1d6y9PxNIPAnmB8147z6luHYtlIi24uMs/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT full.pdf", url: "https://drive.google.com/file/d/1etEDR5GPa4gUv109gwRsl9ZLqlEjBKlS/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "DR jwc IOT (1).pdf", url: "https://drive.google.com/file/d/1g9BWCN4c0Qfv62c1UDeVUhEh9iqPh2RJ/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "unit 1 iot.pdf", url: "https://drive.google.com/file/d/1htXx-Iiy8VEeMrUnZqxnl5UCUw-sIh8h/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "SM_6th-Sem__Cse_Internet-of-Things (1).pdf", url: "https://drive.google.com/file/d/1njB_7I5cOoTyS1RZAq738Tgxb87b9sck/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT assignment 3 (1).pdf", url: "https://drive.google.com/file/d/1o0o4XuKZwXj2AptChAxlpYMc4V3I5fIq/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT Unit-2 (1).pdf", url: "https://drive.google.com/file/d/1oXg25VXW8HDdagJvc5pz2HEbRMICGwdW/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT NOTES Unit 1 (1).pdf", url: "https://drive.google.com/file/d/1pvxzZGBfgPtnuhdoqGthfE2gw0QFGdmc/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IoT unit 2 vips.pptx (3).pdf", url: "https://drive.google.com/file/d/1r-ZTJLiq0ZINI7Qni8Jwb-MioqBnSqwf/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT 1-4 (1).pdf", url: "https://drive.google.com/file/d/1sC9VF4JYQyfUQKYKsUZv9o9nA6S7tEaN/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT Unit-4 (1).pdf", url: "https://drive.google.com/file/d/1t18kU5v3hvgCQ9sNRfrHa6j5PYqCKyUI/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "notes sem 5 (1).pdf", url: "https://drive.google.com/file/d/1uFX4B0ZkszkOs7nLpqbvqVMlpTDicSk5/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "iot unit 2 part 2 (1).pdf", url: "https://drive.google.com/file/d/1v3BIpBso8O5kiI0YX9187jzqRxu_pejJ/view?usp=drivesdk", size: "2 MB", semester: "5" },
      { title: "IOT PYQ.pdf", url: "https://drive.google.com/file/d/1x4qfrszJhVnJB6M6MwIt2VgAhsNwRkLh/view?usp=drivesdk", size: "2 MB", semester: "5" }
    ], 
    "Design and Analysis of Algorithms": [
        { title: "ADA UNIT-2 NOTES (1).pdf", url: "https://drive.google.com/file/d/1--jAczc1iPIaB6lDAg7kttVUhUFQriye/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA assignment 3 (1).pdf", url: "https://drive.google.com/file/d/1-SbQZPzvWdi-5a5KsF3toyB0VLEwF24M/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "daa part 3.pdf", url: "https://drive.google.com/file/d/12OzB8bPPdc4jBhqSsnhsiFy_koubZEtY/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "Design and Analysis of Algorithms (1).pdf", url: "https://drive.google.com/file/d/16EdCWattq8Z5K_FXeNZD8f4u4slaniQX/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "daa notes part 2.pdf", url: "https://drive.google.com/file/d/16cL13RHdo0y5FbKlqAKX3u2wkMjE70yV/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "course_guideline_student_START_individual (1).pdf", url: "https://drive.google.com/file/d/17WOBDVhxP1M68eE5fXBATN1BgunqwNyj/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA 1-4 (1).pdf", url: "https://drive.google.com/file/d/18e2LIGhumZMCvGa-JrMXqV5noBIwGxcF/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "daa notes part 1.pdf", url: "https://drive.google.com/file/d/19TsFyDeVBCPMjdb5bwiayoaGWHY4-jEs/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "ADA UNIT-2 VID + REF (1).pdf", url: "https://drive.google.com/file/d/1AR58pWMxFcpxv9KHGNtS0NzdzYJAZhYo/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "unit 4 daa ch2.pdf", url: "https://drive.google.com/file/d/1BN3ymWUJ5Sg-isZi7g24m1VRCb_l_WyD/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "daa part 4.pdf", url: "https://drive.google.com/file/d/1E6n726Z8v2olbKz3jiboWQTItr0b1nNC/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "Assignment 1 T11 (1).pdf", url: "https://drive.google.com/file/d/1I4C7ERFrl5wAtkAo-osPxO5dUda9fH7l/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA Assignment T11 (1).pdf", url: "https://drive.google.com/file/d/1JGB-kG3jKhvW3IEPcx2QeSJ-qvLhrsTT/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "ADA UNIT-1 VID + REF (1).pdf", url: "https://drive.google.com/file/d/1Q99FrLL_rsMrO8_Nxa2yS-BQXzv622bR/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "PYQ DAA.pdf", url: "https://drive.google.com/file/d/1R13oW40sy7idSslgqOlZSwDiT4w-WVTW/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA BOOK (1).pdf", url: "https://drive.google.com/file/d/1ThC2uySg9Km5Goz_ghugNwNy4L2XaUxx/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "106325 (1).pdf", url: "https://drive.google.com/file/d/1XAdQm-1R5yEv1Zl-8dtIJQi6LBIxrrqP/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA UNIT 3,4.pdf", url: "https://drive.google.com/file/d/1ZsXkoQr6hpCXI3h16oZ2AZdTM7lpKec5/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "SORTING ALGORITHM-JOHN PAUL (1).pdf", url: "https://drive.google.com/file/d/1_EU88fMTobvGciDXVwgNnRkN7Yc2oBcv/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "ADA UNIT-1 NOTES (1).pdf", url: "https://drive.google.com/file/d/1brXH93NPuB9zKrCSDAClqC55UsnaFHuC/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA assignment 4 (1).pdf", url: "https://drive.google.com/file/d/1iRNoJgQQizkn2r308sbm5ynkwLdiZkPe/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "COLLATE ADA UNIT-1 NOTES (1).pdf", url: "https://drive.google.com/file/d/1jlXq28h59YgMxYU7_L74jRPNXwGMkc21/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "master.pdf", url: "https://drive.google.com/file/d/1k5OiWPBv6Tkxq61ih6TE24V1QVNwF7-K/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA.pdf", url: "https://drive.google.com/file/d/1pz6Fp6KD0Rd0nBSy7u9TwD92cpkJA3sC/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "278_DAA Complete (1).pdf", url: "https://drive.google.com/file/d/1r-2U3lx0keLGRkH_Ltt8mi8n0fxzg9AT/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "COLLATE ADA UNIT-2 NOTES (1).pdf", url: "https://drive.google.com/file/d/1rX7SmAPnTVN6ZxXE5Q3HbY4vHZ7Mj-e0/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA unit 1,2 (1).pdf", url: "https://drive.google.com/file/d/1rh38mpWRvBFHPMstpHr_bApBvVnWuGEx/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA ASSIGNMENTS.pdf", url: "https://drive.google.com/file/d/1sg90NIeu5r6u4xwTTitXz0EZzaIY103S/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "DAA END TIME REVISION .pdf", url: "https://drive.google.com/file/d/1tifsehk5S1s5YVbBdbmv-sktCFZrVHdR/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "unit-3-full notes.pdf", url: "https://drive.google.com/file/d/1xHJ8mJmBP3OSK2YxID6BhGSBJ4OVckt9/view?usp=drivesdk", size: "2 MB", semester: "5" },
        { title: "daa unit 3.pdf", url: "https://drive.google.com/file/d/1yOLxEnoJ5iC23Q8c-J2hTA9913iwQ9wY/view?usp=drivesdk", size: "2 MB", semester: "5" }
    ]
  };
  const [previewUrl, setPreviewUrl] = React.useState("");
  const { theme, isDark } = useTheme();
  const [selectedSemester, setSelectedSemester] = React.useState('3');
  const subjects = semesterSubjects[selectedSemester];
  const [selectedSubject, setSelectedSubject] = React.useState('');


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-0"
      style={{
        background: isDark ? "rgba(13, 27, 42, 0.7)" : "rgba(78, 52, 46, 0.4)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="p-8 w-[80vw] max-w-5xl h-[80vh] overflow-y-auto rounded-2xl shadow-2xl bg-white flex flex-col transition-all duration-300"
        style={{
          background: `${theme.card}F5`, // 96% opacity
          backdropFilter: "blur(25px)",
          border: `1px solid ${theme.secondary}40`,
          boxShadow: isDark
            ? `0 20px 80px ${theme.primary}30`
            : `0 20px 80px ${theme.secondary}30`,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: theme.text }}
          >
            Study Materials
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: `${theme.secondary}20`,
            }}
          >
            <X size={24} style={{ color: theme.secondary }} />
          </motion.button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-4 mb-8"
        >
          <select
            value={selectedSemester}
            onChange={e => {
              setSelectedSemester(e.target.value);
              setSelectedSubject('');
            }}
            className="rounded-xl px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              background: isDark
                ? `${theme.background}80`
                : `${theme.card}80`,
              border: `1px solid ${theme.secondary}40`,
              color: theme.text,
              focusRingColor: theme.primary,
            }}
          >
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
          </select>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="rounded-xl px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              background: isDark
                ? `${theme.background}80`
                : `${theme.card}80`,
              border: `1px solid ${theme.secondary}40`,
              color: theme.text,
              focusRingColor: theme.primary,
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map((sub, idx) => (
              <option key={idx} value={sub}>{sub}</option>
            ))}
          </select>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Filter notes by subject if selected, else show all notes for semester */}
          {(selectedSubject
            ? notesData[selectedSubject]?.map((note, noteIdx) => (
                <motion.div
                  key={selectedSubject + noteIdx + note.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * noteIdx }}
                  whileHover={{
                    scale: 1.02,
                    y: -3,
                    boxShadow: `0 4px 12px ${theme.primary}20`,
                  }}
                  className="p-3 rounded-xl cursor-pointer transition-all duration-300"
                  style={{
                    background: `${theme.card}CC`,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${theme.secondary}30`,
                    boxShadow: isDark
                      ? `0 2px 8px ${theme.primary}10`
                      : `0 2px 8px ${theme.secondary}10`,
                  }}
                >
                  <h3
                    className="text-base font-bold mb-2 transition-colors duration-300"
                    style={{ color: theme.text }}
                  >
                    {note.title}
                  </h3>
                  <div
                    className="space-y-1 text-xs mb-2 transition-colors duration-300"
                    style={{ color: theme.secondary }}
                  >
                    <div>Semester: {note.semester}</div>
                    <div>Subject: {selectedSubject}</div>
                    <div>Size: {note.size || '2 MB'}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-6 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                      style={{
                        background: isDark ? '#00E0FF' : '#AEEEEE', // Neon-Teal / Cyan for dark, soft teal green for light
                        color: isDark ? '#222' : '#006666', // dark text for neon, teal text for light
                        border: 'none',
                        boxShadow: isDark ? '0 0 8px #00E0FF' : '0 0 4px #AEEEEE',
                      }}
                      onClick={() => setPreviewUrl(note.url)}
                    >
                      <Eye size={14} /> Preview
                    </button>
                  </div>
                </motion.div>
              ))
            : subjects.flatMap((subject, idx) =>
                notesData[subject]?.map((note, noteIdx) => (
                  <motion.div
                    key={subject + noteIdx + note.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * (idx * 20 + noteIdx) }}
                    whileHover={{
                      scale: 1.02,
                      y: -3,
                      boxShadow: `0 4px 12px ${theme.primary}20`,
                    }}
                    className="p-3 rounded-xl cursor-pointer transition-all duration-300"
                    style={{
                      background: `${theme.card}CC`,
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${theme.secondary}30`,
                      boxShadow: isDark
                        ? `0 2px 8px ${theme.primary}10`
                        : `0 2px 8px ${theme.secondary}10`,
                    }}
                  >
                    <h3
                      className="text-base font-bold mb-2 transition-colors duration-300"
                      style={{ color: theme.text }}
                    >
                      {note.title}
                    </h3>
                    <div
                      className="space-y-1 text-xs mb-2 transition-colors duration-300"
                      style={{ color: theme.secondary }}
                    >
                      <div>Semester: {note.semester}</div>
                      <div>Subject: {subject}</div>
                      <div>Size: {note.size || '2 MB'}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-6 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                        style={{
                          background: isDark ? '#00E0FF' : '#AEEEEE',
                          color: isDark ? '#222' : '#006666',
                          border: 'none',
                          boxShadow: isDark ? '0 0 8px #00E0FF' : '0 0 4px #AEEEEE',
                        }}
                        onClick={() => setPreviewUrl(note.url)}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    </div>
                  </motion.div>
                )) || []
              )
          )}
        </motion.div>
        {/* PDF Preview Iframe */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewUrl("")}>
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 p-2" onClick={() => setPreviewUrl("")}>
                <X size={24} />
              </button>
              <iframe
                src={previewUrl.replace('/view?usp=drivesdk', '/preview')}
                title="PDF Preview"
                width="100%"
                height="600px"
                style={{ borderRadius: '12px', border: 'none' }}
                allowFullScreen
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
