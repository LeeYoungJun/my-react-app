import { configs, plugins } from 'eslint-config-airbnb-extended';
import reactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';

export default [
  globalIgnores(['dist']),
  plugins.stylistic,
  plugins.importX,
  plugins.react,
  plugins.reactA11y,
  plugins.reactHooks,
  ...configs.react.recommended,
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // React 17+ JSX Transform - React import 불필요
      'react/react-in-jsx-scope': 'off',
      // Vite HMR을 위한 react-refresh 규칙
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // label과 input의 htmlFor/id 연결 허용
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          assert: 'either',
        },
      ],
    },
  },
];
