"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTest(userId: string, currentUserId: string, data: any) {
  const test = await prisma.test.create({
    data: {
      userId,
      topicId: data.topicId,
      title: data.title,
      questions: {
        create: data.questions.map((q: any) => ({
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation
        }))
      }
    }
  });
  revalidatePath("/tests");
  return test;
}

export async function submitTestAttempt(testId: string, userId: string, score: number, totalQuestions: number, timeTaken: number, answers: any[]) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const attempt = await prisma.testAttempt.create({
    data: {
      testId,
      userId,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      answers: {
        create: answers.map((a: any) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect
        }))
      }
    }
  });
  
  await prisma.activityLog.create({
    data: { actionType: "TEST_COMPLETED", details: `Completed test with ${percentage}% score`, userId }
  });
  
  revalidatePath("/tests");
  revalidatePath("/results");
  return attempt;
}

export async function deleteTest(testId: string, userId: string) {
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) return;
  
  await prisma.test.delete({ where: { id: testId } });
  revalidatePath("/tests");
  revalidatePath("/results");
}
