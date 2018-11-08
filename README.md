# NES EDITOR

The aim of this project is to create an user friendly tool to manipulate (hack) nes-rom files. The main focus is to create an quick and easy to use graphics editor with built-in support for json-based game specific config files. The config files will allow easy access to manipulate palettes, game mechanics etcetera. I'm also experimenting with integrating jsnes for being able to test the rom-hack while working on it. It might even be possible to do some kind of WYSIWYG-connection allowing for manipulating a rom while it's running. We'll see. 

The editor is built in javascript and depends on React. It's not yet particulary useful so if you're here for hacking roms there are better tools out there, at least for a few weeks or so :-).

Needless to say, the project is not endorsed by Nintendo. No roms are bundled and I will not assist in finding them. There are lot of resourses for dumping your cartridges legally.

## Tech stuff

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
