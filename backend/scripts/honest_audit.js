import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!c) throw new Error('Course not found');

    console.log('\n🔍 HONEST AUDIT: Which lessons have BROKEN/INCOMPLETE quiz/interview?\n');

    let totalLessons = 0;
    let quizComplete = 0;
    let quizFailed = 0;
    let interviewComplete = 0;
    let interviewFailed = 0;
    const failedLessons = [];

    for (const section of c.sections) {
      for (const lesson of section.lessons) {
        totalLessons++;
        
        // Check Quiz
        const hasQuiz = lesson.quiz?.questions && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length === 3;
        const quizValid = hasQuiz && lesson.quiz.questions.every(q => 
          q.prompt && q.prompt.length > 10 && 
          Array.isArray(q.options) && q.options.length === 4 &&
          typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3 &&
          q.explanation && q.explanation.length > 10 &&
          !q.options.includes('Option A') && !q.options.includes('Option B') // Check for generic options
        );
        
        if (quizValid) quizComplete++;
        else quizFailed++;

        // Check Interview
        const hasInterview = lesson.interview?.questions && Array.isArray(lesson.interview.questions) && lesson.interview.questions.length === 3;
        const interviewValid = hasInterview && lesson.interview.questions.every(q =>
          q.prompt && q.prompt.length > 10 &&
          q.sampleAnswer && q.sampleAnswer.length > 80 &&
          !q.sampleAnswer.includes('Sample answer') &&
          !q.sampleAnswer.includes('Sample real-world')
        );

        if (interviewValid) interviewComplete++;
        else interviewFailed++;

        // Log failed lessons
        if (!quizValid || !interviewValid) {
          failedLessons.push({
            title: lesson.title,
            quizOk: quizValid,
            interviewOk: interviewValid,
            quizQuestions: lesson.quiz?.questions?.length || 0,
            interviewQuestions: lesson.interview?.questions?.length || 0
          });
        }
      }
    }

    console.log(`📊 RESULTS:\n`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Quiz Complete: ${quizComplete}/${totalLessons} ✓`);
    console.log(`Quiz Failed: ${quizFailed}/${totalLessons} ✗`);
    console.log(`Interview Complete: ${interviewComplete}/${totalLessons} ✓`);
    console.log(`Interview Failed: ${interviewFailed}/${totalLessons} ✗`);

    console.log(`\n❌ FAILED LESSONS (${failedLessons.length}):\n`);
    failedLessons.forEach((l, i) => {
      console.log(`${i+1}. ${l.title}`);
      console.log(`   Quiz: ${l.quizOk ? '✓' : '✗'} (${l.quizQuestions} questions)`);
      console.log(`   Interview: ${l.interviewOk ? '✓' : '✗'} (${l.interviewQuestions} questions)`);
    });

    if (failedLessons.length === 0) {
      console.log('✅ ALL LESSONS ARE GOOD!\n');
    } else {
      console.log(`\n⚠️  ${failedLessons.length} lessons need fixing.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
