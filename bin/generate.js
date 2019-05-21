const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const templates = {
  index: (name) =>
    `import React, { FC, ReactNode } from 'react';

const s = require('./${name}.module.scss');

export interface Props {
    children?: ReactNode | ReactNode[];
    className?: string;
}

const ${name}: FC<Props> = (props: Props) => {
    const {
      className,
      children,
      ...otherProps
    } = props;
  
    return (
      <div
        {...otherProps}
        className={s.${name.toLowerCase()}}
      >
        {children}
      </div>
    );
};

export default ${name};`,
  test: (name) => `// TODO: TDD
import React from 'react';
import { shallow } from 'enzyme';
import ${name} from '../${name}';

it('renders without crashing', () => {
  shallow(<${name} />);
});
`,
  sass: (name) => `@import "../../variables";

.${name.toLowerCase()}{
  color: initial;
}`,
  pack: (name) => `{
    "name": "body",
    "version": "0.0.1",
    "private": true,
    "main": "./${name}.tsx"
  }
`,
};

const fileExists = (path) => (file) => fs.existsSync(`${path}/${file}`);

const writeToPath = (path) => (file, content) => {
  const filePath = `${path}/${file}`;

  fs.writeFile(filePath, content, (err) => {
    if (err) throw err;
    console.log('Created file: ', filePath);
    return true;
  });
};

function createFiles(path, name) {
  const files = {
    index: `${name}.tsx`,
    test: `__tests__/${name}.js`,
    sass: `${name}.module.scss`,
    pack: 'package.json',
  };

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    fs.mkdirSync(`${path}/__tests__`);

    const writeFile = writeToPath(path);
    const toFileMissingBool = (file) => !fileExists(path)(file);
    const checkAllMissing = (acc, cur) => acc && cur;

    const noneExist = Object.values(files)
      .map(toFileMissingBool)
      .reduce(checkAllMissing);

    if (noneExist) {
      console.log(`Detected new component: ${name}, ${path}`);
      Object.entries(files).forEach(([type, fileName]) => {
        writeFile(fileName, templates[type](name));
      });
    }
  } else {
    console.log('Already exists');
    process.exit();
  }
}

if (!argv._[0]) {
  console.error('Need name of component');
  process.exit();
}

createFiles(`src/components/${argv._[0]}`, argv._[0]);
