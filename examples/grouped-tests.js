tea = require("../src/tea.js")

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
  sub: (a, b) => a - b,
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

feature("Calculator", () => {
  scenario("Addition and subtraction", () => {
    test("Subtractions", () => {
      expect("1 - 1 equals 0", demoApp.sub(1, 1) === 0, true)
      expect("1 - 1 equals 1", demoApp.sub(1, 1), 1)
    })
    test("Additions", () => {
      expect("1 + 1 equals 2", demoApp.add(1, 1), 2)
      expect("1 + 1 equals 2", demoApp.add(1, 1), 3)
    })
  })

  scenario("Some mathsy scenario", () => {
    test("Dividing numbers", () => {
      expect("10 / 2 equals 5", demoApp.div(10, 2), 5)
    })
    test("Working with nonsense", () => {
      // isNaN reports its type as number, so use this:
      assert.isType("1 + 10 is a number", 1 + 10, "number")
      // 1 + "foo" returns string
      assert.isType("1 + 'foo' is not a number", 1 + "foo", "string")
      // 1 - "foo" returns isNaN
      assert.isType("1 - 'foo' is not a number", 1 - "foo", "number", false)
    })
  })
})

run()
