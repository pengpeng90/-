import { FC } from 'react';
import { AppStep } from '../types';

interface StepWizardProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
  maxStep?: number; // Highest step reached or allowed
  isImageReady: boolean; // Check if base image exists to allow navigation
}

const steps = [
  { id: AppStep.HairSelection, label: '发型' },
  { id: AppStep.ExpressionSelection, label: '表情' },
  { id: AppStep.FeatureSelection, label: '特征' },
  { id: AppStep.ClothingSelection, label: '服装' },
  { id: AppStep.AccessorySelection, label: '配饰' },
  { id: AppStep.ActionSelection, label: '动作' },
  { id: AppStep.RandomSelection, label: '随机' },
  { id: AppStep.Customization, label: '自定义' },
];

export const StepWizard: FC<StepWizardProps> = ({ currentStep, onStepClick, isImageReady }) => {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-600 bg-slate-200">
              步骤 {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
          <div
            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
          ></div>
        </div>
        
        <div className="flex justify-between px-1">
            {steps.map((step) => {
                // Allow navigation if image is ready (basically always now once loaded)
                const canNavigate = isImageReady;
                
                return (
                <button 
                    key={step.id} 
                    onClick={() => canNavigate && onStepClick(step.id)}
                    disabled={!canNavigate}
                    className={`flex flex-col items-center flex-1 group focus:outline-none ${!canNavigate ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:opacity-100'}`}
                >
                    <div className={`
                        w-3 h-3 rounded-full mb-1 transition-all duration-300 
                        ${step.id === currentStep ? 'bg-blue-600 scale-150 ring-2 ring-blue-300' : step.id < currentStep ? 'bg-blue-500' : 'bg-gray-300'}
                        ${canNavigate && step.id !== currentStep ? 'group-hover:bg-blue-400 group-hover:scale-125' : ''}
                    `}></div>
                    <span className={`
                        text-[9px] md:text-xs font-medium text-center leading-tight transition-colors
                        ${step.id === currentStep ? 'text-blue-700 font-bold' : 'text-gray-500'}
                    `}>
                        {step.label}
                    </span>
                </button>
            )})}
        </div>
      </div>
    </div>
  );
};