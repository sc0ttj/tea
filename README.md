<p align="center">
  <img align="center" src="https://i.imgur.com/dJNqq7u.png" alt="Tea logo" />
  <h1 align="center">
    <b>Tea</b>
  </h1>
    <p align="center"><i>"Test environment application"</i><p>
</p>

**Tea** is a software testing suite, similar to `tape`, `jasmine`, `jest`, `cypress`, etc, but much smaller, more lightweight, and with fewer features.

## Features

- fast, lightweight, minimal code (~4kb minified and gzipped)
- very little setup, a fairly complete solution
- includes assertions, test harness, test runner, test reporter
- flexible syntax for writing your tests
- report results in various formats (console, devtools, TAP, debug)
- works everywhere:
  - Browsers - show test results in the DevTools console
  - NodeJS - show test results in the terminal
  - CI environments - show results in the terminal
- support a range of tests and testing approaches:
  - BDD
  - TDD
  - unit tests
  - integrations tests
  - end to end tests
- supports the following CLI options:
  - `--fail-fast`: exit after the first failing test
  - `--quiet`: only show failing tests
  - `--verbose`: show expected/actual for all tests (including passing tests)
  - `--format=console|tap|debug`: the format of the test results

## Installation

Install `tea` as a development dependency:

```console
npm install @scottjarvis/tea --save-dev
```

### Setup

Create a folder for your test files:

```console
mkdir ./tests
```

Create a file to contain your tests:

```console
touch ./tests/mytests.js
```

## Usage

Initialise `tea` in `tests/mytests.js`:

```js
tea = require('tea');

tea()  /* initialise tea by running it */

// add test stuff here

```

### Adding tests

`tea` has builtin-in assertion methods, but you don't even need to use them - tests can be as simple as an expression.

Lets add some tests, so you have this in `tests/mytests.js`:

```js
tea = require('tea');

tea()  /* initialise tea by running it */

/*   Optionally define some test hooks..
 test.beforeEach = () => console.log("before each")
 test.beforeAll  = () => console.log("before all")
 test.afterEach  = () => console.log("after each")
 test.afterAll   = () => console.log("after all")
 */

// tests without assertions
test("simplest test, 1 === 1", 1 === 1)
test("simplest test, 1 === 1", 1 === 2)

// tests without assertions, with an 'expected' parameter
test("simple test, 1+1 expected '2'", 1+1, 2)
test("simple test, 1+1 expected '2'", 1+1, 2)

// run the tests
run()
```

### Using assertions

You can of course use assertions, instead of simple expressions.

The following assertions are built into `tea`:

- `assert`
- `expect`
- `should` (alias of expect)
- `t`

#### Using `expect`

Usage:

```js
expect(msg, actual, expected)
```

Examples:

```js
/* tests using the 'expect' assertion method */

test("test using expect, description here", () => {
  expect("1 + 1 should equal 2 is true", app.add(1, 1) === 2, true)
  expect("1 + 1 should equal 2", app.add(1, 1), 2)
  expect("app.c should be undefined", typeof app.c, "undefined")
})

// run the tests
run()
```

#### Using `assert`

Usage:

```js
assert.foo(msg, actual, expected)
```

Where `foo` can be any of these methods:

- `assert.truthy()` - checks if something is truthy
- `assert.falsey()` - checks if something is falsey
- `assert.eq()` - uses the `==` comparison (alias of `assert.equals()`)
- `assert.strictEquals()` - uses the `===` comparison
- `assert.deepEquals()` - uses the `react-fast-compare` deep equals comparison
- `assert.isType()` - uses a `typeof` comparison
- `assert.throwsError()` - checks if something throws an Error
- `assert.isImmutable()` - checks if something is a Boolean, Number, String, Null
- `assert.isMutable()` - checks if something is an Object, Array, Function, Class, Map, or Set
- `assert.isReactElement()` - checks object contains `$$typeof = REACT_ELEMENT_TYPE`

Examples:

```js
/* tests using the 'assert' assertion method */

test("test using assert, description here", () => {
  assert.isType("app.add should be a function", app.add, "function")
  assert.isType("[1,2,3] should be an array", [1,2,3], "array")
  assert.equals("1 should equal 1", 1, 1)
  assert.strictEquals("1 + 1 should equal 2", app.add(1, 1), 2)
  assert.deepEquals(
    "simple obj1 should equal simple obj1",
    { foo: "bar" },
    { foo: "bar" }
  )
  var obj1 = { name: "dan", age: 22, stats: { s: 10, b: 20, c: 31 } }
  var obj2 = { name: "bob", age: 21, stats: { s: 10, b: 20, c: 30 } }
  assert.deepEquals("obj1 should equal obj2", obj1, obj2)

  assert.truthy("string '' is truthy", "")
  assert.truthy("string 'foo' is truthy", "foo")
  assert.falsey("0 is falsey", 0)
  assert.falsey("1 is falsey", 1)
  assert.falsey("null is falsey", null, true)
  assert.isMutable("Object is mutable", 10)
  assert.isImmutable("Number is immutable", { foo: 99 })
  assert.throwsError("Throws an error", "" + new Error())
  assert.throwsError("Throws an error", new Error())
})

// run the tests
run()
```

#### Using `assert` (object syntax)

The `assert` method can also passed an object.

Usage:

```js
assert({
  message: "some string",
  actual: foo,
  expected: bar,
})
```

Examples:

```js
/* tests using 'assert' with object syntax */

test("test using assert, object syntax", () => {
  assert({
    message: "10 should equal 10",
    expected: 10,
    actual: app.add(5, 5)
  })
  assert({
    message: "10 should equal 10 ...",
    expected: true,
    actual: app.add(5, 5) === 10
  })
  assert({
    message: 'assertion should assume expected=true (missing "expected" field)',
    actual: app.add(1, 1) === 2
  })
})

// run the tests
run()
```

#### Using `t`

Usage:

```js
t.foo(actual [, expected])
```

Where `foo` can be any of these methods:

- `t.ok()` - checks if something is truthy
- `t.notOk()` - checks if something is falsey
- `t.equal()` - uses the `==` comparison
- `t.strictEqual()` - uses the `===` comparison
- `t.deepEqual()` - uses the `react-fast-compare` deep equals comparison
- `t.throws()` - checks if something throws an error

(Note the difference to `tap` and `tape` - there's no `msg` as the third parameter)


```js
/* using TAP style assertions */

test("test using t", () => {
  t.equal(1, 1)
  t.strictEqual(1, "1")
  t.deepEqual([1, 2, 3], [1, 2, 3])
  t.deepEqual([1, 2, 3], [1, 3, 4])
  t.deepEqual({ one: 1, foo: "baz" }, { one: 1, foo: "bar" })
  t.throws(new Error())
  t.throws("I'm just a String")
})
```

## Running your tests

Now you're ready to run your tests:

```console
node tests/mytests.js
```

You should see (something like) this:

<p align="center">
  <img src="https://i.imgur.com/d23VMgu.png" alt="test results" />
</p>

## Advanced usage

```
Usage:  node path/to/tests.js [options]

Options:

  --fail-fast        Exit after first failing test
  --format=<name>    The style/format of the test results (console|debug|tap)
  --quiet            Only list failing tests
  --verbose          List the actual/expected results of passing tests too
  --help             Show this help screen

```

### TAP output

To show test results in [TAP](https://testanything.org/tap-version-13-specification.html) format, use `--format=tap` on the command-line (or `tea.reportFormat = 'tap'` if in the browser/DevTools).

The TAP format is machine-readable, and you can pipe the results to other programs, to prettify it.

These TAP prettifiers work OK with the TAP output of `tea`:

- [tap-difflet](https://github.com/namuol/tap-difflet)
- [tap-diff](https://github.com/axross/tap-diff)
- [tap-nyan](https://github.com/calvinmetcalf/tap-nyan)

### BDD style tests

Tests can be grouped arbitrarily, using the `group` function. Example:

```js
/* group tests using the 'group' function */

group("First group of tests", () => {
  test("some message", () => {
    assert.strictEquals("one should equal one", 1, 1)
  })
  test("some message", () => {
    assert.strictEquals("one should equal one", 1, 1)
  })
})
```
The `group` function has these aliases: `feature`, `scenario`, `describe` and `given`.

The `test` function also has these aliases: `it` and `when`.

This means you can group your tests however you like, and write them in a number of styles:

```js
/* jasmine or mocha style tests */

describe("Scenario: maths", () => {
  it("should add up the numbers:", () => {
    expect("1 + 1 equals 2", app.add(1, 1), 2)
    expect("1 + 1 equals 2 (fails)", app.add(1, 1), 3)
  })
})


/* some (made-up) gherkin style tests */

given("Scenario 3: some maths", () => {
  when("we add up the numbers:", () => {
    should("equal 2", app.add(1, 1), 2)
    should("equal 2 (fails)", app.add(1, 1), 3)
  })
})


/* larger BDD/gherkin/cucumber style tests */

feature("Calculator", () => {

  scenario("Addition and subtraction", () => {
    test("Additions", () => {
      expect("1 + 1 equals 2", app.add(1, 1), 2)
    })
    test("Subtractions", () => {
      expect("1 - 1 equals 2", app.sub(1, 1), 0)
    })
  })

  scenario("Dividing numbers", () => {
    test("Dividing numbers", () => {
      expect("10 / 2 equals 5", app.div(10, 2), 5)
    })
    test("Dividing nonsense", () => {
      expect("1 - 'foo' equals NaN", app.sub(1, 'foo'), NaN)
    })
  })

})

```

The test results output will be indented appropriately, like so:

<p align="center">
  <img src="https://i.imgur.com/bfHl4tO.png" alt="grouped and indented test results" />
</p>

## Integration tests

### Running in a real browser

If setting up a headles browser is too much work, you can use `tea` to test stuff in a real page, using a regular old `<script>` tag:

```html
<script src="https://unpkg.com/@scottjarvis/tea"></script>
<script>

  tea() // init tea

  test("check text in page", function(){
    var el = document.getElementById('#myElem')
    assert.strictEquals("elem contains correct text", el.innerText, "expected text")
  })

  run() // run tests

</script>
```

You can even copy and paste `dist/tea.umd.js` into the DevTools console directly! ...Then just write/paste some tests in the console and call `run()`.

**NOTE**:

In the browser, passing command-line options like `--quiet` won't work, but you can set `tea.quiet = true`, `tea.args.verbose = true`, and `tea.failFast = true` in the DevTools directly, and then call `run()`.

You'll be able to see the test results in the DevTools:

<p align="center">
  <img src="https://i.imgur.com/bQ7auuy.png" alt="test results shown in DevTools" />
</p>

### Running in a headless browser

You might want to test your app in a real browser, without having to use `<script>` tags and the DevTools. Or, you might need to run tests in a real browser on a system that has no desktop - such as a continuous integration (CI) environment.

For these cases, you can use a 'headless browser'.

To do so, it's recommended to use [GhostJS](https://github.com/KevinGrandon/ghostjs) with `tea`. Install it like so:

```console
npm i ghostjs --save-dev
```

[GhostJS](https://github.com/KevinGrandon/ghostjs) is a wrapper around the following headless browsers: `phantomjs`, `chrome`, `slimerJS` (FireFox).

It enables a nice syntax when dealing with headless browsers.

However, since `ghostjs` uses async/await you'll also need use `babel` to run your tests. At a minimum you should install these packages:

```console
npm install babel-preset-es2015 --save-dev
npm install babel-preset-stage-0 --save-dev
```
In a file named `.babelrc` (in the root/top-level folder of your project):

```json
{
  "presets": ["es2015", "stage-0"]
}
```

You can then use `ghostjs` async/await stuff inside your tests:

```js
tea = require('tea');
ghost = require('ghostjs');

tea() // init tea

test("check the page loaded OK", async () => {
  // Get page title
  await ghost.open('http://google.com')
  let pageTitle = await ghost.pageTitle()
  assert.strictEquals(pageTitle, 'Google')

  // Get the content of the body
  let body = await ghost.findElement('body')
  assert.strictEquals(await body.isVisible(), true)
})

...

```

Run your GhostJS enabled tests like so:

```console
ghostjs --browser phantom tests/*.js
```

NOTE: you can replace 'phantom' with 'chrome' or 'firefox'.

## Making changes to `tea`

Look in `src/tea.js`, make any changes you like.

Rebuild the bundles in `dist/` using this command: `npm run build`

## To do

- Add `skip.test(...)` to easily skip tests
- Add more assertions:
  - `assert.matchesRegex` - ensure `foo` matches a regex `assert.regex(msg, regex, expected)`
  - etc
- Document testing of the following:
  - React components (see https://reactjs.org/docs/test-utils.html#shallow-rendering)
  - Preact components (also see shallow rendering)
- Add simple, built-in integration testing support:
  - include wrapper/support for PhantomJS (see `node-phantomjs-simple`)
  - bundle phantomjs (32bit and 64bit builds)
- Add better stack traces - resolve them and cut out the irrelevant stuff

## Acknowledgements

- [microbundle](https://www.npmjs.com/package/microbundle) - used to bundle `tea` into various builds (in `dist/`)
- [react-fast-compare](https://github.com/FormidableLabs/react-fast-compare) - the deep equals function used in `tea`
- [fast-deep-equals](https://github.com/epoberezkin/fast-deep-equal) - a faster alternative to the above
- [hyperon](https://github.com/i-like-robots/hyperons) - borrowed functions for checking for React components in `tea`
- [ghostjs](https://github.com/KevinGrandon/ghostjs) - a nice API for handling headless browsers
- [nightmareJS](https://github.com/segmentio/nightmare) - a nice alternative to GhostJS that uses Electron as it's headless browser
