import Answer from "./answer.js";
import Batch from "./batch.js";
import Client from "./client.js";
import Course from "./course.js";
import Question from "./question.js";
import Quiz from "./quiz.js";
import QuizAttempt from "./quizAttempt.js";
import Set from "./sets.js";
import Student from "./student.js";
import Teacher from "./teacher.js";
import BatchTeacher from "./teacherbatchmapping.js";
import User from "./user.js";

/* ---------------- USER RELATIONS ---------------- */

// User → Client
User.hasOne(Client, { foreignKey: "user_id", onDelete: "CASCADE" });
Client.belongsTo(User, { foreignKey: "user_id",as:"users" });

// User → Teacher
User.hasOne(Teacher, { foreignKey: "user_id", onDelete: "CASCADE" });
Teacher.belongsTo(User, { foreignKey: "user_id" });

// User → Student
User.hasOne(Student, { foreignKey: "user_id", onDelete: "CASCADE" });
Student.belongsTo(User, { foreignKey: "user_id" });

/* ---------------- CLIENT RELATIONS ---------------- */

// Client → Course
Client.hasMany(Course, { foreignKey: "client_id", onDelete: "CASCADE" });
Course.belongsTo(Client, { foreignKey: "client_id" });

// Client → Batch
Client.hasMany(Batch, { foreignKey: "client_id", onDelete: "CASCADE" });
Batch.belongsTo(Client, { foreignKey: "client_id" });

// Client → Teacher
Client.hasMany(Teacher, { foreignKey: "client_id", onDelete: "CASCADE" });
Teacher.belongsTo(Client, { foreignKey: "client_id" });

// Client → Student
Client.hasMany(Student, { foreignKey: "client_id", onDelete: "CASCADE" });
Student.belongsTo(Client, { foreignKey: "client_id" });

// Client → Quiz
Client.hasMany(Quiz, { foreignKey: "client_id", onDelete: "CASCADE" });
Quiz.belongsTo(Client, { foreignKey: "client_id" });

/* ---------------- COURSE RELATIONS ---------------- */

// Course → Batch
Course.hasMany(Batch, { foreignKey: "course_id", onDelete: "CASCADE" });
Batch.belongsTo(Course, { foreignKey: "course_id" });

/* ---------------- BATCH RELATIONS ---------------- */

// Batch → Student
Batch.hasMany(Student, { foreignKey: "batch_id", onDelete: "CASCADE" });
Student.belongsTo(Batch, { foreignKey: "batch_id" });

// Batch ↔ Teacher (Many-to-Many)
Batch.belongsToMany(Teacher, {
  through: BatchTeacher,
  foreignKey: "batch_id",
  otherKey: "teacher_id",
});

Teacher.belongsToMany(Batch, {
  through: BatchTeacher,
  foreignKey: "teacher_id",
  otherKey: "batch_id",
});

// Batch → Quiz
Batch.hasMany(Quiz, { foreignKey: "batch_id", onDelete: "CASCADE" });
Quiz.belongsTo(Batch, { foreignKey: "batch_id" });

/* ---------------- TEACHER RELATIONS ---------------- */

// Teacher → Quiz
Teacher.hasMany(Quiz, { foreignKey: "teacher_id", onDelete: "CASCADE" });
Quiz.belongsTo(Teacher, { foreignKey: "teacher_id" });

/* ---------------- QUIZ RELATIONS ---------------- */

// Quiz → Set
Quiz.hasMany(Set, { foreignKey: "quiz_id", onDelete: "CASCADE" });
Set.belongsTo(Quiz, { foreignKey: "quiz_id" });

// Quiz → QuizAttempt
Quiz.hasMany(QuizAttempt, { foreignKey: "quiz_id", onDelete: "CASCADE" });
QuizAttempt.belongsTo(Quiz, { foreignKey: "quiz_id" });

/* ---------------- SET RELATIONS ---------------- */

// Set → Question
Set.hasMany(Question, { foreignKey: "set_id", onDelete: "CASCADE" });
Question.belongsTo(Set, { foreignKey: "set_id" });

// Set → QuizAttempt
Set.hasMany(QuizAttempt, { foreignKey: "set_id", onDelete: "CASCADE" });
QuizAttempt.belongsTo(Set, { foreignKey: "set_id" });

/* ---------------- STUDENT RELATIONS ---------------- */

// Student → QuizAttempt
Student.hasMany(QuizAttempt, { foreignKey: "student_id", onDelete: "CASCADE" });
QuizAttempt.belongsTo(Student, { foreignKey: "student_id" });

/* ---------------- ATTEMPT RELATIONS ---------------- */

// QuizAttempt → Answer
QuizAttempt.hasMany(Answer, { foreignKey: "attempt_id", onDelete: "CASCADE" });
Answer.belongsTo(QuizAttempt, { foreignKey: "attempt_id" });

/* ---------------- QUESTION RELATIONS ---------------- */

// Question → Answer
Question.hasMany(Answer, { foreignKey: "question_id", onDelete: "CASCADE" });
Answer.belongsTo(Question, { foreignKey: "question_id" });

// Teacher → User
Teacher.belongsTo(User, {
  foreignKey: "user_id",

});

User.hasOne(Teacher, {
  foreignKey: "user_id",

});

// Teacher → Client
Teacher.belongsTo(Client, {
  foreignKey: "client_id",
 
});

Client.hasMany(Teacher, {
  foreignKey: "client_id",
 
});
export default {
  User,
  Client,
  Course,
  Batch,
  Teacher,
  BatchTeacher,
  Student,
  Quiz,
  Set,
  Question,
  QuizAttempt,
  Answer,
};