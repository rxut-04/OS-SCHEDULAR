import QuizEngine from '../shared/QuizEngine';
import { OS_QUESTIONS, OS_TOPICS } from '../shared/os-data';
import { Chip } from '@carbon/icons-react';

export default function OSQuizPage() {
  return (
    <QuizEngine
      subject="os"
      title="Operating Systems"
      subtitle="CPU, Memory, Processes & More"
      icon={<Chip size={56} className="text-blue-600" />}
      topics={OS_TOPICS}
      allQuestions={OS_QUESTIONS}
      backHref="/modules"
      backLabel="Modules"
    />
  );
}
