'use client';

import QuestionFormMCQSingle from './QuestionFormMCQSingle';
import QuestionFormMCQMultiple from './QuestionFormMCQMultiple';
import QuestionFormTrueFalse from './QuestionFormTrueFalse';
import QuestionFormFillBlank from './QuestionFormFillBlank';
import QuestionFormMatch from './QuestionFormMatch';
import QuestionFormReorder from './QuestionFormReorder';
import QuestionFormImageBased from './QuestionFormImageBased';
import { QUESTION_TYPES } from '../QuestionTypeSelector';

interface QuestionFormRouterProps {
  questionType: string;
  question: any;
  onChange: (updates: any) => void;
}

export default function QuestionFormRouter({ questionType, question, onChange }: QuestionFormRouterProps) {
  switch (questionType) {
    case QUESTION_TYPES.MULTIPLE_CHOICE_SINGLE:
    case 'multiple_choice': // Legacy support
      return <QuestionFormMCQSingle question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.MULTIPLE_CHOICE_MULTIPLE:
      return <QuestionFormMCQMultiple question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.TRUE_FALSE:
      return <QuestionFormTrueFalse question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.FILL_IN_BLANK:
      return <QuestionFormFillBlank question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.MATCH:
      return <QuestionFormMatch question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.REORDER:
      return <QuestionFormReorder question={question} onChange={onChange} />;
    
    case QUESTION_TYPES.IMAGE_BASED:
      return <QuestionFormImageBased question={question} onChange={onChange} />;
    
    default:
      return (
        <div className="text-center py-8 text-gray-500">
          Question form for type "{questionType}" is not yet implemented.
        </div>
      );
  }
}

