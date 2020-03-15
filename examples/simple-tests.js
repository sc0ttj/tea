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
  sub: (a, b) => a - b,
  div: (a, b) => a / b,
  foo: (a, b) => demoApp.add(a, b) * 2
}

// Begin tests

// tests without assertions or expected parameter (not recommended for TAP output)
test("simplest test", 1 === 1)
test("simplest test fails", 1 === 2)

// tests without assertions, with an 'expected' parameter
test("simple test, 1 + 1 should be '2'", 1 + 1, 2)
test("simple test fails, 1 + 1 should be '2'", 1 + 1, 3)

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
test("test using ASSERT, description here", () => {
  assert.isType(
    "isType: demo.app is should be a function",
    demoApp.add,
    "function"
  )
  assert.strictEquals(
    "strictEquals: 1 + 1 should equal 2",
    demoApp.add(1, 1),
    2
  )
  assert.deepEquals(
    "deepEquals: obj1 should equal simple obj1",
    { foo: "bar" },
    { foo: "bar" }
  )
  var obj1 = { name: "dan", age: 22, stats: { s: 10, b: 20, c: 31 } }
  var obj2 = { name: "bob", age: 21, stats: { s: 10, b: 20, c: 30 } }
  assert.deepEquals("deepEquals: obj1 should equal obj2", obj1, obj2)

  assert.truthy("string '' is truthy", "")
  assert.truthy("string 'foo' is truthy", "foo")
  assert.falsey("false is falsey", false)
  assert.falsey("true is falsey", true)
  assert.falsey("0 is falsey", 0)
  assert.falsey("1 is falsey", 1)
  assert.falsey('"hello" is falsey', "hello")
  assert.falsey("null is falsey", null)
  assert.isMutable("Object is mutable", 10)
  assert.isImmutable("Number is immutable", { foo: 99 })
  assert.throwsError("Throws an error", "" + new Error())
  assert.throwsError("Throws an error", new Error())
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
    message: "assertion, 1 + 1 = 2, missing 'expected', assumes true",
    actual: demoApp.add(1, 1) === 2
  })
})

// using TAP style assertions (but no `msg` as 3rd param to t() ..)
test("test using t", () => {
  t.equal(1, 1)
  t.strictEqual(1, "1")
  t.deepEqual([1, 2, 3], [1, 2, 3])
  t.deepEqual([1, 2, 3], [1, 3, 4])
  t.deepEqual({ one: 1, foo: "baz" }, { one: 1, foo: "bar" })
  t.throws(new Error())
  t.throws("I'm just a String")
  t.type("I'm of type String (fails)", "function")
  t.type("I'm of type String", "string")
})

run()
