import Answer from "./answer.js";
import Bundle from "./bundle.js";
import Client from "./client.js";
import Question from "./question.js";
import Quiz from "./quiz.js";
import QuizAttempt from "./quizAttempt.js";
import Student from "./student.js";
import User from "./user.js";

/* ---------------- USER RELATIONS ---------------- */

// User → Client
User.hasOne(Client, {
  foreignKey: "user_id",
 
});

Client.belongsTo(User, {
  foreignKey: "user_id",
  as:"users"
});

// User → Student
User.hasOne(Student, {
  foreignKey: "user_id",

});

Student.belongsTo(User, {
  foreignKey: "user_id"
});

/* ---------------- CLIENT RELATIONS ---------------- */

// Client → Bundle
Client.hasMany(Bundle, {
  foreignKey: "client_id",

});

Bundle.belongsTo(Client, {
  foreignKey: "client_id"
});


/* ---------------- BUNDLE RELATIONS ---------------- */

// Bundle → Quiz
Bundle.hasMany(Quiz, {
  foreignKey: "bundle_id",

});

Quiz.belongsTo(Bundle, {
  foreignKey: "bundle_id"
});


/* ---------------- QUIZ RELATIONS ---------------- */

// Quiz → Question
Quiz.hasMany(Question, {
  foreignKey: "quiz_id",

});

Question.belongsTo(Quiz, {
  foreignKey: "quiz_id"
});

// Quiz → QuizAttempt
Quiz.hasMany(QuizAttempt, {
  foreignKey: "quiz_id",

});

QuizAttempt.belongsTo(Quiz, {
  foreignKey: "quiz_id"
});


/* ---------------- STUDENT RELATIONS ---------------- */

// Student → QuizAttempt
Student.hasMany(QuizAttempt, {
  foreignKey: "student_id",

});

QuizAttempt.belongsTo(Student, {
  foreignKey: "student_id"
});


/* ---------------- ATTEMPT RELATIONS ---------------- */

// QuizAttempt → Answer
QuizAttempt.hasMany(Answer, {
  foreignKey: "attempt_id",

});

Answer.belongsTo(QuizAttempt, {
  foreignKey: "attempt_id"
});


/* ---------------- QUESTION RELATIONS ---------------- */

// Question → Answer
Question.hasMany(Answer, {
  foreignKey: "question_id",

});

Answer.belongsTo(Question, {
  foreignKey: "question_id"
});


export default {
  User,
  Client,
  Bundle,
  Quiz,
  Question,
  Student,
  QuizAttempt,
  Answer
};