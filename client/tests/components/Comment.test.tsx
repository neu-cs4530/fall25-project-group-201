import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionBody from '../../src/components/main/answerPage/questionBody/index';

jest.mock('../../src/components/main/threeViewport', () => ({
  __esModule: true,
  default: () => <div data-testid='three-viewport'>3D Model</div>,
}));

jest.mock('../../src/hooks/useUserContext', () => ({
  __esModule: true,
  default: () => ({
    user: { username: 'testuser' },
  }),
}));

jest.mock('../../src/hooks/useAnswerPage', () => ({
  __esModule: true,
  default: () => ({
    downloadQuestionPermission: false,
    handleToggleQuestionPermission: jest.fn(),
  }),
}));

jest.mock('../../src/services/questionService', () => ({
  getQuestionMedia: jest.fn(),
}));

describe('QuestionBody - Markdown Code Block Rendering', () => {
  const baseProps = {
    qid: '123',
    views: 100,
    text: '',
    askby: 'testuser',
    meta: '2 days ago',
    setRotationSetting: jest.fn(),
    setTranslationSetting: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render inline code with backticks', () => {
    const props = {
      ...baseProps,
      text: 'Use `console.log()` for debugging',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('console.log()');
    expect(container.textContent).toContain('for debugging');
  });

  test('should render basic code block', () => {
    const props = {
      ...baseProps,
      text: '```\nconst x = 5;\nconsole.log(x);\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('const x = 5');
    expect(container.textContent).toContain('console.log(x)');
  });

  test('should render code block with language syntax', () => {
    const props = {
      ...baseProps,
      text: '```javascript\nfunction greet() {\n  return "Hello";\n}\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('function greet()');
    expect(container.textContent).toContain('return "Hello"');
  });

  test('should render multiple code blocks', () => {
    const props = {
      ...baseProps,
      text: 'First:\n```\nconst a = 1;\n```\nSecond:\n```\nconst b = 2;\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('const a = 1');
    expect(container.textContent).toContain('const b = 2');
  });

  test('should render code blocks in GLB questions', () => {
    const props = {
      ...baseProps,
      text: '```python\ndef hello():\n    print("Hello")\n```',
      mediaPath: '/path/to/model.glb',
      rotationSetting: null,
      translationSetting: null,
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('def hello()');
    expect(container.textContent).toContain('print("Hello")');
    expect(screen.getByTestId('three-viewport')).toBeInTheDocument();
  });
});

jest.mock('../../src/hooks/useUserContext', () => ({
  __esModule: true,
  default: () => ({
    user: { username: 'testuser' },
  }),
}));

jest.mock('../../src/hooks/useAnswerPage', () => ({
  __esModule: true,
  default: () => ({
    downloadQuestionPermission: false,
    handleToggleQuestionPermission: jest.fn(),
  }),
}));

jest.mock('../../src/services/questionService', () => ({
  getQuestionMedia: jest.fn(),
}));

describe('QuestionBody - Markdown Code Block Rendering', () => {
  const baseProps = {
    qid: '123',
    views: 100,
    text: '',
    askby: 'testuser',
    meta: '2 days ago',
    setRotationSetting: jest.fn(),
    setTranslationSetting: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render inline code with backticks', () => {
    const props = {
      ...baseProps,
      text: 'Use `console.log()` for debugging',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('console.log()');
    expect(container.textContent).toContain('for debugging');
  });

  test('should render basic code block', () => {
    const props = {
      ...baseProps,
      text: '```\nconst x = 5;\nconsole.log(x);\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('const x = 5');
    expect(container.textContent).toContain('console.log(x)');
  });

  test('should render code block with language syntax', () => {
    const props = {
      ...baseProps,
      text: '```javascript\nfunction greet() {\n  return "Hello";\n}\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('function greet()');
    expect(container.textContent).toContain('return "Hello"');
  });

  test('should render multiple code blocks', () => {
    const props = {
      ...baseProps,
      text: 'First:\n```\nconst a = 1;\n```\nSecond:\n```\nconst b = 2;\n```',
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('const a = 1');
    expect(container.textContent).toContain('const b = 2');
  });

  test('should render code blocks in GLB questions', () => {
    const props = {
      ...baseProps,
      text: '```python\ndef hello():\n    print("Hello")\n```',
      mediaPath: '/path/to/model.glb',
      rotationSetting: null,
      translationSetting: null,
    };

    const { container } = render(<QuestionBody {...props} />);

    expect(container.textContent).toContain('def hello()');
    expect(container.textContent).toContain('print("Hello")');
    expect(screen.getByTestId('three-viewport')).toBeInTheDocument();
  });
});
