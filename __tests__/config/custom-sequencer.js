const TestSequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    const orderPath = [
      "health-router.test.js",
      "customer-router.test.js",
      "email-router.test.js",
      "phone-router.test.js",
      "address-router.test.js",
      "vehicle-router.test.js",
      "businesspartner-router.test.js",
      //   "email.test.js",
    ];
    const testsInOrder = [];
    const copyTests = Array.from(tests);

    for (let i = 0; i < orderPath.length; i++) {
      for (let j = 0; j < copyTests.length; j++) {
        const testSplit = copyTests[j].path.split("/");
        const testFile = testSplit[testSplit.length - 1];

        if (testFile === orderPath[i]) {
          testsInOrder.push(copyTests[j]);
        }
      }
    }

    return testsInOrder;
  }
}

module.exports = CustomSequencer;
