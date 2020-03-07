tea = require("../dist/tea.js")

tea()

/*
test.beforeEach = () => console.log("before each")
test.beforeAll = () => console.log("before all")
test.afterEach = () => console.log("after each")
test.afterAll = () => console.log("after all")
*/

// the app to be tested
var demoApp = {
  add: (a, b) => a + b,
  div: (a, b) => a / b,
  foo: (a, b) => demoApp.add(a, b) * 2
}

describe("Scenario 2: maths", () => {
  it("scenario 2, test 1, should add up the numbers:", () => {
    should("equal 2", demoApp.add(1, 1), 2)
    should("equal 2 (fails)", demoApp.add(1, 1), 3)
  })
})

given("Scenario 3: some maths", () => {
  when("we add up the numbers:", () => {
    expect("equal 2", demoApp.add(1, 1), 2)
    expect("equal 2 (fails)", demoApp.add(1, 1), 3)
  })
})

run()
