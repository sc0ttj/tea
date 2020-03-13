tea = require("../src/tea.js")

// the app to be tested
var demoApp = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  div: (a, b) => a / b,
  foo: (a, b) => demoApp.add(a, b) * 2
}

/*
 * Follow the TAP style of NOT creating any globals, except 'tea'
 */

// tea() /* Dont init tea, then it won't register any globals */

/* OPTIONAL - set the default args directly */
tea.reportFormat = "console"
/* OPTIONAL - or parse command line arguments (if any) */
tea.getArgs()

// Begin tests, without using globals

// using TAP style assertions (but no `msg` as 3rd param to t() ..)
tea.test("test one, using tea.t", t => {
  t.equal(1, 1)
  t.strictEqual(1, "1")
  t.deepEqual([1, 2, 3], [1, 2, 3])
})

tea.test("test two, using tea.t", t => {
  t.deepEqual([1, 2, 3], [1, 2, 3])
  t.deepEqual([1, 2, 3, 4], [4, 5])
  t.deepEqual({ one: 1, foo: "baz" }, { one: 1, foo: "bar" })
  t.throws(new Error())
  t.throws("I'm just a String")
})

tea.run()
