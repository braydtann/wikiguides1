import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFlow } from '../../contexts/FlowContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';

const FlowExecutor = () => {
  const { flowId, sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const {
    currentFlow,
    currentExecution,
    flowSteps,
    setCurrentFlow,
    getFlow,
    fetchFlowSteps,
    startFlowExecution,
    getFlowExecution,
    submitStepAnswer,
    getFlowSummary
  } = useFlow();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [summary, setSummary] = useState(null);

  // Initialize flow execution
  useEffect(() => {
    const initializeFlow = async () => {
      if (!flowId) return;

      // Get flow details
      const flowResult = await getFlow(flowId);
      if (flowResult.success) {
        setCurrentFlow(flowResult.data);
        
        // Get flow steps
        await fetchFlowSteps(flowId);
        
        // Handle execution based on sessionId
        if (sessionId) {
          // Resume existing execution
          const executionResult = await getFlowExecution(flowId, sessionId);
          if (executionResult.success) {
            const execution = executionResult.data;
            setAnswers(execution.answers || {});
            
            if (execution.status === 'completed') {
              setIsCompleted(true);
              const summaryResult = await getFlowSummary(flowId, sessionId);
              if (summaryResult.success) {
                setSummary(summaryResult.data);
              }
            }
          }
        } else {
          // Start new execution
          const executionResult = await startFlowExecution(flowId);
          if (executionResult.success) {
            const newSessionId = executionResult.data.session_id;
            navigate(`/flows/${flowId}/execute/${newSessionId}`, { replace: true });
          }
        }
      }
    };

    initializeFlow();
  }, [flowId, sessionId]);

  // Update current step index based on execution progress
  useEffect(() => {
    if (currentExecution && flowSteps.length > 0) {
      if (currentExecution.current_step_id) {
        const stepIndex = flowSteps.findIndex(step => step.id === currentExecution.current_step_id);
        if (stepIndex !== -1) {
          setCurrentStepIndex(stepIndex);
        }
      }
    }
  }, [currentExecution, flowSteps]);

  const getCurrentStep = () => {
    return flowSteps[currentStepIndex];
  };

  const validateAnswer = (step, answer) => {
    if (!step) return true;

    if (step.is_required && (!answer || answer.toString().trim() === '')) {
      return 'This field is required';
    }

    if (step.step_type === 'text_input' && step.validation_rules) {
      const rules = step.validation_rules;
      
      if (rules.min_length && answer.length < rules.min_length) {
        return `Minimum length is ${rules.min_length} characters`;
      }
      
      if (rules.max_length && answer.length > rules.max_length) {
        return `Maximum length is ${rules.max_length} characters`;
      }
      
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
        return 'Please enter a valid email address';
      }
      
      if (rules.pattern && !new RegExp(rules.pattern).test(answer)) {
        return rules.pattern_message || 'Invalid format';
      }
    }

    return null;
  };

  const handleNext = async () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    setValidationError('');
    
    // Skip validation for information steps
    if (currentStep.step_type !== 'information') {
      const validationResult = validateAnswer(currentStep, currentAnswer);
      if (validationResult) {
        setValidationError(validationResult);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await submitStepAnswer(
        flowId,
        sessionId,
        currentStep.id,
        currentAnswer,
        { timestamp: new Date().toISOString() }
      );

      if (result.success) {
        // Store answer locally
        setAnswers(prev => ({
          ...prev,
          [currentStep.id]: {
            answer: currentAnswer,
            answered_at: new Date().toISOString()
          }
        }));

        // Check if flow is completed
        if (result.data.is_completed) {
          setIsCompleted(true);
          const summaryResult = await getFlowSummary(flowId, sessionId);
          if (summaryResult.success) {
            setSummary(summaryResult.data);
          }
        } else {
          // Move to next step
          const nextStepIndex = flowSteps.findIndex(step => step.id === result.data.next_step_id);
          if (nextStepIndex !== -1) {
            setCurrentStepIndex(nextStepIndex);
            setCurrentAnswer('');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = flowSteps[currentStepIndex - 1];
      setCurrentStepIndex(currentStepIndex - 1);
      
      // Load previous answer
      const prevAnswer = answers[prevStep.id];
      setCurrentAnswer(prevAnswer ? prevAnswer.answer : '');
    }
  };

  const handleOptionSelect = (value) => {
    setCurrentAnswer(value);
    setValidationError('');
  };

  const renderStepContent = () => {
    const step = getCurrentStep();
    if (!step) return null;

    switch (step.step_type) {
      case 'information':
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">ℹ️</div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              {step.question_text}
            </h2>
            {step.description && (
              <p className="text-secondary-600 mb-6">
                {step.description}
              </p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              {step.question_text}
            </h2>
            {step.description && (
              <p className="text-secondary-600 mb-6">
                {step.description}
              </p>
            )}
            <div className="space-y-3">
              {step.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    currentAnswer === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      currentAnswer === option.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-secondary-300'
                    }`}>
                      {currentAnswer === option.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'text_input':
        return (
          <div>
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              {step.question_text}
            </h2>
            {step.description && (
              <p className="text-secondary-600 mb-6">
                {step.description}
              </p>
            )}
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                setValidationError('');
              }}
              placeholder="Enter your answer..."
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationError ? 'border-red-500' : 'border-secondary-300'
              }`}
              rows={4}
            />
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p>Unknown step type: {step.step_type}</p>
          </div>
        );
    }
  };

  if (isCompleted && summary) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Flow Completed!
          </h1>
          <p className="text-secondary-600 mb-8">
            Thank you for completing "{currentFlow?.title}". Here's your summary:
          </p>

          <div className="bg-secondary-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Summary
            </h3>
            <div className="space-y-4">
              {summary.completed_steps.map((step, index) => (
                <div key={index} className="pb-3 border-b border-secondary-200">
                  <div className="font-medium text-secondary-900">
                    Q{step.step_order}. {step.question}
                  </div>
                  <div className="text-secondary-600 mt-1">
                    Answer: {step.answer}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-secondary-200 flex items-center justify-between text-sm text-secondary-500">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Total time: {Math.floor(summary.total_time_seconds / 60)}m {summary.total_time_seconds % 60}s
              </span>
              <span>
                {summary.completed_steps.length} steps completed
              </span>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate('/flows')}
              className="btn-secondary"
            >
              Back to Flows
            </button>
            <button
              onClick={() => window.print()}
              className="btn-primary"
            >
              Print Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFlow || flowSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-secondary-600">Loading flow...</span>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const progress = ((currentStepIndex + 1) / flowSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {currentFlow.title}
            </h1>
            <p className="text-secondary-600">
              Step {currentStepIndex + 1} of {flowSteps.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary-500">Progress</div>
            <div className="text-lg font-semibold text-primary-600">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-8 mb-6">
        {renderStepContent()}
        
        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {validationError}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="text-sm text-secondary-500">
          {currentStepIndex + 1} / {flowSteps.length}
        </div>

        <button
          onClick={handleNext}
          disabled={isSubmitting || (currentStep?.step_type !== 'information' && !currentAnswer)}
          className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : currentStepIndex === flowSteps.length - 1 ? (
            <>
              Complete
              <Check className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FlowExecutor;