# react-loadable-ts-transformer

This is an analog of the babel plugin included with react-loadable.  
The differences are:  
- transformer does not support Loadable.Map case
- moudles prop contains only relative path (as is in loader prop)

Providing opts.webpack and opts.modules for every loadable component is a lot of manual work to remember to do.

Instead you can add the ts transformer to your config and it will automate it for you:

```
const reactLoadableTransformer = require('react-loadable-ts-transformer');
config = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    getCustomTransformers: () => ({
                        before: [reactLoadableTransformer],
                    }),
                },
            },
        ],
    },
}
```

Input

```
import Loadable from 'react-loadable';

const LoadableMyComponent = Loadable({
    loader: () => import('./MyComponent'),
});
```

Output

```
import Loadable from 'react-loadable';
import path from 'path';

const LoadableMyComponent = Loadable({
    loader: () => import('./MyComponent'),
    webpack: () => [require.resolveWeak('./MyComponent')],
    modules: ['./MyComponent'],
});
```
