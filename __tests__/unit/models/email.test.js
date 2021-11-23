process.env.TEST_TYPE = "unit_test";

const Email = require("../../../src/models/email");
const email = new Email();

const tracker = require("mock-knex").getTracker();

tracker.install();

describe("Email model unit test", () => {
  it("Should delete emails by customer id list", async (done) => {
    const customerIdList = [1];

    tracker.on("query", function sendResult(query) {
      expect(query.method).toEqual("del");
      expect(query.bindings).toEqual(customerIdList);

      done();
    });

    await email.deleteByCustomerIdList(customerIdList);
  });
});
