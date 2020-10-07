**Steps to running the app**

1. Clone the app to your local machine
2. run yarn install to install all dependencies (if you are using npm, delete the yarn lock file and run npm install)
3. run npm test or yarn test depending on what you are using to run the available test for the programme.

**Note:** After every test suite, the json file record is reset. You can always run the app via index.js in the root folder and play around with different values and calling any of the methods you deem fit.

**Suboptimal Design Implementation Decision**
I was unable to read the environment from the environment variable, hence, I had to make the test environement and the main enviroment read and write to the same file but have to clear the file before and after every test suite.