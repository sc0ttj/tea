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

// begin tests

// tests without assertions
test("simplest test, 1 === 1", 1 === 1)
test("simplest failing test, 1 === 1", 1 === 2)
test("simple test, 1+1 === 2", demoApp.add(1, 1) === 2)
test("simple test, with expected '2'", demoApp.add(1, 1), 2)

// tests using the 'expect' assertion method
test("test using expect, description here", () => {
  expect("1 + 1 should equal 2 is true", demoApp.add(1, 1) === 2, true)
  expect("1 + 1 should equal 2", demoApp.add(1, 1), 2)
  expect("1 + 1 should equal 2 fails", demoApp.add(1, 1), 3)
  expect("10 divided by 2 should equal 5", demoApp.div(10, 2), 5)
  expect("10 divided by 2 should equal 6", demoApp.div(10, 2), 6)
  expect("1 + 1 * 2  should equal 4", demoApp.foo(1, 1), 4)
  expect("demoApp.c should be undefined", typeof demoApp.c, "undefined")
})

//
// tests using the 'assert' assertion method
test("test using assert, description here", () => {
  assert.isType("demo.app is should be a function", demoApp.add, "function")
  assert.isString("foo should be a String", "foo", true)
  assert.isFunction("demo.app is should be a function", demoApp.add, true)
  assert.eq("1 should equal 1", 1, 1)
  assert.eq("1 + 1 should equal 2", demoApp.add(1, 1), 2)
  assert.equals(
    "simple obj1 should equal simple obj1",
    { foo: "bar" },
    { foo: "bar" }
  )
  var obj1 = { name: "dan", age: 22, stats: { s: 10, b: 20, c: 31 } }
  var obj2 = { name: "bob", age: 21, stats: { s: 10, b: 20, c: 30 } }
  assert.isEqual("obj1 should equal obj2", obj1, obj2)
})

//
// tests using 'assert' object syntax assertion method
test("test using assert, object syntax", () => {
  assert({
    message: "10 should equal 10",
    expected: 10,
    actual: demoApp.add(5, 5)
  })
  assert({
    message: "10 should equal 10 ...",
    expected: true,
    actual: demoApp.add(5, 5) === 10
  })
  assert({
    message: "11 should equal 11",
    expected: 11,
    actual: demoApp.add(5, 10)
  })
  assert({
    message: "assertion, missing 'expected', assumes true",
    actual: demoApp.add(1, 1) === 2
  })
})

run()
