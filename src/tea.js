/* global Map:readonly, Set:readonly, ArrayBuffer:readonly */

// main test suite app
//
// @TODO:
//
// 1. DONE assert should return AssertionError, with 'expected', 'actual', 'operator' fields
//
// 2. improve Node/Browser consistency:
//   - polyfill Error.prepareStackTrace and Error.captureStackTrace
//
// 3. DONE add CLI, with these option: --fail-fast --report=tap|console|debug
//
// 4. DONE add more assertions, inc deep-equal
//
// 5. DONE more flexible syntax:
//
//   - add aliases 'feature', 'scenario', 'describe' & 'group' for test function
//
// 6. DONE add test.beforeEach(), test.beforeAll(), test.afterEach(), etc
//
// 7. support for React.. See:
//
//   - DONE https://github.com/FormidableLabs/react-fast-compare
//   - https://github.com/algolia/react-element-to-jsx-string
//   - https://gist.github.com/kolodny/f0b35a7e2c0236f7b956
//
// 8. use fs-remote to write files to filesystem from browser
//    (when running locally - fs-remote runs a server on localhost)
//
// 9. cypress-like browser UI for running tests and viewing results
//
//   - split view, tea menu on left, app to test on right
//   - in menu:
//     - button to add test (opens modal popup)
//     - button to run tests
//     - show test results in nicely formatted HTML
//
// 10. DONE refactor assertions:
//
//   a. make more DRY
//   c. assertion runner should handle adding passes/fails/total
//
// 11. tea.visit(), tea.request(), tea.$, etc (copy cypress cy.foo() stuff)
//
//   use querySelector/ajax, or phantomjs as backend, to open page and do stuff
//
// 12. DONE easier setup: in importing 'tea', it should add 'assert' etc to the
//     global scope, whatever that might be (global, window, root, parent module, etc)
//
// 13. DONE group nested tests (supprts grouping by 'scenario', 'feature', 'group', 'describe')
//
// 14. DONE implement console reporter (works in Node and Browser Dev Tools)
//
// 15. implement TAP reporter

try {
  var global = Function("return this")()
} catch (e) {
  var global = this
}

// ponyfill
Error.captureStackTrace =
  Error.captureStackTrace ||
  function(error) {
    var container = new Error()
    Object.defineProperty(error, "stack", {
      configurable: true,
      get: function getStack() {
        var stack = container.stack
        Object.defineProperty(this, "stack", {
          value: stack
        })

        return stack
      }
    })
  }

export default (tea = function() {
  // code from browser-or-node package, to detect current environment
  tea.isBrowser =
    typeof window !== "undefined" && typeof window.document !== "undefined"

  /* eslint-disable no-restricted-globals */
  tea.isWebWorker =
    typeof global === "object" &&
    global.constructor &&
    global.constructor.name === "DedicatedWorkerGlobalScope"
  /* eslint-enable no-restricted-globals */

  tea.isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null

  // parsing CLI option in Node:
  tea.getArgs = function() {
    if (typeof process === "undefined") return {}
    var args = {}
    process.argv.slice(2, process.argv.length).forEach(arg => {
      // long arg
      if (arg.slice(0, 2) === "--") {
        var longArg = arg.split("=")
        var longArgFlag = longArg[0].slice(2, longArg[0].length)
        var longArgValue = longArg.length > 1 ? longArg[1] : true
        args[longArgFlag] = longArgValue
      }
      // flags
      else if (arg[0] === "-") {
        var flags = arg.slice(1, arg.length).split("")
        flags.forEach(flag => {
          args[flag] = true
        })
      }
    })
    return args
  }

  if (tea.isBrowser) console.clear()

  tea.args = tea.isNode ? tea.getArgs() : {}

  //
  // let's start our test suite and default settings
  //
  tea.tests = []
  tea.testResults = []
  tea.passes = 0
  tea.fails = 0
  // settings
  tea.failFast = false // exit after first tests fails or not
  tea.quiet = false // if true, only show failing tests
  tea.reportFormat = "console" // choose what format to report test results
  // used to format the test results
  tea.indent = 2
  tea.indentStr = ""

  // process command-line options: allow user to override default settings
  Object.keys(tea.args).forEach(function(key) {
    var value = tea.args[key]
    switch (key) {
      case "q":
      case "quiet":
        if (value === "true" || value === true) tea.quiet = true
        break
      case "fail-fast":
      case "ff":
        if (value === "true" || value === true) tea.failFast = true
        break
      // set the output format
      case "format":
        if (value === "node") value = "console"
        if (value === "terminal") value = "console"
        if (value === "devtools") value = "console"
        tea.reportFormat = value
        break
      // print help info
      case "help":
      case "h":
        if (value) {
          console.log("\nUsage:  node path/to/tests.js [options]")
          console.log("\nOptions:\n")
          console.log("  --fail-fast        Exit after first failing test")
          console.log(
            "  --format=<name>    The style/format of the test results (console|debug|tap)"
          )
          console.log("  --quiet            Only list failing tests")
          console.log(
            "  --verbose          List the actual/expected results of passing tests too"
          )
          console.log("  --help             Show this help screen\n")
        }
        if (tea.isNode && typeof process !== "undefined") {
          process.exit(0)
        }
        break
      // do nothing
      default:
        break
    }
  })

  // holder var, used to pass the current test between test() and assert()
  tea.currentTest = {}

  // the function we use for grouping and indenting tests
  tea.scenario = function(msg, fn) {
    tea.tests.push({
      msg: msg,
      indentStr: tea.indentStr,
      group: true
    })
    tea.addIndent()
    fn()
    tea.rmIndent()
  }

  // test harness - setup the test object, add it to tests array
  tea.test = function(msg, fn, expected = "nowt") {
    tea.currentTest = {
      msg: msg,
      indentStr: tea.indentStr,
      status: "pass",
      assertions: [],
      expected: expected,
      passes: null,
      fails: null,
      total: null,
      result: null,
      stack: null,
      fn: fn
    }

    tea.currentTest.beforeAll = test.beforeAll || function() {}
    tea.currentTest.beforeEach = test.beforeEach || function() {}
    tea.currentTest.afterAll = test.afterAll || function() {}
    tea.currentTest.afterEach = test.afterEach || function() {}

    tea.tests.push(tea.currentTest)
    tea.currentTest = tea.tests[tea.tests.length - 1]
  }

  function AssertionError(message, actual, expected, operator) {
    var error = Error.call(this, message)
    error.name = "AssertionError"
    error.message = error.message
    error.stack = error.stack
    // custom properties
    error.actual = actual
    error.expected = expected
    error.operator = operator
    return error
  }

  AssertionError.prototype = Object.create(Error.prototype)
  AssertionError.prototype = Object.create
    ? Object.create(Error.prototype)
    : new Error()

  AssertionError.prototype.constructor = AssertionError

  // Assertion error to string
  AssertionError.prototype.toString = function() {
    return this.name + ": " + this.message
  }

  // our various assertion methods call this func to register passes/fails with
  // the currentTest object for our reporters to work OK..
  tea.assertHarness = function(assertion, msg, actual, expected, operator) {
    tea.assertHarness.result = null
    tea.assertHarness.operator = operator || "==="
    tea.currentTest.total += 1

    tea.assertHarness.result = assertion

    if (!tea.assertHarness.result) {
      tea.assertHarness.result = new AssertionError(
        msg,
        actual,
        expected,
        tea.assertHarness.operator
      )
      tea.currentTest.fails += 1
    } else {
      tea.currentTest.passes += 1
    }
    tea.assertHarness.stack = tea.assertHarness.result.stack

    tea.currentTest.assertions.push({
      actual,
      expected,
      operator: tea.assertHarness.operator,
      result: tea.assertHarness.result,
      msg
    })

    return tea.assertHarness.result
  }

  // runs the given assertion, records the results to current test object
  tea.expect = function(msg, fn, expected) {
    tea.expect.result = null
    tea.expect.expected = expected !== undefined ? expected : true
    tea.currentTest.total += 1

    if (typeof fn === "function") {
      try {
        tea.expect.result = fn() === tea.expect.expected
        tea.currentTest.passes += 1
      } catch (e) {
        tea.currentTest.fails += 1
        tea.expect.result = new AssertionError(
          msg,
          fn,
          tea.expect.expected,
          "boolean"
        )
      }
    } else {
      // we were given an expression
      tea.expect.result = fn === expected
      if (tea.expect.result) {
        tea.currentTest.passes += 1
      } else {
        tea.currentTest.fails += 1
        tea.expect.result = new AssertionError(
          msg,
          fn,
          tea.expect.expected,
          "boolean"
        )
      }
    }

    tea.currentTest.assertions.push({
      actual: typeof fn === "function" ? fn() : fn,
      expected: tea.expect.expected,
      operator: "boolean",
      result: tea.expect.result,
      msg
    })

    return tea.expect.result
  }

  // react-compatible deep equals function (from react-fast-compare@3.0.1)
  tea.deepEquals = function(a, b) {
    if (a === b) return true

    // START: fast-deep-equal es6/index.js 3.1.1
    var hasElementType = typeof Element !== "undefined"
    var hasMap = typeof Map === "function"
    var hasSet = typeof Set === "function"
    var hasArrayBuffer = typeof ArrayBuffer === "function"

    if (a && b && typeof a == "object" && typeof b == "object") {
      if (a.constructor !== b.constructor) return false

      var length, i, keys
      if (Array.isArray(a)) {
        length = a.length
        if (length != b.length) return false
        for (i = length; i-- !== 0; )
          if (!tea.deepEquals(a[i], b[i])) return false
        return true
      }

      // START: Modifications:
      // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
      //    to co-exist with es5.
      // 2. Replace `for of` with es5 compliant iteration using `for`.
      //    Basically, take:
      //
      //    ```js
      //    for (i of a.entries())
      //      if (!b.has(i[0])) return false;
      //    ```
      //
      //    ... and convert to:
      //
      //    ```js
      //    it = a.entries();
      //    while (!(i = it.next()).done)
      //      if (!b.has(i.value[0])) return false;
      //    ```
      //
      //    **Note**: `i` access switches to `i.value`.
      var it
      if (hasMap && a instanceof Map && b instanceof Map) {
        if (a.size !== b.size) return false
        it = a.entries()
        while (!(i = it.next()).done) if (!b.has(i.value[0])) return false
        it = a.entries()
        while (!(i = it.next()).done)
          if (!tea.deepEquals(i.value[1], b.get(i.value[0]))) return false
        return true
      }

      if (hasSet && a instanceof Set && b instanceof Set) {
        if (a.size !== b.size) return false
        it = a.entries()
        while (!(i = it.next()).done) if (!b.has(i.value[0])) return false
        return true
      }
      // END: Modifications

      if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        length = a.length
        if (length != b.length) return false
        for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false
        return true
      }

      if (a.constructor === RegExp)
        return a.source === b.source && a.flags === b.flags
      if (a.valueOf !== Object.prototype.valueOf)
        return a.valueOf() === b.valueOf()
      if (a.toString !== Object.prototype.toString)
        return a.toString() === b.toString()

      keys = Object.keys(a)
      length = keys.length
      if (length !== Object.keys(b).length) return false

      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
      // START: react-fast-compare:
      // enable custom handling for DOM elements
      if (hasElementType && a instanceof Element) return false
      // enable custom handling for React
      for (i = length; i-- !== 0; ) {
        if (keys[i] === "_owner" && a.$$typeof) {
          // React-specific: avoid traversing React elements' _owner.
          //  _owner contains circular references
          // and is not needed when comparing the actual elements (and not their owners)
          // .$$typeof and ._store on just reasonable markers of a react element
          continue
        }

        // all other properties should be traversed as usual
        if (!tea.deepEquals(a[keys[i]], b[keys[i]])) return false
      }
      // END: react-fast-compare
      return true
    }

    return a !== a && b !== b
  }
  // end fast-deep-equal

  // wrapper around tea.deepEquals
  tea.isEqual = function(a, b) {
    try {
      return tea.deepEquals(a, b)
    } catch (error) {
      if ((error.message || "").match(/stack|recursion/i)) {
        // warn on circular references, don't crash
        // browsers give this different errors name and messages:
        // chrome/safari: "RangeError", "Maximum call stack size exceeded"
        // firefox: "InternalError", too much recursion"
        // edge: "Error", "Out of stack space"
        console.warn("tea.isEqual() cannot handle circular refs")
        return false
      }
      // some other error. we should definitely know about these
      throw error
    }
  }

  // function that accepts an object containing 'msg', actual', 'expected'
  tea.assert = function(options = {}) {
    return tea.assertHarness(
      options.actual === (options.expected || true),
      options.message,
      options.actual,
      options.expected || true,
      options.operator || "==="
    )
  }

  tea.assert.deepEquals = function(msg, a, b) {
    return tea.assertHarness(tea.isEqual(a, b), msg, a, b, "deep equals")
  }

  tea.assert.equals = function(msg, a, b) {
    return tea.assertHarness(a == b, msg, a, b, "==")
  }

  tea.assert.eq = tea.assert.equals

  tea.assert.strictEquals = function(msg, a, b) {
    return tea.assertHarness(a === b, msg, a, b, "===")
  }

  tea.assert.isType = function(msg, a, b) {
    return tea.assertHarness(
      typeof a === b,
      msg,
      typeof a,
      typeof b,
      "typeof " + b
    )
  }

  tea.assert.truthy = function(msg, a, b) {
    return tea.assertHarness(!!a, msg, a, "truthy", "Truthy")
  }

  tea.assert.falsey = function(msg, a, b) {
    return tea.assertHarness(!a, msg, a, "falsey", "Falsey")
  }

  // from: react/packages/shared/ReactSymbols.js
  //   The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  //   nor polyfill, then a plain number is used for performance.
  var hasSymbol = typeof Symbol === "function" && Symbol.for
  tea.REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 0xeac7

  tea.assert.isReactElement = function(msg, a, b) {
    return tea.assertHarness(
      typeof a === "object" &&
        a !== null &&
        a.$$typeof === tea.REACT_ELEMENT_TYPE,
      msg,
      typeof a,
      "typeof ReactElement",
      "isReactElement"
    )
  }

  // https://stackoverflow.com/questions/4402272/checking-if-data-is-immutable
  tea.isMutable = function(a) {
    return a && (typeof a == "object" || typeof a == "function")
  }

  tea.assert.isMutable = function(msg, a, b) {
    return tea.assertHarness(
      tea.isMutable(a),
      msg,
      typeof a,
      "mutable object",
      "isMutable"
    )
  }

  tea.assert.isImmutable = function(msg, a, b) {
    return tea.assertHarness(
      tea.isMutable(a) === false,
      msg,
      typeof a,
      "immutable object",
      "isImmutable"
    )
  }

  tea.assert.throwsError = function(msg, a, b) {
    return tea.assertHarness(
      a instanceof Error,
      msg,
      a instanceof Error,
      true,
      "throwsError"
    )
  }

  // TAP (Test Anything Protocol) style assertions
  tea.t = {}
  tea.t.plan = function() {
    return true
  }
  tea.t.ok = function(actual) {
    return tea.assert.truthy(actual + " is truthy", actual, true)
  }
  tea.t.notOk = function(actual) {
    return tea.assert.falsey(actual + " is falsey", actual, true)
  }
  tea.t.equal = function(actual, expected) {
    return tea.assert.equals(actual + " == " + expected, actual, expected)
  }
  tea.t.strictEqual = function(actual, expected) {
    return tea.assert.strictEquals(
      actual + " === " + expected,
      actual,
      expected
    )
  }
  tea.t.deepEqual = function(actual, expected) {
    return tea.assert.deepEquals(
      typeof actual + " deep equals " + typeof expected,
      actual,
      expected
    )
  }
  tea.t.throws = function(actual, expected) {
    return tea.assert.throwsError("throws Error: " + actual, actual, expected)
  }

  // diff method to show only the changes between 2 objects
  // From: https://vanillajstoolkit.com/helpers/diff/
  tea.diff = function(obj1, obj2) {
    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== "[object Object]") {
      return obj1
    }

    var diffs = {}
    var key

    var arraysMatch = function(arr1, arr2) {
      // Check if the arrays are the same length
      if (arr1.length !== arr2.length) return false
      // Check if all items exist and are in the same order
      for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
      }
      // Otherwise, return true
      return true
    }

    var compare = function(item1, item2, key) {
      // Get the object type
      var type1 = Object.prototype.toString.call(item1)
      var type2 = Object.prototype.toString.call(item2)
      // If type2 is undefined it has been removed
      if (type2 === "[object Undefined]") {
        diffs[key] = null
        return
      }
      // If items are different types
      if (type1 !== type2) {
        diffs[key] = item2
        return
      }
      // If an object, compare recursively
      if (type1 === "[object Object]") {
        var objDiff = tea.diff(item1, item2)
        if (Object.keys(objDiff).length > 0) {
          diffs[key] = objDiff
        }
        return
      }
      // If an array, compare
      if (type1 === "[object Array]") {
        if (!arraysMatch(item1, item2)) {
          diffs[key] = item2
        }
        return
      }
      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (type1 === "[object Function]") {
        if (item1.toString() !== item2.toString()) {
          diffs[key] = item2
        }
      } else {
        if (item1 !== item2) {
          diffs[key] = item2
        }
      }
    }
    // Compare our objects:
    // - Loop through the first object
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        compare(obj1[key], obj2[key], key)
      }
    }
    // - Loop through the second object and find missing items
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (!obj1[key] && obj1[key] !== obj2[key]) {
          diffs[key] = obj2[key]
        }
      }
    }
    // Return the object of differences
    return diffs
  }

  // run each test, record each test and its results to testResults array
  tea.run = function() {
    var start = new Date().getTime()

    // reset results
    tea.currentTest = {}
    tea.testResults = []
    tea.assertions = []
    tea.passes = 0
    tea.fails = 0

    if (typeof test.beforeAll === "function") test.beforeAll()

    tea.tests.forEach(test => {
      // reset assertions for this test
      test.assertions = []
      // set current
      tea.currentTest = test
      if (typeof test.beforeEach === "function") {
        test.beforeEach()
      }

      // if a 3rd param (expected) was given, run the test against the expected value
      if (test.expected !== "nowt") {
        var testResult = typeof test.fn === "function" ? test.fn() : test.fn
        if (testResult !== test.expected) {
          var theError = new AssertionError(
            test.msg,
            test.fn,
            test.expected,
            "==="
          )
          test.passes = 0
          test.fails = 1
          test.total = 1
          test.status = "FAIL"
          test.result = theError
          test.stack = theError.stack
          test.assertions = [
            {
              msg: test.msg,
              actual: testResult,
              expected: test.expected,
              operator: "===",
              result: new Error(test.msg)
            }
          ]
        } else {
          test.passes = 1
          test.fails = 0
          test.total = 1
          test.status = "pass"
          ;(test.result = true),
            (test.assertions = [
              {
                msg: test.msg,
                actual: testResult,
                expected: test.expected,
                operator: "===",
                result: true
              }
            ])
        }

        // test has no 'expected' param
      } else {
        if (typeof test.fn === "function") {
          try {
            // run the func containing the assertions
            test.fn(tea.expect)
          } catch (e) {
            test.result = e
            tea.log.fail("ERROR IN TEST", " '" + test.msg + "'")
            console.error({
              msg: test.msg,
              result: e
            })
            if (tea.isNode) process.exit()
          }
        } else {
          // no assertion method used..
          this.result = test.fn
          if (!!this.result) {
            test.total += 1
            test.passes += 1
            test.assertions.push({
              result: this.result,
              msg: test.msg
            })
          } else {
            var err = new Error(test.msg)
            test.total += 1
            test.fails += 1
            test.assertions.push({
              result: err,
              msg: test.msg
            })
          }
        }
      }

      // get list of assertion failures in this test,
      var failures = test.assertions.filter(
        assertion => assertion.result !== true
      )
      // and assign the first failing assertion to the test result and stack trace
      if (failures.length > 0) {
        test.status = "FAIL"
        test.result = failures[0].result
      }

      // dont log groups as failed tests
      if (test.group === true) {
        test.fails -= 1
        test.result = ""
        test.status = "pass"
      }

      // report the results
      tea.report([test])

      if (typeof test.afterEach === "function") test.afterEach()

      // add to testResults object (reportSummary uses it)
      if (!test.group) {
        tea.testResults.push(test)
      }

      // if --fail-fast was given, exit after the first failed test
      if (tea.failFast === true && test.status === "FAIL" && !test.group) {
        tea.timeTaken = new Date().getTime() - start
        tea.reportSummary()
        if (tea.isNode) {
          process.exit()
        } else {
          throw new Error("test failed!")
        }
      }
    })

    // all tests now finished...
    if (typeof test.afterAll === "function") test.afterAll()
    tea.currentTest = {}
    tea.assertHarness.stack = null
    tea.timeTaken = new Date().getTime() - start
    tea.reportSummary()
  }

  tea.addIndent = function() {
    for (var i = 0; i < tea.indent; i++) {
      tea.indentStr += " "
    }
  }

  tea.rmIndent = function() {
    for (var i = 0; i < tea.indent; i++) {
      tea.indentStr = tea.indentStr.slice(0, -1)
    }
  }

  // logger: supports styled (colours and bold) text in both DevTools and terminals
  //  - based on https://jackcrane.github.io/static/cdn/jconsole.js
  //  - added support for NodeJS - uses ANSI colours
  tea.log = function(arg) {
    console.log(arg)
  }
  tea.log.header = function(arg) {
    tea.isNode
      ? console.log("\x1b[33;1m" + arg + "\x1b[0m")
      : console.log("%c" + arg, "font-size:1.25em;font-weight: bold;")
  }
  tea.log.pass = function(arg, arg2) {
    tea.isNode
      ? console.log("\x1b[38;05;34;1m" + arg + "\x1b[0m" + arg2)
      : console.log(
          "%c" + arg + "%c" + arg2,
          "color:green;font-weight: bold;",
          "color:initial;font-weight:normal;"
        )
  }
  tea.log.fail = function(arg, arg2) {
    tea.isNode
      ? console.log("\x1b[31;1m" + arg + "\x1b[0m" + arg2)
      : console.log(
          "%c" + arg + "%c" + arg2,
          "color:red;font-weight: bold;",
          "color:initial;font-weight:normal;"
        )
  }
  tea.log.bold = function(arg) {
    tea.isNode
      ? console.log("\x1b[1m" + arg + "\x1b[0m")
      : console.log("%c" + arg, "font-weight: bold;")
  }

  // this summary is appended to end of results, and printed once, at end of tests
  tea.reportSummary = function() {
    if (tea.reportFormat === "tap") {
      var fails = []
      tea.testResults.forEach(test => {
        if (test.status === "FAIL") return fails.push(test.msg)
      })

      var passes = []
      tea.testResults.forEach(test => {
        if (test.status !== "FAIL") return passes.push(test.msg)
      })
      console.log("\n")
      console.log("1.." + tea.testResults.length)
      console.log("# tests " + tea.testResults.length)
      console.log("# pass " + passes.length)
      console.log("# fail " + fails.length)
    } else {
      console.log("-------------------------")
      tea.log("Total tests:  " + tea.testResults.length)
      tea.log("Total time:   " + tea.timeTaken + "ms")
      console.log("-------------------------")
    }
  }

  // format the results, then report in given format
  tea.report = function(testResults) {
    var results = []
    var format = tea.reportFormat || "console"

    // re-format results (keep only bits we want)
    testResults.forEach(result => {
      results.push({
        group: result.group || false,
        msg: result.msg,
        indentStr: result.indentStr,
        status: result.status || "Unknown!",
        assertions: result.assertions || "",
        passes: result.passes || 0,
        fails: result.fails || 0,
        result: result.result || "ok"
      })
    })

    // output using ANSI colours (terminal), or CSS colours (Dev Tools)
    if (format === "console") tea.reportConsole(results)
    // output TAP format
    if (format === "tap") tea.reportTap(results)
    // output console.table
    if (format === "debug") tea.reportDebug(results)
  }

  tea.reportConsole = function(testResults) {
    testResults.forEach((test, n) => {
      var failed = test.assertions.filter((assertion, i) => {
        return assertion.result.toString().indexOf("Error") !== -1
      })

      var newline = ""

      // only print the test header if we have results to print
      if ((tea.quiet === true && failed.length > 0) || tea.quiet === false) {
        tea.log.header(test.indentStr + test.msg)
        newline = " "
      }

      test.assertions.forEach((assertion, i) => {
        assertionFailed = false
        if (assertion.result.toString().indexOf("Error") !== -1) {
          assertionFailed = true
        }

        // if --quiet, and no failures, skip reporting the passes
        if (assertionFailed === false && tea.quiet) return

        // only print any results if an actual test with results (and not just a group)
        if (!test.group) {
          if (assertionFailed === false) {
            tea.log.pass(test.indentStr + "  ✔ PASS", ": " + assertion.msg)
          } else {
            tea.log.fail(test.indentStr + "  ✘ FAIL", ": " + assertion.msg)
          }
        }

        // show expected/actual fields for failed assertions:
        if (
          assertionFailed === true ||
          tea.args.verbose === true ||
          tea.args.v
        ) {
          var actual = JSON.stringify(assertion.actual)
          var expected = JSON.stringify(assertion.expected)

          if (typeof assertion.expected !== "undefined") {
            tea.log(test.indentStr + "    expected:  " + expected)
          }
          if (typeof assertion.actual !== "undefined") {
            if (expected !== actual) {
              // if comparing objects or arrays, show a diff
              if (
                (typeof assertion.expected === "object" ||
                  typeof assertion.expected === "array") &&
                (typeof assertion.actual === "object" ||
                  typeof assertion.actual === "array")
              ) {
                var theDiff = tea.diff(assertion.expected, assertion.actual)
                tea.log.bold(
                  test.indentStr + "    diff:      " + JSON.stringify(theDiff)
                )
              } else {
                // else, show the actual value (bold)
                tea.log.bold(test.indentStr + "    actual:    " + actual)
              }
            } else {
              // expected and actual value (not bold)
              tea.log(test.indentStr + "    actual:    " + actual)
            }
          }
        }
      })
      if (newline === " ") tea.log(newline)
    })
  }

  tea.reportTap = function(testResults) {
    console.log("")
    testResults.forEach((test, n) => {
      console.log("# " + test.msg)

      var failed = test.assertions.filter((assertion, i) => {
        return assertion.result.toString().indexOf("Error") !== -1
      })

      test.assertions.forEach((assertion, i) => {
        var q = i + 1
        assertionFailed = false
        if (assertion.result.toString().indexOf("Error") !== -1) {
          assertionFailed = true
        }

        // if --quiet, and no failures, skip reporting the passes
        if (assertionFailed === false && tea.quiet) return

        // only print any results if an actual test with results (and not just a group)
        if (!test.group) {
          if (assertionFailed === false) {
            console.log("ok " + q + " " + assertion.msg)
          } else {
            console.log("not ok " + q + " " + assertion.msg)
          }
        }

        // show expected/actual fields for failed assertions:
        if (
          assertionFailed === true ||
          tea.args.verbose === true ||
          tea.args.v
        ) {
          var actual = JSON.stringify(assertion.actual)
          var expected = JSON.stringify(assertion.expected)
          tea.log(" ---")
          tea.log("  operator: " + assertion.operator)
          tea.log("  expected: " + expected)
          tea.log("  actual:   " + actual)
          tea.log(" ...\n")
        }
      })
    })
  }

  tea.reportDebug = function(testResults) {
    if (tea.isNode) {
      testResults.forEach(result => {
        if (result.group) return
        if (tea.quiet && result.result === "ok") return
        console.log(result.msg)
        console.log("  passes:     " + result.passes)
        console.log("  fails:      " + result.fails)
        console.log("  status:     " + result.status)
        console.log("  assertions: \n ", result.assertions)
        console.log("\n")
      })
    } else {
      testResults.forEach(result => {
        if (result.group === true) return
        if (tea.quiet === true && result.result === "ok") return
        console.table({
          test: {
            msg: result.msg,
            status: result.status || "Unknown!",
            assertions: result.assertions || "",
            passes: result.passes || 0,
            fails: result.fails || 0,
            result: result.result || "ok"
          }
        })
      })
    }
  }

  global.scenario = tea.scenario
  global.group = tea.scenario
  global.feature = tea.scenario
  global.test = tea.test
  global.expect = tea.expect
  global.assert = tea.assert
  global.t = tea.t
  global.run = tea.run
  // syntax like jasmine, mocha, chai
  global.describe = tea.scenario
  global.it = tea.test
  global.should = tea.expect
  // generic BDD like Gherkin
  global.given = tea.scenario
  global.when = tea.test
  global.then = tea.expect
  // return main
  global.tea = tea

  return tea
})
