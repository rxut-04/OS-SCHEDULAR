import QuizEngine from '../shared/QuizEngine';
import { AIML_QUESTIONS, AIML_TOPICS } from '../shared/aiml-data';
import { MachineLearning } from '@carbon/icons-react';

export default function AIMLQuizPage() {
  return (
    <QuizEngine
      subject="aiml"
      title="AI / Machine Learning"
      subtitle="Neural Nets, Algorithms & Deep Learning"
      icon={<MachineLearning size={56} className="text-purple-600" />}
      topics={AIML_TOPICS}
      allQuestions={AIML_QUESTIONS}
      backHref="/modules?tab=aiml"
      backLabel="AI/ML Modules"
    />
  );
}
